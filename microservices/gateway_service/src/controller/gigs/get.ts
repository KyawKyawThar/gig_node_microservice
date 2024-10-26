import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { gigService } from '@gateway/services/api/gigService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');
export class Get {
  public async gigById(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId } = req.params;
      const response = await gigService.getGigById(gigId);

      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gigs });
    } catch (error) {
      next(error);
    }
  }
  public async sellerByGigId(req: Request, res: Response, next: NextFunction) {
    try {
      const { sellerId } = req.params;
      const response = await gigService.sellerByGigId(sellerId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
    } catch (error) {
      next(error);
    }
  }

  public async sellerInactiveGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const { sellerId } = req.params;
      const response = await gigService.sellerInactiveGigs(sellerId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
    } catch (error) {
      next(error);
    }
  }

  public async gigByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const response = await gigService.gigByCategory(username);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
    } catch (error) {
      next(error);
    }
  }
  public async topRelatedGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const response = await gigService.topRelatedGigs(username);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig });
    } catch (error) {
      next(error);
    }
  }

  public async similarGigs(req: Request, res: Response, next: NextFunction) {
    try {
      const { gigId } = req.params;
      const response = await gigService.similarGigs(gigId);
      logger.info(response.data.message);
      res.status(StatusCodes.OK).json({ message: response.data.message, gig: response.data.gig, total: response.data.total });
    } catch (error) {
      next(error);
    }
  }
}
