import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function authHealthCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(StatusCodes.OK).send('Auth service is healthy and OK.');
  } catch (err) {
    next(err);
  }
}
