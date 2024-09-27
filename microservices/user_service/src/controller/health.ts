import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function usersRouteHealthCheck(_req: Request, res: Response, next: NextFunction) {
  try {
    res.status(StatusCodes.OK).send('User service is healthy and OK');
  } catch (error) {
    next(error);
  }
}
