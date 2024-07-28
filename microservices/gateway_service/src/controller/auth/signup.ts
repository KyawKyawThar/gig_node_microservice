import { Request, Response } from 'express';
import { authService } from '@gateway/api/authService';
import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';

class Signup {
  public async create(req: Request, res: Response): Promise<void> {
    const response: AxiosResponse = await authService.signUp(req.body);
    req.session = { jwt: response.data.token };
    console.log('gate-way service controller auth SignUp method', req.session);
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }
}

export const signUp = new Signup();
