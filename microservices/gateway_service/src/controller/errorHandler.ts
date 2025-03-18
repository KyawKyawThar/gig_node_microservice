import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { winstonLogger } from '@gateway/logger';
import { config } from '@gateway/config';
import { CustomError, NotFoundError } from '@gateway/errorHandler';
import { isAxiosError } from 'axios';
import { AxiosErrorWithServiceName, IErrorResponse } from '@gateway/types/errorHandlerTypes';
import { StatusCodes } from 'http-status-codes';

const logger: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway server', 'debug');
export class ErrorHandlerController {
  public static handleNotFound(req: Request, _res: Response, next: NextFunction): void {
    const fullURL = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    logger.error(`Gateway service: ${fullURL} endpoint is not valid`);
    next(new NotFoundError('The endpoint called does not exist', 'handleNotFound()'));
  }

  public static handleGlobalErrors(err: IErrorResponse, _req: Request, res: Response, next: NextFunction) {
    console.log('axosErrorCode', err);
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json(err.serializeError());
    }

    if (isAxiosError(err)) {
      const axiosError = err as AxiosErrorWithServiceName;
      const serviceName = axiosError.serviceName || 'unknown-service';

      if (axiosError.code === 'ECONNREFUSED') {
        logger.error(`GatewayService Axios Error - ${serviceName}: Service is not reachable.`);
        return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
          message: `${serviceName} service is not reachable or started.`
        });
      }

      return res.status(err?.response?.data?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err?.response?.data ?? 'Something went wrong..'
      });
    }

    logger.error(`Unhandled error: ${err.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred.' });
    next();
  }
}
