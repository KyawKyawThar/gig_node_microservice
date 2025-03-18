import { NextFunction, Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import { reviewService } from '@gateway/services/api/reviewService';
import { StatusCodes } from 'http-status-codes';

export class Get {
  public async reviewsByGigId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await reviewService.getReviewsByGigId(req.params.gigId);
      res.status(StatusCodes.OK).json({ message: response.data.message, reviews: response.data.reviews });
    } catch (err) {
      next(err);
    }
  }

  public async reviewsBySellerId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await reviewService.getReviewsBySellerId(req.params.sellerId);
      res.status(StatusCodes.OK).json({ message: response.data.message, reviews: response.data.reviews });
    } catch (err) {
      next(err);
    }
  }
}
