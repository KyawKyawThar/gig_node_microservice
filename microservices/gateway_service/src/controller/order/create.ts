import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { NextFunction, Request, Response } from 'express';
import { orderService } from '@gateway/services/api/orderService';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway service', 'debug');

export class Create {
  public async intent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await orderService.createOrderIntent(req.body.price, req.body.orderId);

      logger.info(response.data.message);
      res
        .status(StatusCodes.CREATED)
        .json({ message: response.data.message, clientSecret: response.data.clientSecret, paymentIntentId: response.data.paymentIntentId });
    } catch (err) {
      next(err);
    }
  }

  public async order(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await orderService.createOrder(req.body);
      logger.info(response.data.message);
      res.status(StatusCodes.CREATED).json({ message: response.data.message, order: response.data.order });
    } catch (err) {
      next(err);
    }
  }
}
