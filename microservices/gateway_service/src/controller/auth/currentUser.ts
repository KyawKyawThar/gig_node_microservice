import { authService } from '@gateway/services/api/authService';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';
import { gatewayCache } from '@gateway/redis/redis.cache';
import { socketIO } from '@gateway/server';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

const gateCache = gatewayCache;
class CurrentUser {
  public async read(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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
      res.status(StatusCodes.OK).json({ message: response.data.message });
      logger.info('Resend email has been sent successfully');
    } catch (error) {
      next(error);
    }
  }

  public async getLoggedInUser(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await gateCache.getLoggedInUsersFromCache('loggedInUsers');

      socketIO.emit('online', response);

      res.status(StatusCodes.OK).json({ message: 'User is online', data: response });
    } catch (error) {
      next(error);
    }
  }
  public async removeLoggedInUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await gateCache.removeLoggedInUserFromCache('loggedInUsers', req.params.username);
      socketIO.emit('online', response);
      res.status(StatusCodes.OK).json({ message: 'User is offline' });
    } catch (error) {
      next(error);
    }
  }
}

export const currentUser = new CurrentUser();
