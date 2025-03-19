import { publicDirectMessage } from '@gig/queue/gig.producer';
import { gigChannel } from '@gig/server';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
//import { consumeGigSeedDirectMessage } from '@gig/queue/gig.consumer';

export const gigBySeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { count } = req.params;

    await publicDirectMessage(
      gigChannel,
      'user-seller-seed',
      'seller-gig',
      JSON.stringify({ type: 'getSellers', count }),
      'Gig seed message sent to user service.'
    );

    // await consumeGigSeedDirectMessage(gigChannel);

    res.status(StatusCodes.CREATED).json({ message: 'Gig seed created successfully' });
  } catch (error) {
    next(error);
  }
};
