import { Router } from 'express';
import { getCourses, getCourse, createCourse, enrollInCourse, completeLesson, getLesson, getEnrolledCourses } from '../controllers/courseController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.get('/', getCourses);
router.get('/enrolled', authenticate, getEnrolledCourses);
router.get('/:id', optionalAuthenticate, getCourse);
router.post('/', authenticate, authorize(['admin']), createCourse);
router.post('/:id/enroll', authenticate, enrollInCourse);
router.get('/lessons/:lessonId', authenticate, getLesson);
router.post('/lessons/:lessonId/complete', authenticate, completeLesson);

export default router;
