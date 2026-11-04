import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createOpenApiDocument } from './openapi/openapi-document';

async function generateOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();
  const document = createOpenApiDocument(app);
  writeFileSync(join(process.cwd(), 'openapi.json'), `${JSON.stringify(document, null, 2)}\n`);
  await app.close();
}

void generateOpenApi();
