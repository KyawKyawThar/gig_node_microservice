import { IReviewDocument } from '@review/type/reviewType';
import { addReview } from '@review/service/review.service';
import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';

export const review = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const review: IReviewDocument = await addReview(req.body);
    res.status(StatusCodes.CREATED).json({ message: 'Review created successfully.', review });
  } catch (error) {
    next(error);
  }
};
