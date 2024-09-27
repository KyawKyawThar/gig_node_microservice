import { NextFunction, Request, Response } from 'express';
import { sellerService } from '@gateway/services/api/sellerService';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Create {
  public async Seller(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await sellerService.createSeller(req.body);
      res.status(StatusCodes.CREATED).json({ message: response.data.message, seller: response.data.seller });
      logger.info('seller has been created successfully');
    } catch (e) {
      next(e);
    }
  }
}
