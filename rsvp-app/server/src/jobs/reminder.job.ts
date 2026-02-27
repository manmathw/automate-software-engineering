import { prisma } from '../lib/prisma';
import { sendReminderEmail } from '../services/email.service';

const typeLabels: Record<string, string> = {
  '1_week': '1 week',
  '1_day': '1 day',
  '2_hours': '2 hours',
};

export async function runReminderJob(): Promise<void> {
  const now = new Date();

  const dueJobs = await prisma.reminderJob.findMany({
    where: {
      sent: false,
      triggerAt: { lte: now },
      event: { status: 'PUBLISHED' },
    },
    include: {
      event: {
        include: {
          guests: {
            include: { rsvp: true },
          },
        },
      },
    },
  });

  for (const job of dueJobs) {
    const timeLabel = typeLabels[job.type] || job.type;
    const guests = job.event.guests.filter((g) => g.rsvp?.response !== 'NO');

    console.log(`[ReminderJob] Sending ${job.type} reminders for event ${job.eventId} to ${guests.length} guests`);

    for (const guest of guests) {
      try {
        await sendReminderEmail(guest.id, timeLabel);
        await prisma.emailLog.create({
          data: {
            eventId: job.eventId,
            guestId: guest.id,
            type: `REMINDER_${job.type.toUpperCase()}`,
            status: 'SENT',
            toEmail: guest.email,
            sentAt: new Date(),
          },
        });
      } catch (err) {
        console.error(`[ReminderJob] Failed to send to ${guest.email}:`, err);
      }
    }

    await prisma.reminderJob.update({
      where: { id: job.id },
      data: { sent: true },
    });
  }
}
