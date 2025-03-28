import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { IPaginateProps } from '@gig/types/gigTypes';
import { gigsSearch } from '@gig/services/search.service';
import { sortBy } from 'lodash';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '@gig/errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');

export const gigs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { from, size, type } = req.params;

    const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };

    //console.log('first', req.query.query);
    const gigs = await gigsSearch(
      `${req.query.query}`,
      paginate,
      `${req.query.deliveryTime}`,
      parseInt(`${req.query.minPrice}`),
      parseInt(`${req.query.maxPrice}`)
    );

    if (!gigs.total) {
      throw new NotFoundError('There is no result for this search', 'gig-service searchGigs() method: error');
    }
    let resultHits = gigs.hits.map((item) => item._source);

    if (type === 'backward') {
      resultHits = sortBy(resultHits, ['sortId']);
    }

    res.status(StatusCodes.OK).json({ message: 'Search gigs result', total: gigs.total, gigs: resultHits });

    logger.info('gigs have been searched successfully...');
  } catch (err) {
    next(err);
  }
};
