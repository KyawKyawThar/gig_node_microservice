import { NextFunction, Request, Response } from 'express';
import { authService } from '@gateway/services/api/authService';
import { AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');
class Signup {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await authService.signUp(req.body);
      req.session = { jwt: response.data.token };

      res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });

      logger.info('signup successfully created');
    } catch (err) {
      next(err);
    }
  }
}

export const signUp = new Signup();
