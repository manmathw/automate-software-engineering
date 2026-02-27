import cron from 'node-cron';
import { runReminderJob } from './reminder.job';

export function startScheduler(): void {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Running reminder job...');
    try {
      await runReminderJob();
    } catch (err) {
      console.error('[Scheduler] Reminder job failed:', err);
    }
  });

  console.log('[Scheduler] Started');
}
