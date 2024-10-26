import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { getGigByID, getPauseSellerGig, getSellerGig } from '@gig/services/gig.service';
import { StatusCodes } from 'http-status-codes';

import { getUserSelectedCache } from '@gig/redis/gig.cache';
import { getMoreGigsLikeThis, getTopGigsByCategory, gigsSearchByCategory } from '@gig/services/search.service';
import { NotFoundError } from '@gig/errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');

export const gigById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gigs = await getGigByID(req.params.gigId);
    if (Object.keys(gigs).length < 1) {
      throw new NotFoundError('Search gig by ID does not exists', 'gig-service gigByID() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'get gig by id ', gigs });
    logger.info('get gig by id successfully');
  } catch (error) {
    next(error);
  }
};
export const sellerGigsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gig = await getSellerGig(req.params.sellerId);
    if (Object.keys(gig).length < 1) {
      throw new NotFoundError('Search seller by ID does not exists', 'gig-service sellerGigsById() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'seller gig by id ', gig });
    logger.info('seller gig by id successfully');
  } catch (error) {
    next(error);
  }
};

export const sellerInactiveGigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gig = await getPauseSellerGig(req.params.sellerId);

    if (!gig.length) {
      throw new NotFoundError('seller inactive gig does not exist with this id', 'gig-service sellerInactiveGigs() method: error');
    }
    res.status(StatusCodes.OK).json({ message: 'seller inactive gig has been get successfully', gig });
    logger.info('seller inactive gig');
  } catch (error) {
    next(error);
  }
};

export const gigByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await getUserSelectedCache(`selectedCategories:${req.params.username}`);
    const gig = await gigsSearchByCategory(category);
    if (!Object.keys(gig).length) {
      throw new NotFoundError('seller inactive gig does not exist with this id', 'gig-service sellerInactiveGigs() method: error');
    }
    let resultHits = gig.hits.map((item) => item._source);
    res.status(StatusCodes.OK).json({ message: 'Search gigs category results', gig: resultHits, total: gig.total });
    logger.info('get gig by category successfully');
  } catch (error) {
    next(error);
  }
};
export const topRatedGigsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await getUserSelectedCache(`selectedCategories:${req.params.username}`);
    const gigs = await getTopGigsByCategory(category);
    if (!Object.keys(gigs).length) {
      throw new NotFoundError('top rated gigs by category does not found', 'gig-service topRatedGigsByCategory() method: error');
    }
    let resultHits = gigs.hits.map((item) => item._source);

    res.status(StatusCodes.OK).json({ message: 'Search top gigs results', gig: resultHits, total: gigs.total });
  } catch (error) {
    next(error);
  }
};

export const similarGigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gigs = await getMoreGigsLikeThis(req.params.gigId);
    if (!Object.keys(gigs).length) {
      throw new NotFoundError('similar gigs by this GigID does not found', 'gig-service similarGigs() method: error');
    }
    let resultHits = gigs.hits.map((item) => item._source);
    res.status(StatusCodes.OK).json({ message: 'More gigs like this result', gig: resultHits, total: gigs.total });
    logger.info('get More gigs like this result successfully');
  } catch (error) {
    next(error);
  }
};
