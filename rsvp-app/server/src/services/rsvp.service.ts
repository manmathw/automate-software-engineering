import { prisma } from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import { sendRsvpConfirmationEmail } from './email.service';

export async function getRsvpByToken(token: string) {
  const guest = await prisma.guest.findUnique({
    where: { invitationToken: token },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          occasionType: true,
          eventDate: true,
          venue: true,
          description: true,
          templateId: true,
          status: true,
        },
      },
      rsvp: true,
    },
  });
  if (!guest) throw new NotFoundError('Invitation');
  return guest;
}

export async function submitRsvp(
  token: string,
  data: {
    response: 'YES' | 'NO' | 'MAYBE';
    plusOneCount?: number;
    dietaryPreferences?: string;
    message?: string;
  }
) {
  const guest = await prisma.guest.findUnique({
    where: { invitationToken: token },
    include: { event: true },
  });
  if (!guest) throw new NotFoundError('Invitation');

  const rsvp = await prisma.rsvp.upsert({
    where: { guestId: guest.id },
    update: {
      response: data.response,
      plusOneCount: data.plusOneCount || 0,
      dietaryPreferences: data.dietaryPreferences,
      message: data.message,
      respondedAt: new Date(),
    },
    create: {
      guestId: guest.id,
      response: data.response,
      plusOneCount: data.plusOneCount || 0,
      dietaryPreferences: data.dietaryPreferences,
      message: data.message,
    },
  });

  // Send confirmation email asynchronously
  sendRsvpConfirmationEmail(guest.id).catch(console.error);

  return { rsvp, guest: { firstName: guest.firstName, email: guest.email } };
}
