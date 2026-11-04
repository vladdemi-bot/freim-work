import 'reflect-metadata';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { SwaggerModule } from '@nestjs/swagger';
import { createOpenApiDocument } from './openapi/openapi-document';
import { env } from './config/env';
import { requestIdMiddleware } from './common/request-id.middleware';

async function bootstrap(): Promise<void> {
  const logLevels = env.LOG_LEVEL === 'debug'
    ? ['log', 'error', 'warn', 'debug', 'verbose'] as const
    : env.LOG_LEVEL === 'info'
      ? ['log', 'error', 'warn'] as const
      : env.LOG_LEVEL === 'warn'
        ? ['error', 'warn'] as const
        : ['error'] as const;
  const app = await NestFactory.create(AppModule, { logger: [...logLevels] });
  app.use(requestIdMiddleware);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());
  SwaggerModule.setup('docs', app, createOpenApiDocument(app), {
    jsonDocumentUrl: 'openapi.json',
    customSiteTitle: 'Projects API documentation',
  });
  await app.listen(env.PORT);
  console.log(`Server started on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
}

void bootstrap();
