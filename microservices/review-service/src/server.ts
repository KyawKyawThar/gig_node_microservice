import { winstonLogger } from '@review/logger';
import { config } from '@review/config';
import { Channel } from 'amqplib';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import { reviewCreateConnection } from '@review/queue/connection';
import { checkConnection } from '@review/elasticSearch';

import http from 'http';
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { verify } from 'jsonwebtoken';
import { IReviewPayload } from '@review/type/reviewType';
import compression from 'compression';
import { appRoutes } from '@review/route';
import { IErrorResponse } from '@review/type/errorHandlerTypes';
import { CustomError } from '@review/errorHandler';

const logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewService', 'debug');

export let reviewChannel: Channel;

export function start(app: Application) {
  startServer(app);
  securityMiddleware(app);
  standardMiddleware(app);
  routerMiddleware(app);
  reviewErrorHandler(app);

  startQueue();
  startElasticSearch();
}

function startServer(app: Application) {
  try {
    logger.info(`Review server has started with process id ${process.pid}`);
    const server = new http.Server(app);

    server.listen(config.REVIEW_SERVER_PORT, () => {
      logger.info(`Review server running on port ${config.REVIEW_SERVER_PORT}`);
    });
    process.once('uncaughtException', (err) => {
      logger.log('error', 'Unhandled error:', err);
    });
  } catch (err) {
    logger.log('error', 'Review service startServer() method error:');
  }
}
async function startQueue() {
  reviewChannel = (await reviewCreateConnection()) as Channel;
}

async function startElasticSearch() {
  await checkConnection();
}

function securityMiddleware(app: Application) {
  app.set('truest proxy', 1);
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
    if (req.headers.authorization && req.headers?.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      logger.info(token);
      const payload = verify(token, config.JWT_SECRET) as IReviewPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routerMiddleware(app: Application) {
  appRoutes(app);
}

function reviewErrorHandler(app: Application) {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log('error', `Review Service ${error.comingFrom}`, error?.serializeError());

    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error?.serializeError());
    }
    next();
  });
}
