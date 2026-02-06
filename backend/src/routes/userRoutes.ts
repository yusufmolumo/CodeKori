import { Router } from 'express';
import { getProfile, updateProfile, getMentors } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/mentors', authenticate, getMentors);

export default router;
