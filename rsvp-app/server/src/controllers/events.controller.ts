import { Request, Response, NextFunction } from 'express';
import * as eventsService from '../services/events.service';

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await eventsService.getEvents(req.userId!, page, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await eventsService.createEvent(req.userId!, req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await eventsService.getEvent(req.params.id, req.userId!);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.userId!, req.body);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await eventsService.deleteEvent(req.params.id, req.userId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getEventStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await eventsService.getEventStats(req.params.id, req.userId!);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
