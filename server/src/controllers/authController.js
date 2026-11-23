import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User, { toPublicUser } from '../models/User.js';
import { HttpError } from '../middlewares/errorMiddleware.js';
import {
  registerSchema,
  loginSchema,
  parseBody,
} from '../validators/authValidator.js';

export async function register(req, res) {
  const { name, email, password, role } = parseBody(
    registerSchema,
    req.body,
  );

  if (await User.exists({ email })) {
    throw new HttpError(
      409,
      'EMAIL_EXISTS',
      'Email đã được sử dụng.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
  });

  res.status(201).json({
    user: toPublicUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = parseBody(loginSchema, req.body);

  const user = await User.findOne({ email })
    .select('+passwordHash');

  const matches = user
    && await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    throw new HttpError(
      401,
      'INVALID_CREDENTIALS',
      'Email hoặc mật khẩu không đúng.',
    );
  }

  const accessToken = jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: String(user._id),
    issuer: 'unijob-api',
    audience: 'unijob-web',
    expiresIn: '1h',
  });

  res.json({
    user: toPublicUser(user),
    accessToken,
  });
}