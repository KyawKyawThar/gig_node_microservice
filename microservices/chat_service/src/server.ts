import { Logger } from 'winston';
import { winstonLogger } from './logger';
import { config } from './config';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import { Server } from 'socket.io';
import { Channel } from 'amqplib';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from './types/chatTypes';
import compression from 'compression';
import { IErrorResponse } from './types/errorHandlerTypes';
import { CustomError } from './errorHandler';
import http from 'http';
import { createConnection } from './queue/connection';
import { checkConnection } from './elasticSearch';
import { appRoutes } from './route';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatService', 'debug');

export let socketIOChatObject: Server;
export let chatChannel: Channel;

export function start(app: Application) {
  startQueue();
  startElasticSearch();

  securityMiddleware(app);
  standardMiddleware(app);
  routerMiddleware(app);
  chatErrorHandler(app);
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
      const payload = verify(token, config.JWT_SECRET) as IAuthPayload;
      req.currentUser = payload;
    }

    next();
  });
}

async function startElasticSearch() {
  await checkConnection();
}

async function startQueue() {
  chatChannel = (await createConnection()) as Channel;
}

function standardMiddleware(app: Application) {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ extended: true, limit: '200mb' }));
}

function routerMiddleware(app: Application) {
  appRoutes(app);
}

function chatErrorHandler(app: Application) {
  app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.error(`chat service chatErrorHandler ${err.comingFrom}`);
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json(err?.serializeError());
    }
    next();
  });
}

function startServer(app: Application): void {
  try {
    const server = new http.Server(app);
    socketIOChatObject = createSockIOServer(server);
    startHttpServer(server);
  } catch (error) {
    logger.log('error', 'chat service startServer() method error', error);
  }
}

function createSockIOServer(httpServer: http.Server): Server {
  return new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });
}

function startHttpServer(server: http.Server): void {
  try {
    logger.info(`chat server has started with process id ${process.pid}`);
    server.listen(config.CHAT_SERVER_PORT, () => {
      logger.info(`Chat server is running on port ${config.CHAT_SERVER_PORT}`);
    });

    process.once('uncaughtException', (error) => {
      logger.log('error', 'Unhandled error: ', error);
    });
  } catch (error) {
    logger.log('error', 'chat service startHttpServer() method error:', error);
  }
}
