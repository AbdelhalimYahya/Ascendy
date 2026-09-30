import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as { message?: unknown } | string)
        : 'Internal server error';

    const payload =
      typeof message === 'string'
        ? { message }
        : (message as Record<string, unknown>);

    res.status(status).json({
      statusCode: status,
      path: req.url,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}
