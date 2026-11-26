import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  if (req.user && (req.user._id || req.user.id)) {
    return next();
  }
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = bearerToken || req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập để thực hiện thao tác này',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'unijob_secret_key';
    const decoded = jwt.verify(token, secret);
    const userId = decoded._id || decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Đăng nhập không hợp lệ',
      });
    }
    req.user = { ...decoded, _id: userId, id: userId };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Đăng nhập đã hết hạn hoặc không hợp lệ',
    });
  }
};