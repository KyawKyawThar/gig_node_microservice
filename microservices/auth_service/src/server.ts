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

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export function start(app: Application) {
  applyMiddleware(app);
  standardMiddleware(app);
  routeMiddleware(app);
  startQueue();
  startElasticSearch();
  errorHandler(app);
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
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];

      const payload = verify(token, config.JWT_TOKEN) as IAuthPayload;
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

async function startQueue(): Promise<void> {}

function startElasticSearch(): void {
  checkConnection();
}

function errorHandler(app: Application): void {
  app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.log('err', `Auth service ${err.comingFrom}`, err);

    // Check if the error has a serializeError method, indicating it's a custom error
    if (typeof err.serializeError === 'function') {
      res.status(err.statusCode).json(err.serializeError());
    } else {
      // Handle non-custom errors or propagate to the next middleware
      res.status(500).json({ message: 'An unexpected error occurred' });
    }
    next();
  });
}
