import { Router, IRouter } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import * as eventsController from '../controllers/events.controller';
import * as guestsController from '../controllers/guests.controller';
import * as invitationsController from '../controllers/invitations.controller';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  occasionType: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'WEDDING', 'GRADUATION', 'CORPORATE', 'BABY_SHOWER', 'RETIREMENT', 'HOLIDAY_PARTY', 'OTHER']),
  eventDate: z.string().datetime(),
  venue: z.string().optional(),
  templateId: z.string().optional(),
});

const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});

router.get('/', eventsController.listEvents);
router.post('/', validate(createEventSchema), eventsController.createEvent);
router.get('/:id', eventsController.getEvent);
router.patch('/:id', validate(updateEventSchema), eventsController.updateEvent);
router.delete('/:id', eventsController.deleteEvent);
router.get('/:id/stats', eventsController.getEventStats);
router.get('/:id/guests', guestsController.listGuests);
router.post('/:id/guests', guestsController.addGuest);
router.post('/:id/guests/import', ...guestsController.importGuests);
router.patch('/:id/guests/:guestId', guestsController.updateGuest);
router.delete('/:id/guests/:guestId', guestsController.deleteGuest);
router.post('/:id/send-invites', invitationsController.sendInvites);
router.post('/:id/send-reminders', invitationsController.sendReminders);

export default router;
