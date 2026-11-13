import { Router } from 'express';

const router = Router();

router.use((_req, res) => {
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Chức năng đang được phát triển.' },
  });
});

export default router;
