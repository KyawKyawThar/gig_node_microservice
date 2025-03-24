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

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  status = 'NotAuthorizedError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class ConflictError extends CustomError {
  statusCode = StatusCodes.CONFLICT;
  status = 'ConflictError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}

export class ForbiddenError extends CustomError {
  statusCode = StatusCodes.FORBIDDEN;
  status = 'NotAuthorizedError';

  constructor(message: string, comingFrom: string) {
    super(message, comingFrom);
  }
}
export class ServerError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  status = 'ServerError';

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
