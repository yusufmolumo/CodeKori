import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
    requestMentor,
    getMyRequests,
    acceptRequest,
    declineRequest,
    getMyMentees,
    getMenteeStats,
    getMyMentor,
    getMyPendingRequests,
    getChatMessages,
    sendChatMessage,
    removeMentee,
    getUnreadChatCounts,
    markChatRead
} from '../controllers/mentorshipController';

const router = Router();

// Learner routes
router.post('/request', authenticate, requestMentor);
router.get('/my-mentor', authenticate, getMyMentor);
router.get('/my-requests', authenticate, getMyPendingRequests);

// Mentor routes
router.get('/requests', authenticate, authorize(['mentor', 'admin']), getMyRequests);
router.put('/requests/:id/accept', authenticate, authorize(['mentor', 'admin']), acceptRequest);
router.put('/requests/:id/decline', authenticate, authorize(['mentor', 'admin']), declineRequest);
router.get('/mentees', authenticate, authorize(['mentor', 'admin']), getMyMentees);
router.get('/mentees/:id/stats', authenticate, authorize(['mentor', 'admin']), getMenteeStats);
router.delete('/mentees/:id', authenticate, authorize(['mentor', 'admin']), removeMentee);

// Chat routes (available to both mentors and learners)
router.get('/chat/unread-counts', authenticate, getUnreadChatCounts);
router.get('/chat/:userId', authenticate, getChatMessages);
router.post('/chat/:userId', authenticate, sendChatMessage);
router.post('/chat/:userId/read', authenticate, markChatRead);

export default router;
