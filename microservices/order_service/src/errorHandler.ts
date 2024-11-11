import { StatusCodes } from 'http-status-codes';
import { IError } from './types/errorHandlerTypes';

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;
  comingFrom: string;

  protected constructor(message: string, comingFrom: string) {
    super(message);
    this.comingFrom = comingFrom;
  }

  serializeError(): IError {
    return {
      statusCode: this.statusCode,
      message: this.message,
      status: this.status,
      comingFrom: this.comingFrom
    };
  }
}

export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  status = 'BadRequestError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  status = 'NotFoundError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class UnAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = 'UnAuthorizedError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}
export class ServerError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  status = 'InternalServerError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class RequestTooLargeError extends CustomError {
  statusCode = StatusCodes.REQUEST_TOO_LONG;
  status = 'RequestTooLargeError';
  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}
