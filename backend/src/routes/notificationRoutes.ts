import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, getPreferences, updatePreferences } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);
router.post('/read-all', authenticate, markAllAsRead);
router.post('/:id/read', authenticate, markAsRead);

export default router;
