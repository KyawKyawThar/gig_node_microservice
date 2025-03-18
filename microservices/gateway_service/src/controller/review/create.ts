import { StatusCodes } from 'http-status-codes';
import { reviewService } from '@gateway/services/api/reviewService';
import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response } from 'express';

export class Create {
  public async review(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response: AxiosResponse = await reviewService.addReview(req.body);
      res.status(StatusCodes.CREATED).json({ message: response.data.message, review: response.data.review });
    } catch (error) {
      next(error);
    }
  }
}
