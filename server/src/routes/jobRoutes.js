import express from 'express';
import {
  getAllJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';
import { validateJobInput } from '../validators/jobValidator.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/employer/me', requireAuth, getMyJobs);
router.post('/claim-legacy', requireAuth, claimLegacyJobs);
router.post('/', requireAuth, validateJobInput, createJob);
router.put('/:id', requireAuth, validateJobInput, updateJob);
router.delete('/:id', requireAuth, deleteJob);
router.get('/:id', getJobById);

export default router;