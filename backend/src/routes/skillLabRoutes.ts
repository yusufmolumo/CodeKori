import { Router } from 'express';
import { getModes, getModeTasks, getTask, submitTask, generateChallenges, submitArenaResult } from '../controllers/gamificationHubController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/modes', optionalAuthenticate, getModes);
router.get('/modes/:modeId/tasks', optionalAuthenticate, getModeTasks);
router.get('/tasks/:taskId', optionalAuthenticate, getTask);
router.post('/tasks/:taskId/submit', authenticate, submitTask);
router.post('/challenge-arena/generate', authenticate, generateChallenges);
router.post('/challenge-arena/submit', authenticate, submitArenaResult);

export default router;

