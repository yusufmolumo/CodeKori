import { Router } from 'express';
import {
    getChallenges, getChallenge, submitChallenge, createChallenge,
    getDailyQuest, getMyChallenges, updateChallenge, deleteChallenge,
    publishChallenge, getChallengeSubmitters
} from '../controllers/challengeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public / Learner routes
router.get('/', getChallenges);
router.get('/daily-quest', authenticate, getDailyQuest);

// Mentor routes
router.get('/my-challenges', authenticate, authorize(['mentor', 'admin']), getMyChallenges);
router.post('/', authenticate, authorize(['mentor', 'admin']), createChallenge);
router.put('/:id', authenticate, authorize(['mentor', 'admin']), updateChallenge);
router.delete('/:id', authenticate, authorize(['mentor', 'admin']), deleteChallenge);
router.post('/:id/publish', authenticate, authorize(['mentor', 'admin']), publishChallenge);
router.get('/:id/submitters', authenticate, authorize(['mentor', 'admin']), getChallengeSubmitters);

// Learner actions (must be after other parameterized routes)
router.get('/:id', getChallenge);
router.post('/:challengeId/submit', authenticate, submitChallenge);

export default router;
