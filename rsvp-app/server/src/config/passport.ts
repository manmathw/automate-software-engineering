import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { env } from './env';

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
  console.warn('[Passport] Google OAuth disabled — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable it');
}

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'));

          let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
          if (!user) {
            user = await prisma.user.upsert({
              where: { email },
              update: { googleId: profile.id, provider: 'GOOGLE' },
              create: {
                email,
                name: profile.displayName || email.split('@')[0],
                googleId: profile.id,
                provider: 'GOOGLE',
              },
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

export default passport;
