import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAdminStats, getAllUsers, promoteUser } from '../controllers/adminController';

const router = express.Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', promoteUser);

export default router;
