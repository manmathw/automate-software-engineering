import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../lib/errors';
import { sendInvitationEmail, sendReminderEmail } from '../services/email.service';

export async function sendInvites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { guests: true },
    });
    if (!event) throw new NotFoundError('Event');
    if (event.organizerId !== req.userId) throw new ForbiddenError();

    const results = { sent: 0, failed: 0 };

    for (const guest of event.guests) {
      const log = await prisma.emailLog.create({
        data: {
          eventId: event.id,
          guestId: guest.id,
          type: 'INVITATION',
          status: 'QUEUED',
          toEmail: guest.email,
        },
      });

      try {
        await sendInvitationEmail(guest.id, event.id, log.id);
        results.sent++;
      } catch {
        results.failed++;
      }
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function sendReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { guests: { include: { rsvp: true } } },
    });
    if (!event) throw new NotFoundError('Event');
    if (event.organizerId !== req.userId) throw new ForbiddenError();

    const guests = event.guests.filter((g) => g.rsvp?.response !== 'NO');
    for (const guest of guests) {
      await sendReminderEmail(guest.id, 'soon');
    }

    res.json({ sent: guests.length });
  } catch (err) {
    next(err);
  }
}
