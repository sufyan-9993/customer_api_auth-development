import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ERROR_CODES, ErrorCode } from './error-codes';

export interface CustomErrorResponse {
  statusCode: number;
  message: string;
  errorCode: ErrorCode;
  timestamp: string;
  path?: string;
  details?: unknown;
}

export class CustomException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode: ErrorCode,
    details?: unknown,
  ) {
    const response: CustomErrorResponse = {
      statusCode,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      details,
    };
    super(response, statusCode);
  }
}

// Authentication Exceptions
export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message = 'Invalid credentials') {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      errorCode: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      timestamp: new Date().toISOString(),
    });
  }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor(message = 'Token has expired') {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      errorCode: ERROR_CODES.AUTH_TOKEN_EXPIRED,
      timestamp: new Date().toISOString(),
    });
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor(message = 'Invalid token') {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      errorCode: ERROR_CODES.AUTH_TOKEN_INVALID,
      timestamp: new Date().toISOString(),
    });
  }
}

export class TokenMissingException extends UnauthorizedException {
  constructor(message = 'Token is missing') {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      errorCode: ERROR_CODES.AUTH_TOKEN_MISSING,
      timestamp: new Date().toISOString(),
    });
  }
}

// User Exceptions
export class UserNotFoundException extends NotFoundException {
  constructor(message = 'User not found') {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message,
      errorCode: ERROR_CODES.USER_NOT_FOUND,
      timestamp: new Date().toISOString(),
    });
  }
}

export class UserAlreadyExistsException extends ConflictException {
  constructor(message = 'User already exists') {
    super({
      statusCode: HttpStatus.CONFLICT,
      message,
      errorCode: ERROR_CODES.USER_ALREADY_EXISTS,
      timestamp: new Date().toISOString(),
    });
  }
}

export class UserInactiveException extends ForbiddenException {
  constructor(message = 'User account is inactive') {
    super({
      statusCode: HttpStatus.FORBIDDEN,
      message,
      errorCode: ERROR_CODES.USER_INACTIVE,
      timestamp: new Date().toISOString(),
    });
  }
}

// Database Exceptions
export class DatabaseConnectionException extends InternalServerErrorException {
  constructor(message = 'Database connection error', details?: unknown) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorCode: ERROR_CODES.DB_CONNECTION_ERROR,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}

export class DatabaseQueryException extends InternalServerErrorException {
  constructor(message = 'Database query error', details?: unknown) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorCode: ERROR_CODES.DB_QUERY_ERROR,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}

// Business Logic Exceptions
export class BusinessLogicException extends BadRequestException {
  constructor(message = 'Business logic error', details?: unknown) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      errorCode: ERROR_CODES.BUSINESS_LOGIC_ERROR,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}

export class InvalidOperationException extends BadRequestException {
  constructor(message = 'Invalid operation', details?: unknown) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      errorCode: ERROR_CODES.INVALID_OPERATION,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}

export class ResourceLockedException extends ConflictException {
  constructor(message = 'Resource is locked', details?: unknown) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message,
      errorCode: ERROR_CODES.RESOURCE_LOCKED,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}

// External Service Exceptions
export class ExternalServiceException extends InternalServerErrorException {
  constructor(message = 'External service error', details?: unknown) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorCode: ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}

export class ExternalServiceTimeoutException extends InternalServerErrorException {
  constructor(message = 'External service timeout', details?: unknown) {
    super({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
      errorCode: ERROR_CODES.EXTERNAL_SERVICE_TIMEOUT,
      timestamp: new Date().toISOString(),
      details,
    });
  }
}
