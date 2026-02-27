import { Request, Response, NextFunction } from 'express';
import * as rsvpService from '../services/rsvp.service';

export async function getRsvp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await rsvpService.getRsvpByToken(req.params.token);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function submitRsvp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await rsvpService.submitRsvp(req.params.token, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
