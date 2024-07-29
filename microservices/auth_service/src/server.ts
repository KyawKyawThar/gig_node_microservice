import http from 'http';

import { Logger } from 'winston';
import { winstonLogger } from '@auth/logger';
import { config } from '@auth/config';
import { Application, NextFunction, Request, Response, json, urlencoded } from 'express';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from '@auth/types/authTypes';
import { IErrorResponse } from '@auth/types/errorHandlerTypes';
import { checkConnection } from '@auth/elasticSearch';
import { appRoutes } from '@auth/routes';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createConnection } from '@auth/queues/connection';
import { Channel } from 'amqplib';

import { CustomError } from './errorHandler';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServer', 'debug');

export let authChannel: Channel;

export function start(app: Application) {
  applyMiddleware(app);
  standardMiddleware(app);
  routeMiddleware(app);
  startQueue();
  startElasticSearch();
  authErrorHandler(app);
  startServer(app);
}

function applyMiddleware(app: Application): void {
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
    max: 100,
    windowMs: 60 * 60 * 1000,
    standardHeaders: 'draft-7',
    message: 'Too many requests from this IP, please try again in an hour!'
  });

  app.use(limiter);

  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    if (req.headers?.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const payload = verify(token, config.JWT_SECRET) as IAuthPayload;
      req.currentUser = payload;
    }
    next();
  });
}

function standardMiddleware(app: Application): void {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routeMiddleware(app: Application): void {
  appRoutes(app);
}

async function startQueue(): Promise<void> {
  authChannel = (await createConnection()) as Channel;
}

function startElasticSearch(): void {
  checkConnection();
}

function authErrorHandler(app: Application): void {
  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log('error', `Auth service ${error.comingFrom}`, error.serializeError());
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.serializeError());
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    logger.info(`Authentication server has started with process id ${process.pid}`);

    const server = new http.Server(app);

    server.listen(config.AUTH_SERVER_PORT, () => {
      logger.info(`Authentication server running on port ${config.AUTH_SERVER_PORT}`);
    });
  } catch (err) {
    logger.log('error', 'Auth service startHTTPServer() method error: ', err);
  }
}
