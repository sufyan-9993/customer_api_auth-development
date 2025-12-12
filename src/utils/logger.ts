import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

const configService = new ConfigService();

const environment = configService.get<string>('environment') ?? 'development';
const isProduction = environment === 'production';

export const logger: winston.Logger = winston.createLogger({
  level: isProduction ? 'warn' : 'info',
  format: winston.format.json(),
  defaultMeta: { environment },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }: Record<string, unknown>) =>
            `${String(timestamp)} [${String(level)}]: ${String(message)} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
            }`,
        ),
      ),
    }),
  ],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});
