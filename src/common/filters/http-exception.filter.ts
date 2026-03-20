import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const { method, url } = request;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      this.logger.warn(
        `${method} ${url} ${status} - Handled Exception: ${JSON.stringify(responseBody)}`,
      );

      return response.status(status).json(responseBody);
    }

    // Unhandled exception (Internal Server Error)
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    
    // Log the full stack trace for internal monitoring
    this.logger.error(
      `${method} ${url} ${status} - Unhandled Exception`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    return response.status(status).json({
      statusCode: status,
      message: 'Internal server error',
      timestamp,
      path: url,
    });
  }
}
