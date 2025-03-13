import http from 'http';

import { Channel } from 'amqplib';
import { Server } from 'socket.io';
import { config } from './config';
import { winstonLogger } from './logger';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import { verify } from 'jsonwebtoken';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { IOrderPayload } from './types/orderTypes';
import { checkConnection } from './elasticSearch';
import { createConnection } from './queue/connection';
import compression from 'compression';
import { appRoutes } from './route';
import { IErrorResponse } from './types/errorHandlerTypes';
import { CustomError } from './errorHandler';
import { consumerReviewFanoutMessages } from '@order/queue/order.consumer';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderService', 'debug');

export let socketIOOrderObject: Server;
export let orderChannel: Channel;

export function start(app: Application) {
  startQueue();
  startElasticSearch();

  securityMiddleware(app);
  standardMiddleware(app);
  routerMiddleware(app);
  orderErrorHandler(app);
  startServer(app);
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
  orderChannel = (await createConnection()) as Channel;
  await consumerReviewFanoutMessages(orderChannel);
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routerMiddleware(app: Application) {
  appRoutes(app);
}
function orderErrorHandler(app: Application) {
  app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.error(`order server orderErrorHandler ${err.comingFrom}`);
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json(err?.serializeError());
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
    logger.log('error', 'order service startServer() method error', error);
  }
}
function createSockIOServer(httpServer: http.Server): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });

  return io;
}

function startHttpServer(server: http.Server): void {
  try {
    logger.info(`order server has started with process id ${process.pid}`);

    server.listen(config.ORDER_BASE_PATH, () => {
      logger.info(`Order server is running on port ${config.ORDER_SERVER_PORT}`);
    });

    process.on('uncaughtException', (error) => {
      logger.log('error', 'Unhandled error: ', error);
    });
  } catch (error) {
    logger.log('error', 'order service startHttpServer() method error:', error);
  }
}
