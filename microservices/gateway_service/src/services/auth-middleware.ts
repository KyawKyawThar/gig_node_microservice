import { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError } from '@gateway/errorHandler';
import { IAuthPayload } from '@gateway/types/auth-interface';
import { verify } from 'jsonwebtoken';
import { config } from '@gateway/config';

class AuthMiddleware {
  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError('You are not logged in! Please log in to get access.', 'Gateway service checkAuthentication() method');
    }
    next();
  }

  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('You are not logged in! Please log in to get access.', 'Gateway service verifyUser() method');
    }

    try {
      const payload: IAuthPayload = verify(req.session?.jwt, `${config.JWT_SECRET}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (e) {
      throw new NotAuthorizedError('Token is not available! Please log in to get access.', 'Gateway service verifyUser() method');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
