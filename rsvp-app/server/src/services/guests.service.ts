import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../lib/errors';
import { parse } from 'csv-parse/sync';

export async function listGuests(eventId: string, userId: string, page: number, limit: number, rsvpResponse?: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = { eventId };
  if (rsvpResponse) {
    where.rsvp = { response: rsvpResponse };
  }

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      include: { rsvp: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.guest.count({ where }),
  ]);

  return { guests, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function addGuest(
  eventId: string,
  userId: string,
  data: { firstName: string; lastName: string; email: string; plusOneAllowed?: boolean }
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  return prisma.guest.create({
    data: { ...data, eventId },
    include: { rsvp: true },
  });
}

export async function importGuestsFromCsv(eventId: string, userId: string, csvBuffer: Buffer) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  const records = parse(csvBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<{ firstName?: string; lastName?: string; email?: string; plusOneAllowed?: string }>;

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (const record of records) {
    if (!record.firstName || !record.lastName || !record.email) {
      results.skipped++;
      continue;
    }
    try {
      await prisma.guest.create({
        data: {
          eventId,
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,
          plusOneAllowed: record.plusOneAllowed === 'true',
        },
      });
      results.imported++;
    } catch {
      results.skipped++;
    }
  }

  return results;
}

export async function updateGuest(
  eventId: string,
  guestId: string,
  userId: string,
  data: { firstName?: string; lastName?: string; email?: string; plusOneAllowed?: boolean }
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  const guest = await prisma.guest.findFirst({ where: { id: guestId, eventId } });
  if (!guest) throw new NotFoundError('Guest');

  return prisma.guest.update({ where: { id: guestId }, data });
}

export async function deleteGuest(eventId: string, guestId: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  const guest = await prisma.guest.findFirst({ where: { id: guestId, eventId } });
  if (!guest) throw new NotFoundError('Guest');

  await prisma.guest.delete({ where: { id: guestId } });
}
