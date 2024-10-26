import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gigService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Delete {
  public async deleteGig(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId, sellerId } = req.params;
      const response = await gigService.deleteGig(gigId, sellerId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
    } catch (error) {
      next(error);
    }
  }
}
