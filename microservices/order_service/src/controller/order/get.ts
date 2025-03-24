import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getOrderByOrderId, getOrderBySellerId, getOrdersByBuyerId } from '@order/services/order.service';
import { NotFoundError } from '@order/errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order_service', 'debug');

export const orderId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;

    //console.log('orderId is:', orderId);
    const order = await getOrderByOrderId(orderId);

    if (!order) {
      throw new NotFoundError('Order not found with that orderId', 'orderId() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'Order by order id', orderId: order });
    logger.info('get order by id has been called successfully');
  } catch (error) {
    next(error);
  }
};

export const sellerId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sellerId } = req.params;
    const seller = await getOrderBySellerId(sellerId);

    if (!seller) {
      throw new NotFoundError('Seller does not exists ', 'sellerId() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'Seller orders received by id', seller });
    logger.info('get seller by id has been called successfully');
  } catch (error) {
    next(error);
  }
};

export const buyerId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { buyerId } = req.params;
    const buyer = await getOrdersByBuyerId(buyerId);
    if (!buyer) {
      throw new NotFoundError('Buyer  does not exists ', 'buyerId() method error');
    }
    res.status(StatusCodes.OK).json({ message: 'Orders received by buyer id', buyer });
    logger.info('get buyer by id has been called successfully');
  } catch (error) {
    next(error);
  }
};
