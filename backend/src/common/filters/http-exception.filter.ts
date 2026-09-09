import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorResponseBody {
  success: false;
  error: { code: string; message: string };
}

/**
 * Traduz qualquer excecao lancada pelos controllers para o envelope de erro
 * documentado em especificacoes_sistema_credito_rural/04-API-BACKEND.md:
 * `{ success: false, error: { code, message } }`. Nunca expoe stack trace.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body: ErrorResponseBody = {
      success: false,
      error: this.resolveError(exception, status),
    };

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(status).json(body);
  }

  private resolveError(
    exception: unknown,
    status: number,
  ): { code: string; message: string } {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        return { code: this.codeFromStatus(status), message: payload };
      }
      if (typeof payload === 'object' && payload !== null) {
        const { message, error } = payload as {
          message?: string | string[];
          error?: string;
        };
        const resolvedMessage = Array.isArray(message)
          ? message.join('; ')
          : (message ?? exception.message);
        return {
          code: error ? this.toCode(error) : this.codeFromStatus(status),
          message: resolvedMessage,
        };
      }
    }
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno inesperado.',
    };
  }

  private codeFromStatus(status: number): string {
    return (
      (HttpStatus as unknown as Record<number, string>)[status] ??
      `HTTP_${status}`
    );
  }

  private toCode(value: string): string {
    return value
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase()
      .replace(/\s+/g, '_');
  }
}
