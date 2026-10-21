import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface HttpRequestLike {
  originalUrl?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface HttpResponseLike {
  status(code: number): HttpResponseLike;
  json(body: Record<string, unknown>): void;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<HttpRequestLike>();
    const response = context.getResponse<HttpResponseLike>();
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = {
      statusCode,
      errorCode: this.errorCode(exception, statusCode),
      message: this.message(exception, statusCode),
      path: request.originalUrl ?? request.url ?? '',
      timestamp: new Date().toISOString(),
      traceId: this.traceId(request.headers?.['x-trace-id']),
    };

    response.status(statusCode).json(body);
  }

  private errorCode(exception: unknown, statusCode: number): string {
    if (statusCode === HttpStatus.NOT_FOUND) {
      const message = this.exceptionMessage(exception);
      return message.startsWith('Project with id ')
        ? 'PROJECT_NOT_FOUND'
        : 'ROUTE_NOT_FOUND';
    }
    if (statusCode === HttpStatus.CONFLICT) return 'PROJECT_NAME_CONFLICT';
    if (statusCode === HttpStatus.BAD_REQUEST) return 'VALIDATION_ERROR';
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) return 'INTERNAL_SERVER_ERROR';
    return `HTTP_ERROR_${statusCode}`;
  }

  private message(exception: unknown, statusCode: number): string {
    if (!(exception instanceof HttpException)) return 'Internal server error';
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) return 'Internal server error';

    return this.exceptionMessage(exception);
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

  private traceId(header: string | string[] | undefined): string {
    const value = Array.isArray(header) ? header[0] : header;
    return value && value.length <= 128 ? value : randomUUID();
  }
}
