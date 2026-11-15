import express from 'express';
import {
  getAllJobs,
  getMyJobs,
  getJobById,
} from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/employer/me', getMyJobs);
router.get('/:id', getJobById);

export default router;