import { Logger } from 'winston';
import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { orderSchema } from '@order/schema/order';
import { BadRequestError } from '@order/errorHandler';
import { createOrder } from '@order/services/order.service';
import { IOrderDocument } from '@order/types/orderTypes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order-service', 'debug');

const stripe = new Stripe(config.STRIPE_API_KEY, { typescript: true });

export const intent = async (req: Request, res: Response): Promise<void> => {
  const customer = await stripe.customers.search({
    query: `email: ${req.currentUser!.email}`
  });

  let customerId = '';
  if (!customer.data.length) {
    const createdCustomer = await stripe.customers.create({
      email: `${req.currentUser!.email}`,
      metadata: {
        buyerId: `${req.body.buyerId}`
      }
    });

    customerId = createdCustomer.id;
  } else {
    customerId = customer.data[0].id;
  }

  let paymentIntent;

  if (customerId) {
    // the service charge is 5.5% of the purchase amount
    // for purchases under $50, an additional $2 is applied

    const service = req.body.price > 50 ? req.body.price * (5.5 / 100) : (req.body.price + 2) * (5.5 / 100);

    paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: Math.floor((req.body.price + service) * 100),
      customer: customerId,
      automatic_payment_methods: { enabled: true }
    });

    logger.info('intent method have been created successfully');
    res.status(StatusCodes.CREATED).json({
      message: 'Order intent created successfully.',
      clientSecret: paymentIntent!.client_secret,
      paymentIntentId: paymentIntent!.id
    });
  }
};

export const order = async (req: Request, res: Response): Promise<void> => {
  const { error } = orderSchema.validate(req.body);

  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create order() method');
  }

  const serviceFee = req.body.price > 50 ? req.body.price * (5.5 / 100) : (req.body.price + 2) * (5.5 / 100);

  let orderData: IOrderDocument = req.body;
  orderData = { ...orderData, serviceFee };
  const order = await createOrder(orderData);
  res.status(StatusCodes.CREATED).json({ message: 'Order created successfully', order });
};
