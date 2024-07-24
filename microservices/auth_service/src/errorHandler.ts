import { IError, IErrorResponse } from '@auth/types/errorHandlerTypes';
import { StatusCodes } from 'http-status-codes';

export function createCustomError(statusCode: number, status: string, comingFrom: string, message: string): IErrorResponse {
  return {
    statusCode,
    status,
    comingFrom,
    message,
    serializeError(): IError {
      return {
        statusCode,
        status,
        comingFrom,
        message
      };
    }
  };
}

export function createBadRequestError(message: string, comingFrom: string): IError {
  return createCustomError(StatusCodes.BAD_REQUEST, 'Bad Request Error', message, comingFrom);
}

export function createNotFoundError(message: string, comingFrom: string): IError {
  return createCustomError(StatusCodes.NOT_FOUND, 'Not Found Error', message, comingFrom);
}

export function createNotAuthorizedError(message: string, comingFrom: string): IError {
  return createCustomError(StatusCodes.UNAUTHORIZED, 'Unauthorized Error', message, comingFrom);
}

export function createServerError(message: string, comingFrom: string): IError {
  return createCustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Server Error', message, comingFrom);
}

export function createRequestTooLargeError(message: string, comingFrom: string): IError {
  return createCustomError(StatusCodes.REQUEST_TOO_LONG, 'RequestTooLarge Error', message, comingFrom);
}
