import { Router } from 'express';
import {
  createApplication,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import {
  validateCreateApplication,
  validateUpdateStatus,
} from '../validators/applicationValidator.js';
import { uploadCvMiddleware } from '../middlewares/uploadCv.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('student'),
  uploadCvMiddleware,
  validateCreateApplication,
  createApplication
);
router.get('/me', authorize('student'), getMyApplications);
router.get('/employer', authorize('employer'), getEmployerApplications);
router.patch(
  '/:id/status',
  authorize('employer'),
  validateUpdateStatus,
  updateApplicationStatus
);
router.delete('/:id', authorize('student', 'employer'), deleteApplication);

export default router;