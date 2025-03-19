import { NextFunction, Response, Request } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from '@user/logger';
import { config } from '@user/config';
import { getUserByEmail, getUserByUsername } from '@user/services/buyer.service';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '@user/errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'buyer-service', 'debug');

export async function getEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const buyer = await getUserByEmail(req.currentUser.email);

    if (!buyer) {
      throw new NotFoundError('buyer not found', 'buyer-service get() method error');
    }

    res.status(StatusCodes.OK).json({ message: 'Buyer profile', buyer });

    logger.info('Buyer for getUserByEmail has been get successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const currentUsername = await getUserByUsername(req.currentUser.username);

    logger.info('currentUsername', currentUsername);
    if (!currentUsername) {
      throw new NotFoundError('buyer not found', 'buyer-service currentUsername() method error');
    }

    res.status(StatusCodes.OK).json({ message: 'Buyer profile by username', currentUsername });
  } catch (error) {
    next(error);
  }
}

export async function getUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const buyerByUsername = await getUserByUsername(req.params.username);

    if (!buyerByUsername) {
      throw new NotFoundError('buyer not found', 'buyer-service username() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'Buyer profile', buyerByUsername });
  } catch (e) {
    next(e);
  }
}
