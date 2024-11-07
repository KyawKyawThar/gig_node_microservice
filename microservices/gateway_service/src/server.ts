import http from 'http';

import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { HttpStatusCode, isAxiosError } from 'axios';
import { winstonLogger } from '@gateway/logger';
import { AxiosErrorWithServiceName, IErrorResponse } from '@gateway/types/errorHandlerTypes';
import { CustomError } from '@gateway/errorHandler';
import { config } from '@gateway/config';
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import { elasticSearch } from '@gateway/elasticSearch';
import { appRoutes } from '@gateway/routes';
import { axiosAuthInstance } from '@gateway/services/api/authService';
import { axiosBuyerInstance } from '@gateway/services/api/buyerService';
import { axiosSellerInstance } from '@gateway/services/api/sellerService';
import { axiosGigInstance } from '@gateway/services/api/gigService';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { SocketIOAppHandler } from '@gateway/socket/socket';
import { createAdapter } from '@socket.io/redis-adapter';
import { axiosChatInstance } from './services/api/chatService';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

export let socketIO: Server;
export class GateWayService {
  private readonly app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routerMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', '1');

    //IMPORTANT NOTE: be careful using SECRET_KEY_ONE and SECRET_KEY_TWO  enable key rotation.
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
        secure: config.NODE_ENV !== 'development',
        maxAge: 15 * 60 * 1000
      })
    );

    app.use(
      cors({
        origin: `${config.CLIENT_BASE_URL}`,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );

    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
        axiosBuyerInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
        axiosSellerInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
        axiosGigInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
        axiosChatInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
      }

      next();
    });
    app.use(hpp());
    app.use(helmet());
  }
  private standardMiddleware(app: Application): void {
    app.use(compression());

    app.use(json({ limit: '200mb' }));

    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routerMiddleware(app: Application): void {
    appRoutes(app);
  }
  private async startElasticSearch(): Promise<void> {
    await elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    // Handle invalid endpoints

    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      logger.error(`gateway service: ${fullURL} endpoint is not valid`);

      res.status(HttpStatusCode.BadRequest).json({ message: 'The end point called does not exist' });
      next();
    });

    // Global error handler
    app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (err instanceof CustomError) {
        res.status(err.statusCode).json(err.serializeError());
      }

      if (isAxiosError(err)) {
        const axiosError = err as AxiosErrorWithServiceName;
        const serviceName = axiosError.serviceName || 'unknown-service';

        if (axiosError.code === 'ECONNREFUSED') {
          logger.log('error', `GatewayService Axios Error - ${serviceName}: Service is not reachable.`);
          return res.status(503).json({ message: `${serviceName} service is not reachable or started.` });
        }

        // logger.log('error', `GatewayService Axios Error - ${serviceName} service:`, axiosError.response?.data);
        // return res.status(axiosError.response?.status ?? 500).json({
        //   message: axiosError.response?.data || 'Error occurred.',
        //   service: serviceName
        // });
        res.status(err?.response?.data?.statusCode ?? 500).json({ message: err?.response?.data?.message ?? 'Something went wrong..' });
      }

      // console.log('ttt', err?.response?.data?.message);
      // res.status(500).json({
      //   message: 'An unexpected error occurred.',
      //   error: err.data
      // });

      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO = await this.createSocketIOServer(httpServer);
      await this.startHTTPServer(httpServer);
      this.socketIOConnection(socketIO);
    } catch (err) {
      logger.log('error', 'Gateway service startServer() method error: ', err);
    }
  }

  private async createSocketIOServer(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: `${config.CLIENT_BASE_URL}`,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    socketIO = io;
    return io;
  }

  private socketIOConnection(io: Server): void {
    const socketIOHandler = new SocketIOAppHandler(io);
    socketIOHandler.listen();
  }

  private async startHTTPServer(httpServer: http.Server): Promise<void> {
    try {
      logger.info(`Gateway service has started with process id ${process.pid}`);
      httpServer.listen(config.GATEWAY_SERVER_PORT, () => {
        logger.info(`Gateway service is running on port: ${config.GATEWAY_SERVER_PORT}`);
      });
      process.once('uncaughtException', (err) => {
        logger.log('error', 'Unhandled error:', err);
      });
    } catch (err) {
      logger.log('error', 'Gateway service startHTTPServer() method error: ', err);
    }
  }
}
