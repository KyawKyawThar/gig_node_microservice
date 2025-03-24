import { config } from '@auth/config';
import { NotFoundError } from '@auth/errorHandler';
import { winstonLogger } from '@auth/logger';
import { gigByID, gigBySearch } from '@auth/services/search.service';
import { IPaginateProps, ISearchResult } from '@auth/types/authTypes';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';
import { Logger } from 'winston';
//import { NotAuthorizedError } from '@auth/errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth-server', 'debug');

export async function singleElementByGig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await gigByID('gigs', req.params.gigId);
    logger.info('singleElementByGig:', result);
    res.status(StatusCodes.OK).json({ message: 'Search gigs results', gig: result });
    logger.info('Single Element By Gig has been successfully');
  } catch (err) {
    logger.info('Error in singleElementByGig: ', err);
    next(err);
  }
}

export async function gigs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, size, from } = req.params;

    const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };

    // if (!req.currentUser && req.query) {
    //   throw new NotAuthorizedError('you must be logged in to perform filter', 'auth-service gigs method() error ');
    // }

    const gigs: ISearchResult = await gigBySearch(
      `${req.query.query}`,
      paginate,
      `${req.query.delivery_time}`,
      parseInt(`${req.query.minPrice}`),
      parseInt(`${req.query.maxPrice}`)
    );

    if (!gigs.total) {
      throw new NotFoundError('There is no result for this search', 'auth-service gigs() method: error');
    }
    let resultHits = gigs.hits.map((item) => item._source);

    if (type === 'backward') {
      resultHits = sortBy(resultHits, ['sortId']);
    }
    res.status(StatusCodes.OK).json({ message: 'Search gigs results', total: gigs.total, gigs: resultHits });
    logger.info('Search gigs results have been search successful');
  } catch (err) {
    next(err);
  }
}
