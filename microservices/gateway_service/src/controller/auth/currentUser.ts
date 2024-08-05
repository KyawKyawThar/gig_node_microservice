import { authService } from '@gateway/api/authService';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

class CurrentUser {
  public async read(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('current user function called.....');
      const response = await authService.getCurrentUser();
      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
      logger.info('Get current user request has been received...');
    } catch (error) {
      next(error);
    }
  }

  public async resendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await authService.resendEmail(req.body);
      res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
      logger.info('Resend email has been sent successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const currentUser = new CurrentUser();
