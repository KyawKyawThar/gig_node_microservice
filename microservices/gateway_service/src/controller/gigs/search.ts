import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gigService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');
export class Search {
  public async gigs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, size, type } = req.params;

      let queryString = '';
      const objectArray = Object.entries(req.query);
      const lastIndex = objectArray.length - 1;
      objectArray.forEach(([key, value], index) => {
        queryString += `${key}=${value}${index !== lastIndex ? '&' : ''}`;
      });
      const result = await gigService.searchGig(from, size, type, queryString);

      res.status(StatusCodes.OK).json({ message: result.data.message, total: result.data.total, data: result.data.gigs });
      logger.info('Search gigs have been successfully');
    } catch (error) {
      next(error);
    }
  }
}
