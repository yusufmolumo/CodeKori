import { Router } from 'express';
import { getForumCategories, createPost, getPost, getPosts, addComment, toggleVote } from '../controllers/forumController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/categories', getForumCategories);
router.get('/posts', getPosts);
router.post('/posts', authenticate, createPost);
router.get('/posts/:id', getPost);
router.post('/posts/:postId/comments', authenticate, addComment);
router.post('/vote', authenticate, toggleVote);

export default router;
