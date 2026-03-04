import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAdminStats, getAllUsers, promoteUser, deleteUser, getSkillLabModes, toggleSkillLabMode } from '../controllers/adminController';

const router = express.Router();

// Protect all admin routes
router.use(authenticate);
router.use(authorize(['admin', 'ADMIN']));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', promoteUser);
router.delete('/users/:userId', deleteUser);
router.get('/skill-lab-modes', getSkillLabModes);
router.patch('/skill-lab-modes/:modeId/toggle', toggleSkillLabMode);

export default router;
