import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User, { toPublicUser } from '../models/User.js';
import { HttpError } from './errorMiddleware.js';

export async function requireAuth(req, _res, next) {
  const authorization = req.get('authorization') || '';
  const token = /^Bearer\s+(\S+)$/i.exec(authorization)?.[1];

  if (!token) {
    throw new HttpError(
      401,
      'AUTH_REQUIRED',
      'Bạn cần đăng nhập.',
    );
  }

  let claims;

  try {
    claims = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'unijob-api',
      audience: 'unijob-web',
    });
  } catch {
    throw new HttpError(
      401,
      'INVALID_TOKEN',
      'Phiên đăng nhập không còn hợp lệ.',
    );
  }

  if (
    !claims
    || typeof claims.sub !== 'string'
    || !mongoose.isObjectIdOrHexString(claims.sub)
  ) {
    throw new HttpError(
      401,
      'INVALID_TOKEN',
      'Phiên đăng nhập không hợp lệ.',
    );
  }

  const user = await User.findById(claims.sub);

  if (!user) {
    throw new HttpError(
      401,
      'AUTH_REQUIRED',
      'Tài khoản không còn tồn tại.',
    );
  }

  req.user = toPublicUser(user);
  next();
}

export function authorizeRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(
        401,
        'AUTH_REQUIRED',
        'Bạn cần đăng nhập.',
      ));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(
        403,
        'FORBIDDEN',
        'Tài khoản không có quyền thực hiện chức năng này.',
      ));
    }

    next();
  };
}
