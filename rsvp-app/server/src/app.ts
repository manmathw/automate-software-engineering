import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import eventsRoutes from './routes/events.routes';
import rsvpRoutes from './routes/rsvp.routes';

export function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(passport.initialize());

  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/rsvp', rsvpRoutes);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorHandler);

  return app;
}
