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

const router = express.Router();

router.get('/', getAllJobs);
router.get('/employer/me', getMyJobs);
router.get('/:id', getJobById);
router.post('/', validateJobInput, createJob);
router.put('/:id', validateJobInput, updateJob);
router.delete('/:id', deleteJob);

export default router;