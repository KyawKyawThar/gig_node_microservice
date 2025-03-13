import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getOrderByOrderId, getOrderBySellerId, getOrdersByBuyerId } from '@order/services/order.service';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order_service', 'debug');

export const orderId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await getOrderByOrderId(orderId);
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
    res.status(StatusCodes.OK).json({ message: 'Orders received by buyer id', buyer });
    logger.info('get buyer by id has been called successfully');
  } catch (error) {
    next(error);
  }
};
