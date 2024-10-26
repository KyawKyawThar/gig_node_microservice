import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

class SignOut {
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session = null;
      res.status(StatusCodes.OK).json({ message: 'Logout successful', user: {} });
    } catch (error) {
      next(error);
    }
  }
}

export const signOut = new SignOut();
