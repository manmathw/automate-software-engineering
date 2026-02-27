import { Router } from 'express';
import * as rsvpController from '../controllers/rsvp.controller';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const rsvpSchema = z.object({
  response: z.enum(['YES', 'NO', 'MAYBE']),
  plusOneCount: z.number().int().min(0).max(10).optional(),
  dietaryPreferences: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
});

router.get('/:token', rsvpController.getRsvp);
router.post('/:token', validate(rsvpSchema), rsvpController.submitRsvp);

export default router;
