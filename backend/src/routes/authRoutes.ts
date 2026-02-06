import { Router } from 'express';
import { register, verifyEmail, login, forgotPassword, resetPassword } from '../controllers/authController';
// import { validateRegister, validateLogin } from '../middleware/validation'; // To implement

const router = Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
