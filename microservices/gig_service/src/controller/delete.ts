import { NextFunction, Request, Response } from 'express';
import { Logger } from 'winston';
import { config } from '@gig/config';
import { winstonLogger } from '@gig/logger';
import { deleteGigById } from '@gig/services/gig.service';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '@gig/errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gig-service', 'debug');

export const deleteGig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deleteGigById(req.params.gigId, req.params.sellerId);

    if (!result) {
      throw new NotFoundError('can not delete gigs with that id', 'deleteGig() by method error');
    }

    res.status(StatusCodes.OK).json({ message: 'Gig has been deleted successfully', gig: result });

    logger.info('gig has been deleted successfully');
  } catch (error) {
    next(error);
  }
};
