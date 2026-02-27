import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import * as authController from '../controllers/auth.controller';
import { env } from '../config/env';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

function googleNotConfigured(_req: Request, res: Response, _next: NextFunction): void {
  res.status(501).json({ error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
}

const googleConfigured = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

router.get(
  '/google',
  googleConfigured
    ? passport.authenticate('google', { scope: ['email', 'profile'] })
    : googleNotConfigured
);
router.get(
  '/google/callback',
  googleConfigured
    ? passport.authenticate('google', { session: false, failureRedirect: '/login' })
    : googleNotConfigured,
  authController.googleCallback
);

export default router;
