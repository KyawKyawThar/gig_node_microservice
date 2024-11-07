import http from 'http';

import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import { winstonLogger } from './logger';
import { config } from './config';
import { Logger } from 'winston';
import { Channel } from 'amqplib';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from './types/authTypes';
import compression from 'compression';
import { appRoutes } from './routes';
import { checkConnection } from './elasticSearch';
import { IErrorResponse } from './types/errorHandlerTypes';
import { CustomError } from './errorHandler';
import { createConnection } from '@user/queues/connection';
import {
  consumeBuyerDirectMessage,
  consumeReviewFanoutDirectMessage,
  consumeSeedGigDirectMessage,
  consumeSellerDirectMessage
} from '@user/queues/user.consumer';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'user Service', 'debug');

export const start = (app: Application): void => {
  startServer(app);
  securityMiddleware(app);
  standardMiddleware(app);
  routeMiddleware(app);
  userErrorHandler(app);
  startElasticSearch();
  startQueue();
};

const securityMiddleware = (app: Application): void => {
  // app.set('trust proxy', 1);

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
    message: 'Too many requests from this IP, please try again in an hour!'
  });
  app.use(limiter);

  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    logger.info(req.url);
    if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const payload = verify(token, config.JWT_SECRET) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
};

const routeMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueue = async () => {
  const userChannel = (await createConnection()) as Channel;
  await consumeBuyerDirectMessage(userChannel);
  await consumeSellerDirectMessage(userChannel);
  await consumeReviewFanoutDirectMessage(userChannel);
  await consumeSeedGigDirectMessage(userChannel);
};

const startElasticSearch = async (): Promise<void> => {
  await checkConnection();
};

const userErrorHandler = (app: Application): void => {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log('error', `User service ${error.comingFrom}`, error.message);

    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error?.serializeError());
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    next();
  });
};

const startServer = (app: Application): void => {
  try {
    logger.info(`Users service has started with process id ${process.pid}`);

    const server = new http.Server(app);
    server.listen(config.USER_SERVER_PORT, () => {
      logger.info(`UserService service is running on port ${config.USER_SERVER_PORT}`);
    });

    process.once('uncaughtException', (err) => {
      logger.log('error', 'Unhandled error:', err);
    });
  } catch (err) {
    logger.log('error', 'User service startHTTPServer() method error: ', err);
  }
};
