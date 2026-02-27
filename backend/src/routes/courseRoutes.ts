import { Router } from 'express';
import {
    getCourses, getCourse, createCourse, enrollInCourse, completeLesson,
    getLesson, getEnrolledCourses, getMyCourses, updateCourse, deleteCourse,
    publishCourse, createModule, updateModule, deleteModule,
    createLesson, updateLesson, deleteLesson
} from '../controllers/courseController';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public / Learner routes
router.get('/', getCourses);
router.get('/enrolled', authenticate, getEnrolledCourses);
router.get('/lessons/:lessonId', authenticate, getLesson);

// Mentor routes
router.get('/my-courses', authenticate, authorize(['mentor', 'admin']), getMyCourses);
router.post('/', authenticate, authorize(['mentor', 'admin']), createCourse);
router.put('/:id', authenticate, authorize(['mentor', 'admin']), updateCourse);
router.delete('/:id', authenticate, authorize(['mentor', 'admin']), deleteCourse);
router.post('/:id/publish', authenticate, authorize(['mentor', 'admin']), publishCourse);

// Module CRUD (mentor)
router.post('/:courseId/modules', authenticate, authorize(['mentor', 'admin']), createModule);
router.put('/modules/:moduleId', authenticate, authorize(['mentor', 'admin']), updateModule);
router.delete('/modules/:moduleId', authenticate, authorize(['mentor', 'admin']), deleteModule);

// Lesson CRUD (mentor)
router.post('/modules/:moduleId/lessons', authenticate, authorize(['mentor', 'admin']), createLesson);
router.put('/lessons/:lessonId/edit', authenticate, authorize(['mentor', 'admin']), updateLesson);
router.delete('/lessons/:lessonId', authenticate, authorize(['mentor', 'admin']), deleteLesson);

// Learner actions (must be after other parameterized routes)
router.get('/:id', optionalAuthenticate, getCourse);
router.post('/:id/enroll', authenticate, enrollInCourse);
router.post('/lessons/:lessonId/complete', authenticate, completeLesson);

export default router;
