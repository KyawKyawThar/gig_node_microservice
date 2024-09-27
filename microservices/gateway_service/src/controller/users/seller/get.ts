import { NextFunction, Request, Response } from 'express';
import { sellerService } from '@gateway/services/api/sellerService';
import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Get {
  public async sellerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await sellerService.getSellerById(req.params.sellerId);
      res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.seller });
      logger.info('get seller by id has been successful');
    } catch (e) {
      next(e);
    }
  }

  public async sellerByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await sellerService.getSellerByUsername(req.params.username);

      res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.seller });
      logger.info('get seller by username has been fetched successfully');
    } catch (e) {
      next(e);
    }
  }

  public async getRandomSeller(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await sellerService.getRandomSellers(req.params.size);
      res.status(StatusCodes.OK).json({ message: response.data.message, seller: response.data.sellers });
      logger.info('get random Seller has been fetched successfully');
    } catch (e) {
      next(e);
    }
  }
}
