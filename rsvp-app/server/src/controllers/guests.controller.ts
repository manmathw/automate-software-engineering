import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as guestsService from '../services/guests.service';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export async function listGuests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const rsvpResponse = req.query.rsvpResponse as string | undefined;
    const data = await guestsService.listGuests(req.params.id, req.userId!, page, limit, rsvpResponse);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function addGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const guest = await guestsService.addGuest(req.params.id, req.userId!, req.body);
    res.status(201).json(guest);
  } catch (err) {
    next(err);
  }
}

export const importGuests = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const results = await guestsService.importGuestsFromCsv(req.params.id, req.userId!, req.file.buffer);
      res.json(results);
    } catch (err) {
      next(err);
    }
  },
];

export async function updateGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const guest = await guestsService.updateGuest(req.params.id, req.params.guestId, req.userId!, req.body);
    res.json(guest);
  } catch (err) {
    next(err);
  }
}

export async function deleteGuest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await guestsService.deleteGuest(req.params.id, req.params.guestId, req.userId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
