import http from 'http';

import cookieParser from 'cookie-parser';
import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
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
import { axiosChatInstance } from '@gateway/services/api/chatService';
import { axiosOrderInstance } from '@gateway/services/api/orderService';
import { axiosReviewInstance } from '@gateway/services/api/reviewService';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOAppHandler } from '@gateway/socket/socket';

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
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust proxy', '1');
    app.use(cookieParser());
    //IMPORTANT NOTE: be careful using SECRET_KEY_ONE and SECRET_KEY_TWO  enable key rotation.
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
        secure: config.NODE_ENV !== 'development',
        ...(config.NODE_ENV !== 'development' && {
          sameSite: 'none'
        }),
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
        axiosOrderInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
        axiosReviewInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
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

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      // logger.log('info', 'HTTP Server created successfully');
      //
      const socketServer = await this.createSocketIOServer(httpServer);

      await this.startHTTPServer(httpServer);

      this.socketIOConnection(socketServer);
      logger.log('info', 'Socket.IO Connection initialized');

      logger.log('info', 'HTTP Server started successfully');
    } catch (err) {
      logger.log('error', 'Gateway service startServer() method error: ', err);
    }
  }

  //createSocketIOServer will add after Client URL is established
  private async createSocketIOServer(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: `${config.CLIENT_BASE_URL}`,
        //credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    //  from socketIO-redis adapter
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    socketIO = io;
    return io;
  }

  private async startHTTPServer(httpServer: http.Server): Promise<void> {
    try {
      //  process.setMaxListeners(20);
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

  private socketIOConnection(io: Server): void {
    const adapter = new SocketIOAppHandler(io);
    adapter.listen();
  }
}
