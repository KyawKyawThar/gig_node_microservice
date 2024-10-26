import { Logger } from 'winston';
import { Response, Request, NextFunction } from 'express';
import { winstonLogger } from '@user/logger';
import { config } from '@user/config';
import { getRandomSeller, getSellerById, getSellerByUsername } from '@user/services/seller.service';
import { NotFoundError } from '@user/errorHandler';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'seller-service', 'debug');

export async function sellerById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const seller = await getSellerById(req.params.sellerId);

    if (!seller) {
      throw new NotFoundError('seller does not exist', 'Get sellerById() method error');
    }

    res.status(StatusCodes.OK).json({ message: 'Seller profile', seller: seller });
    logger.info('Get seller by id has been successfully fetched');
  } catch (error) {
    next(error);
  }
}

export async function sellerByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const seller = await getSellerByUsername(req.params.sellerUsername);

    if (!seller) {
      throw new NotFoundError('seller does not exits', 'get sellerByUsername() method error');
    }

    res.status(StatusCodes.OK).json({ message: 'Seller profile', seller: seller });
  } catch (error) {
    next(error);
  }
}

export async function randomSeller(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sellers = await getRandomSeller(parseInt(req.params.size, 10));
    res.status(StatusCodes.OK).json({ message: 'Random sellers profile', sellers });
  } catch (error) {
    next(error);
  }
}
