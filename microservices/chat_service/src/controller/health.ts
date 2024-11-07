import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function chatHealthCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(StatusCodes.OK).send('Chat service is healthy and OK.');
    next();
  } catch (error) {
    next(error);
  }
}
