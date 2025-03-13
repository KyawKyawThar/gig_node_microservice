import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { IReviewDocument } from '@review/type/reviewType';
import { getReviewsByGigId, getReviewsBySellerId } from '@review/service/review.service';

export const reviewsByGigId = async (req: Request, res: Response): Promise<void> => {
  const reviews: IReviewDocument[] = await getReviewsByGigId(req.params.gigId);
  res.status(StatusCodes.OK).json({ message: 'Gig reviews by gig id', reviews });
};

export const reviewsBySellerId = async (req: Request, res: Response): Promise<void> => {
  const reviews: IReviewDocument[] = await getReviewsBySellerId(req.params.sellerId);
  res.status(StatusCodes.OK).json({ message: 'Gig reviews by seller id', reviews });
};
