import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function orderHealthCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(StatusCodes.OK).send('Order service is healthy and OK.');
    next();
  } catch (error) {
    next(error);
  }
}
