import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gigService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class GigSeed {
  public async seed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await gigService.seed(req.params.count);
      res.status(StatusCodes.OK).json({ message: result.data.message, gigs: result.data.gigs });
      logger.info('seed have been created successfully...');
    } catch (err) {
      next(err);
    }
  }
}
