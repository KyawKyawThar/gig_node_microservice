import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { AxiosResponse } from 'axios';
import { buyerService } from '@gateway/services/api/buyerService';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Get {
  public async email(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await buyerService.email();
      res.status(StatusCodes.OK).json({ message: response.data.message, buyer: response.data.buyer });
      logger.info('Get buyer by email has been received.');
    } catch (e) {
      next(e);
    }
  }

  public async currentUser(_req: Request, res: Response, next: NextFunction) {
    try {
      const response: AxiosResponse = await buyerService.currentUser();
      res.status(StatusCodes.OK).json({ message: response.data.message, buyer: response.data.currentUsername });
      logger.info('Get current user by email address');
    } catch (e) {
      next(e);
    }
  }

  public async username(req: Request, res: Response, next: NextFunction) {
    try {
      const response: AxiosResponse = await buyerService.username(req.params.username);
      res.status(StatusCodes.OK).json({ message: response.data.message, buyer: response.data.buyerByUsername });
    } catch (e) {
      next(e);
    }
  }
}
