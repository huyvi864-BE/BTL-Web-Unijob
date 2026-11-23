import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import {
  register,
  login,
} from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Quá nhiều lượt thử. Hãy thử lại sau.',
    },
  },
});

router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

export default router;