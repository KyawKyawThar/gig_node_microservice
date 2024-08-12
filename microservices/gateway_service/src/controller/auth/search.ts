import { authService } from '@gateway/api/authService';
import { config } from '@gateway/config';
import { winstonLogger } from '@gateway/logger';
import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Logger } from 'winston';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

class Search {
  public async gigByID(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await authService.gigById(req.params.gigId);

      res.status(StatusCodes.OK).json({ message: response.data.message, result: response.data.gig });
      logger.info('Search gig by ID have been successfully retrieved');
    } catch (err) {
      next(err);
    }
  }

  public async gigs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, size, type } = req.params;
      console.log('before:', req.query);
      let queryString = '';
      const objectLists = Object.entries(req.query);
      const lastIndex = objectLists.length - 1;

      objectLists.forEach(([key, value], index) => {
        queryString += `${key}=${value}${index !== lastIndex ? '&' : ''}`;
      });

      console.log('after:', queryString);
      const result = await authService.gigs(from, size, type, queryString);
      res.status(StatusCodes.OK).json({ message: result.data.message, total: result.data.total.value, data: result.data.gigs });
      logger.info('Search gigs have been successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const search = new Search();
