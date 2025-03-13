import http from 'http';

import { Application, json, NextFunction, urlencoded, Request, Response } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from './logger';
import { config } from '@gig/config';
import { Channel } from 'amqplib';
import compression from 'compression';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from './types/gigTypes';
import { createConnection } from './queue/connection';
import { checkConnection, createIndex } from './elasticSearch';
import { appRoutes } from './routes';
import { IErrorResponse } from './types/errorHandlerTypes';
import { CustomError } from './errorHandler';
import { consumeGigDirectMessage, consumeGigSeedDirectMessage } from './queue/gig.consumer';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigService', 'debug');

export let gigChannel: Channel;
export function start(app: Application) {
  startQueue();
  startElasticSearch();

  standardMiddleware(app);
  securityMiddleware(app);
  routerMiddleware(app);
  gigErrorHandler(app);
  startServer(app);
}

async function startQueue() {
  gigChannel = (await createConnection()) as Channel;
  await consumeGigDirectMessage(gigChannel);
  await consumeGigSeedDirectMessage(gigChannel);
}

async function startElasticSearch() {
  await checkConnection();
  await createIndex('gigs');
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
      const token = req.headers.authorization.split(' ')[1];
      const payload = verify(token, config.JWT_SECRET) as IAuthPayload;
      req.currentUser = payload;
      logger.info('gig-service', req.url);
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

function gigErrorHandler(app: Application) {
  app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.error(`Gig service gigErrorHandler ${err.comingFrom}`);

    if (err instanceof CustomError) {
      return res.status(err.statusCode).json(err?.serializeError());
    }
    next();
  });
}

function startServer(app: Application) {
  try {
    logger.info(`Gig server has started with process id ${process.pid}`);
    const server = new http.Server(app);

    server.listen(config.GIG_SERVER_PORT, () => {
      logger.info(`Gig server is running on port ${config.GIG_SERVER_PORT}`);
    });

    process.once('uncaughtException', (err) => {
      logger.log('error', 'Unhandled error:', err);
    });
  } catch (error) {
    logger.log('error', 'Gig service startServer() method error:', error);
  }
}
