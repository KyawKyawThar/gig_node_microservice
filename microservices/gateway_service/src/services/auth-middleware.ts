import { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotAuthorizedError } from '@gateway/errorHandler';
import { IAuthPayload } from '@gateway/types/authInterface';
import { verify } from 'jsonwebtoken';
import { config } from '@gateway/config';

class AuthMiddleware {
  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      return next(
        new BadRequestError('You are not logged in! Please log in to get access.', 'Gateway service checkAuthentication() method')
      );
    }
    next();
  }

  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      return next(new NotAuthorizedError('You are not logged in! Please log in to get access.', 'Gateway service verifyUser() method'));
    }

    try {
      const payload: IAuthPayload = verify(req.session?.jwt, `${config.JWT_SECRET}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (e) {
      next(new NotAuthorizedError('Token is not available! Please log in to get access.', 'Gateway service verifyUser() method'));
    }
    next();
  }

  public verifyRefreshToken(req: Request, _res: Response, next: NextFunction): void {
    const token = req.cookies?.refreshToken as string;

    if (!token) {
      return next(new NotAuthorizedError('Refresh token is missing or invalid.', 'verifyRefreshToken() method'));
    }

    try {
      const payload: { id: number; username: string; iat: number; exp: number; email: string } = verify(token, config.JWT_SECRET) as {
        id: number;
        username: string;
        email: string;
        iat: number;
        exp: number;
      };
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (payload.exp < currentTime) {
        return next(new NotAuthorizedError('Refresh token has expired.', 'verifyRefreshToken() method'));
      }

      next();
    } catch (error) {
      return next(new NotAuthorizedError('Invalid refresh token.', 'verifyRefreshToken() method'));
    }
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
