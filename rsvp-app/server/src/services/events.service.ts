import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../lib/errors';
import { OccasionType, EventStatus } from '@prisma/client';

export async function getEvents(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: userId },
      include: { _count: { select: { guests: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.event.count({ where: { organizerId: userId } }),
  ]);
  return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getEvent(id: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { guests: true } } },
  });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();
  return event;
}

export async function createEvent(
  userId: string,
  data: {
    title: string;
    description?: string;
    occasionType: OccasionType;
    eventDate: string;
    venue?: string;
    templateId?: string;
  }
) {
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      occasionType: data.occasionType,
      eventDate: new Date(data.eventDate),
      venue: data.venue,
      templateId: data.templateId || 'classic',
      organizerId: userId,
    },
  });
  await seedReminderJobs(event.id, new Date(data.eventDate));
  return event;
}

export async function updateEvent(
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    occasionType?: OccasionType;
    status?: EventStatus;
    eventDate?: string;
    venue?: string;
    templateId?: string;
  }
) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
    },
  });

  if (data.eventDate) {
    await seedReminderJobs(id, new Date(data.eventDate));
  }
  return updated;
}

export async function deleteEvent(id: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();
  await prisma.event.delete({ where: { id } });
}

export async function getEventStats(id: string, userId: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError('Event');
  if (event.organizerId !== userId) throw new ForbiddenError();

  const [rsvpCounts, emailsSent, totalGuests] = await Promise.all([
    prisma.rsvp.groupBy({
      by: ['response'],
      where: { guest: { eventId: id } },
      _count: { response: true },
    }),
    prisma.emailLog.count({ where: { eventId: id, status: 'SENT' } }),
    prisma.guest.count({ where: { eventId: id } }),
  ]);

  const counts: Record<string, number> = { YES: 0, NO: 0, MAYBE: 0, PENDING: 0 };
  rsvpCounts.forEach((r) => {
    counts[r.response] = r._count.response;
  });
  counts.PENDING = totalGuests - (counts.YES + counts.NO + counts.MAYBE);

  return { ...counts, totalGuests, emailsSent };
}

export async function seedReminderJobs(eventId: string, eventDate: Date) {
  const reminders = [
    { type: '1_week', offset: 7 * 24 * 60 * 60 * 1000 },
    { type: '1_day', offset: 1 * 24 * 60 * 60 * 1000 },
    { type: '2_hours', offset: 2 * 60 * 60 * 1000 },
  ];

  for (const reminder of reminders) {
    const triggerAt = new Date(eventDate.getTime() - reminder.offset);
    await prisma.reminderJob.upsert({
      where: { eventId_type: { eventId, type: reminder.type } },
      update: { triggerAt, sent: false },
      create: { eventId, type: reminder.type, triggerAt },
    });
  }
}
