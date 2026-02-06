import { Router } from 'express';
import { getChallenges, getChallenge, submitChallenge, createChallenge, getDailyQuest } from '../controllers/challengeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getChallenges);
router.get('/daily-quest', authenticate, getDailyQuest);
router.get('/:id', getChallenge);
router.post('/', authenticate, authorize(['admin']), createChallenge);
router.post('/:challengeId/submit', authenticate, submitChallenge);

export default router;
