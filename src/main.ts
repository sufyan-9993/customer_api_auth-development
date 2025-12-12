import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './docs/swagger.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    bufferLogs: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  const environment = configService.get<string>('nodeEnv') || 'development';

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Setup Swagger documentation
  setupSwagger(app);

  // Configure CORS
  app.enableCors({
    origin: configService.get<string>('corsOrigin'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'onboarding_token',
      'role',
    ],
  });

  // Enable cookie parser
  app.use(cookieParser());

  logger.log(`Application starting in ${environment} environment`);

  try {
    await app.listen(port);
    logger.log(`Application is running on port ${port}`);
    logger.log(
      `Swagger documentation available at http://localhost:${port}/api/docs`,
    );
  } catch (error: unknown) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
