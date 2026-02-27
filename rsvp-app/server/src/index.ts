import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { startScheduler } from './jobs/scheduler';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  startScheduler();
});
