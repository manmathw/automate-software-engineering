import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import * as authService from '../services/auth.service';
import { getRefreshCookieOptions } from '../services/auth.service';
import { env } from '../config/env';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, name, password } = req.body;
    const { accessToken, refreshToken } = await authService.registerUser(email, name, password);
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.status(201).json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.loginUser(email, password);
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }
    const { accessToken, refreshToken } = await authService.refreshTokens(token);
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await authService.logoutUser(token);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, provider: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as { id: string; email: string };
    const { accessToken, refreshToken } = await authService.generateTokensForUser(user.id, user.email);
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.redirect(`${env.CLIENT_URL}/oauth-callback?token=${accessToken}`);
  } catch (err) {
    next(err);
  }
}
