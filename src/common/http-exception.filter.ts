import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiException } from './api-exception';
import { RequestWithId } from './request-id.middleware';
import { randomUUID } from 'node:crypto';

interface ValidationErrorItem {
  field: string;
  message: string;
}

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  requestId: string;
  errors?: ValidationErrorItem[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const code = this.errorCode(exception, status);
    const errors = this.validationErrors(exception);
    const requestId = request.requestId ?? randomUUID();

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error({
        requestId,
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }

    const problem: ProblemDetails = {
      type: `https://example.com/problems/${code.toLowerCase().replaceAll('_', '-')}`,
      title: this.title(code),
      status,
      detail: this.detail(exception, status, code),
      instance: request.originalUrl,
      code,
      requestId,
      ...(errors && errors.length > 0 ? { errors } : {}),
    };

    response
      .status(status)
      .type('application/problem+json')
      .json(problem);
  }

  private errorCode(exception: unknown, status: number): string {
    if (exception instanceof ApiException) return exception.code;
    if (status === HttpStatus.BAD_REQUEST) return 'VALIDATION_ERROR';
    if (status === HttpStatus.NOT_FOUND) {
      const message = this.exceptionMessage(exception);
      return message.startsWith('Project with id ')
        ? 'PROJECT_NOT_FOUND'
        : 'ROUTE_NOT_FOUND';
    }
    if (status === HttpStatus.CONFLICT) return 'RESOURCE_CONFLICT';
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) return 'INTERNAL_SERVER_ERROR';
    return `HTTP_ERROR_${status}`;
  }

  private title(code: string): string {
    const titles: Record<string, string> = {
      VALIDATION_ERROR: 'Request validation failed',
      PROJECT_NOT_FOUND: 'Project not found',
      ROUTE_NOT_FOUND: 'Route not found',
      PROJECT_ALREADY_EXISTS: 'Project already exists',
      PROJECT_LIMIT_REACHED: 'Project limit reached',
      RESOURCE_CONFLICT: 'Request conflicts with current state',
      INTERNAL_SERVER_ERROR: 'Internal server error',
    };
    return titles[code] ?? 'Request failed';
  }

  private detail(exception: unknown, status: number, code: string): string {
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'An unexpected server error occurred';
    }
    if (code === 'ROUTE_NOT_FOUND') return 'The requested route was not found';
    if (exception instanceof HttpException) return this.exceptionMessage(exception);
    return 'Request failed';
  }

  private exceptionMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) return '';
    const payload = exception.getResponse();
    if (typeof payload === 'string') return payload;
    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = payload.message;
      return Array.isArray(message) ? message.join('; ') : String(message);
    }
    return exception.message;
  }

  private validationErrors(exception: unknown): ValidationErrorItem[] | undefined {
    if (!(exception instanceof HttpException)) return undefined;
    const payload = exception.getResponse();
    if (typeof payload !== 'object' || payload === null || !('validationErrors' in payload)) {
      return undefined;
    }
    const errors = payload.validationErrors;
    return Array.isArray(errors) ? errors as ValidationErrorItem[] : undefined;
  }
}
