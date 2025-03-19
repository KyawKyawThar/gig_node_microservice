import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import Stripe from 'stripe';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { orderSchema } from '@order/schema/order';
import { BadRequestError } from '@order/errorHandler';
import { createOrder } from '@order/services/order.service';
import { IOrderDocument } from '@order/types/orderTypes';
//import { isInteger } from 'lodash';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order-service', 'debug');

const stripe = new Stripe(config.STRIPE_API_KEY, { typescript: true });

export const intent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer: Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer>> = await stripe.customers.search({
      query: `email:"${req.currentUser!.email}"`
    });

    let customerId = '';
    if (customer.data.length === 0) {
      const createdCustomer: Stripe.Response<Stripe.Customer> = await stripe.customers.create({
        email: `${req.currentUser!.email}`,
        metadata: {
          buyerId: `${req.body.buyerId}`
        }
      });
      customerId = createdCustomer.id;
    } else {
      customerId = customer.data[0].id;
    }

    let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
    if (customerId) {
      // the service charge is 5.5% of the purchase amount
      // for purchases under $50, an additional $2 is applied
      const serviceFee: number = req.body.price < 50 ? (5.5 / 100) * req.body.price + 2 : (5.5 / 100) * req.body.price;
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.floor((req.body.price + serviceFee) * 100),
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: { enabled: true }
      });

      logger.info(paymentIntent);
    }

    res.status(StatusCodes.CREATED).json({
      message: 'Order intent created successfully.',
      clientSecret: paymentIntent!.client_secret,
      paymentIntentId: paymentIntent!.id
    });
  } catch (err) {
    next(err);
  }
};

export const order = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { error } = orderSchema.validate(req.body);

    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Create order() method');
    }
  } catch (error) {
    next(error);
  }

  const serviceFee = req.body.price > 50 ? req.body.price * (5.5 / 100) : (req.body.price + 2) * (5.5 / 100);

  let orderData: IOrderDocument = req.body;
  orderData = { ...orderData, serviceFee };
  const order = await createOrder(orderData);
  logger.info('Order created successfully');
  res.status(StatusCodes.CREATED).json({ message: 'Order created successfully', order });
};
