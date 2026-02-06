import { Router } from 'express';
import { getGamificationStats, getLeaderboard } from '../controllers/gamificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, getGamificationStats);
router.get('/leaderboard', getLeaderboard);

export default router;
