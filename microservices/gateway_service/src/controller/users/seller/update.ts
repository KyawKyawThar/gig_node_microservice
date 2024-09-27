import { NextFunction, Request, Response } from 'express';
import { sellerService } from '@gateway/services/api/sellerService';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Update {
  public async updateSeller(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await sellerService.updateSeller(req.params.sellerId, req.body);
      res.status(StatusCodes.ACCEPTED).json({ message: response.data.message, seller: response.data.seller });
      logger.info('seller has been updated successfully');
    } catch (e) {
      next(e);
    }
  }
}
