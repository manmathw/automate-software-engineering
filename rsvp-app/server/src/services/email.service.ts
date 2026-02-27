import { render } from '@react-email/render';
import React from 'react';
import { resend } from '../config/resend';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { InvitationEmail } from '../emails/templates/InvitationEmail';
import { ReminderEmail } from '../emails/templates/ReminderEmail';
import { RsvpConfirmationEmail } from '../emails/templates/RsvpConfirmationEmail';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function sendInvitationEmail(
  guestId: string,
  eventId: string,
  logId?: string
): Promise<void> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: { include: { organizer: true } } },
  });
  if (!guest) return;

  const rsvpUrl = `${env.RSVP_BASE_URL}/${guest.invitationToken}`;

  const html = await render(
    React.createElement(InvitationEmail, {
      guestFirstName: guest.firstName,
      eventTitle: guest.event.title,
      occasionType: guest.event.occasionType,
      eventDate: formatDate(guest.event.eventDate),
      venue: guest.event.venue ?? undefined,
      description: guest.event.description ?? undefined,
      rsvpUrl,
      organizerName: guest.event.organizer.name,
    })
  );

  const text = `Dear ${guest.firstName}, you are invited to ${guest.event.title} on ${formatDate(guest.event.eventDate)}. RSVP at: ${rsvpUrl}`;

  if (!resend) {
    console.warn('[Email] Skipping invitation — RESEND_API_KEY not set');
    if (logId) {
      await prisma.emailLog.update({ where: { id: logId }, data: { status: 'FAILED' } });
    }
    return;
  }

  try {
    const result = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: guest.email,
      subject: `You're invited to ${guest.event.title}!`,
      html,
      text,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (logId) {
      await prisma.emailLog.update({
        where: { id: logId },
        data: { status: 'SENT', resendId: result.data?.id, sentAt: new Date() },
      });
    }
    console.log(`[Email] Invitation sent to ${guest.email} (resendId: ${result.data?.id})`);
  } catch (err) {
    console.error(`[Email] Failed to send invitation to ${guest.email}:`, err);
    if (logId) {
      await prisma.emailLog.update({ where: { id: logId }, data: { status: 'FAILED' } });
    }
    throw err;
  }
}

export async function sendReminderEmail(guestId: string, timeUntilEvent: string): Promise<void> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: true, rsvp: true },
  });
  if (!guest || guest.rsvp?.response === 'NO') return;

  const rsvpUrl = `${env.RSVP_BASE_URL}/${guest.invitationToken}`;

  const html = await render(
    React.createElement(ReminderEmail, {
      guestFirstName: guest.firstName,
      eventTitle: guest.event.title,
      occasionType: guest.event.occasionType,
      eventDate: formatDate(guest.event.eventDate),
      venue: guest.event.venue ?? undefined,
      rsvpUrl,
      timeUntilEvent,
    })
  );

  const text = `Hi ${guest.firstName}, reminder: ${guest.event.title} is coming up in ${timeUntilEvent}. RSVP at: ${rsvpUrl}`;

  if (resend) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: guest.email,
      subject: `Reminder: ${guest.event.title} is coming up!`,
      html,
      text,
    });
  }
}

export async function sendRsvpConfirmationEmail(guestId: string): Promise<void> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: true, rsvp: true },
  });
  if (!guest?.rsvp) return;

  const html = await render(
    React.createElement(RsvpConfirmationEmail, {
      guestFirstName: guest.firstName,
      eventTitle: guest.event.title,
      occasionType: guest.event.occasionType,
      eventDate: formatDate(guest.event.eventDate),
      venue: guest.event.venue ?? undefined,
      response: guest.rsvp.response as 'YES' | 'NO' | 'MAYBE',
      plusOneCount: guest.rsvp.plusOneCount,
    })
  );

  const text = `Hi ${guest.firstName}, your RSVP for ${guest.event.title} has been recorded as ${guest.rsvp.response}.`;

  if (resend) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: guest.email,
      subject: `RSVP Confirmation: ${guest.event.title}`,
      html,
      text,
    });
  }
}
