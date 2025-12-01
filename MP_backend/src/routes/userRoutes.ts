import { Router } from 'express';
import { registerUser, sendVerificationCode, verifyCode } from '../controllers/userController';

const router = Router();

// POST /api/users/send-verification-code
router.post('/send-verification-code', sendVerificationCode);

// POST /api/users/verify-code
router.post('/verify-code', verifyCode);

// POST /api/users/register
router.post('/register', registerUser);

export default router;
