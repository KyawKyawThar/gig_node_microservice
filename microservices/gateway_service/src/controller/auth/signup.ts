import { NextFunction, Request, Response } from 'express';
import { authService } from '@gateway/api/authService';
import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';

class Signup {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await authService.signUp(req.body);
      req.session = { jwt: response.data.token };
      res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
    } catch (err) {
      next(err);
    }
  }
}

export const signUp = new Signup();
