import { Router } from 'express';
import { getModes, getModeTasks, getTask, submitTask } from '../controllers/gamificationHubController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/modes', optionalAuthenticate, getModes);
router.get('/modes/:modeId/tasks', optionalAuthenticate, getModeTasks);
router.get('/tasks/:taskId', optionalAuthenticate, getTask);
router.post('/tasks/:taskId/submit', authenticate, submitTask);

export default router;
