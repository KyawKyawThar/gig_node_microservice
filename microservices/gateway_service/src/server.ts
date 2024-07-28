import http from 'http';

import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { HttpStatusCode } from 'axios';
import { winstonLogger } from '@gateway/logger';
import { IErrorResponse } from '@gateway/types/errorHandlerTypes';
import { CustomError } from '@gateway/errorHandler';
import { config } from '@gateway/config';
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import { elasticSearch } from '@gateway/elasticSearch';
import { appRoutes } from '@gateway/routes';
import { AxiosAuthInstance } from '@gateway/api/authService';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');

export class GateWayService {
  private app: Application;

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

    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
        secure: config.NODE_ENV !== 'development',
        maxAge: 24 * 60 * 60 * 1000
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
      if (!req.session?.jwt) {
        AxiosAuthInstance.defaults.headers['authorization'] = `Bearer ${req.session?.jwt}`;
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
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

      logger.log('error', `${fullURL} endpoint is not valid`);

      res.status(HttpStatusCode.BadRequest).json({ message: 'The end point called does not exist' });
      next();
    });

    app.use((err: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      logger.log('error', `Gateway service ${err.comingFrom}`, err);

      if (err instanceof CustomError) {
        res.status(err.statusCode).json(err.serializeError());
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.startHTTPServer(httpServer);
    } catch (err) {
      logger.log('error', 'Gateway service startServer() method error: ', err);
    }
  }

  private async startHTTPServer(httpServer: http.Server): Promise<void> {
    try {
      logger.info(`Gateway service has started with process id ${process.pid}`);

      httpServer.listen(config.GATEWAY_SERVER_PORT, () => {
        logger.info(`Gateway service is running on port: ${config.GATEWAY_SERVER_PORT}`);
      });
    } catch (err) {
      logger.log('error', 'Gateway service startHTTPServer() method error: ', err);
    }
  }
}
