import { IReviewDocument } from '@review/type/reviewType';
import { addReview } from '@review/service/review.service';
import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

export const review = async (req: Request, res: Response): Promise<void> => {
  const review: IReviewDocument = await addReview(req.body);
  res.status(StatusCodes.CREATED).json({ message: 'Review created successfully.', review });
};
