import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { ConflictError, UnauthorizedError } from '../lib/errors';
import { env } from '../config/env';

export async function registerUser(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError('Email already in use');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, provider: 'LOCAL' },
  });

  return generateTokens(user.id, user.email);
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  return generateTokens(user.id, user.email);
}

export async function refreshTokens(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new UnauthorizedError('User not found');

  await prisma.refreshToken.deleteMany({ where: { id: stored.id } });
  return generateTokens(user.id, user.email);
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function generateTokensForUser(userId: string, email: string) {
  return generateTokens(userId, email);
}

async function generateTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ userId, email });
  const refreshTokenValue = signRefreshToken({ userId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshTokenValue, userId, expiresAt },
  });

  return { accessToken, refreshToken: refreshTokenValue };
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}
