import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger = new Logger(HttpLoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    const originalEnd = res.end;

    res.end = (...args: any[]) => {
      const responseTime = Date.now() - startTime;

      const getColor = (statusCode: number) => {
        if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // Green
        if (statusCode >= 300 && statusCode < 400) return '\x1b[33m'; // Yellow
        if (statusCode >= 400 && statusCode < 500) return '\x1b[31m'; // Red
        if (statusCode >= 500) return '\x1b[41m\x1b[37m'; // Red background
        return '\x1b[0m'; // Reset
      };

      const methodColor = {
        GET: '\x1b[34m', // Blue
        POST: '\x1b[32m', // Green
        PUT: '\x1b[33m', // Yellow
        DELETE: '\x1b[31m', // Red
        PATCH: '\x1b[35m', // Magenta
      };

      const color = getColor(res.statusCode);
      const methodColorCode = methodColor[req.method] || '\x1b[0m';
      const resetColor = '\x1b[0m';

      this.logger.log(
        `${methodColorCode}${req.method}${resetColor} ${req.url} ${color}${res.statusCode}${resetColor} \x1b[36m${responseTime}ms${resetColor}`,
      );

      return originalEnd.call(res, ...args);
    };
    next();
  }
}
