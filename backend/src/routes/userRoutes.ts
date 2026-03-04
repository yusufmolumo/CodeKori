import { Router } from 'express';
import { getProfile, updateProfile, getMentors, recordHeartbeat } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/mentors', authenticate, getMentors);
router.patch('/heartbeat', authenticate, recordHeartbeat);

export default router;
