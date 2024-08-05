import { authService } from '@gateway/api/authService';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');
class SignIn {
  public async read(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await authService.signIn(req.body);

      const { message, user, token, browserName, deviceType } = response.data;
      req.session = { jwt: token };

      res.status(StatusCodes.OK).json({ message, user, browserName, deviceType });
      logger.info('User signed in successfully..');
    } catch (error) {
      next(error);
    }
  }
}
export const signIn = new SignIn();