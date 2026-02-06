import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.post('/read-all', authenticate, markAllAsRead);
router.post('/:id/read', authenticate, markAsRead);

export default router;
