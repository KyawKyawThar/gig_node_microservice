import { winstonLogger } from '@order/logger';
import { config } from '@order/config';
import { Application, Response, Request, NextFunction, json, urlencoded } from 'express';

import http from 'http';
import * as process from 'node:process';
import { Server } from 'socket.io';
import { Channel } from 'amqplib';
import { appRoutes } from '@order/route';
import { checkConnection } from '@order/elasticSearch';
import { createOrderConnection } from '@order/queue/connection';
import { consumerReviewFanoutMessages } from '@order/queue/order.consumer';
import hpp from 'hpp';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import { IOrderPayload } from '@order/types/orderTypes';
import { IErrorResponse } from '@order/types/errorHandlerTypes';
import { CustomError } from '@order/errorHandler';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderService', 'debug');

export let socketIOOrderObject: Server;
export let orderChannel: Channel;
export async function start(app: Application) {
  await startElasticSearch();
  await startQueue();

  securityMiddleware(app);
  standardMiddleware(app);
  routerMiddleware(app);
  orderErrorHandler(app);
  startServer(app);
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function securityMiddleware(app: Application) {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: config.API_GATEWAY_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
  );

  const limiter = rateLimit({
    limit: 100,
    windowMs: 60 * 60 * 1000,
    standardHeaders: 'draft-7',
    message: 'Too many requests from this IP, please try again an hour!'
  });

  app.use(limiter);

  app.use(async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (req.headers?.authorization && req.headers?.authorization.startsWith('Bearer')) {
      const token = req.headers?.authorization.split(' ')[1];
      const payload = verify(token, config.JWT_SECRET) as IOrderPayload;
      req.currentUser = payload;
    }

    next();
  });
}

async function startElasticSearch() {
  await checkConnection();
}

async function startQueue() {
  orderChannel = (await createOrderConnection()) as Channel;
  await consumerReviewFanoutMessages(orderChannel);
}

function routerMiddleware(app: Application) {
  appRoutes(app);
}

function createSockIOServer(httpServer: http.Server): Server {
  return new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });
}

function orderErrorHandler(app: Application) {
  app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.error(`order server orderErrorHandler ${err.comingFrom}`);

    if (err instanceof CustomError) {
      res.status(err.statusCode).json(err.message);
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(err.message);
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    const server = new http.Server(app);
    socketIOOrderObject = createSockIOServer(server);
    startHttpServer(server);
  } catch (error) {
    logger.error('startServer error', 'order service startServer() method error', error);
  }
}

function startHttpServer(server: http.Server) {
  try {
    logger.info(`order service has started with process id ${process.pid}`);
    server.listen(config.ORDER_SERVER_PORT, () => {
      logger.info(`Order service is running on port ${config.ORDER_SERVER_PORT}`);
    });
  } catch (error) {
    logger.error('start httpServer error', error);
  }
}
