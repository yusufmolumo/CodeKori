import express from 'express';
import { authenticate } from '../middleware/auth';
import { getSignature } from '../controllers/uploadController';

const router = express.Router();

router.use(authenticate);

router.get('/signature', getSignature);

export default router;
