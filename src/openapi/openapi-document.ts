import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorDto } from '../common/api-error.dto';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('CampusHub API')
    .setDescription('CampusHub university events and registrations API, plus the Projects teaching resource. Bearer authentication is documented as a scheme but is not enforced by this application.')
    .setVersion('1.0.0')
    .addServer('http://127.0.0.1:3000', 'Local development')
    .addTag('Projects', 'Create, inspect, update, and remove projects.')
    .addTag('CampusHub Events', 'Manage university events, browse categories, and register participants.')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearerAuth',
    )
    .addSecurityRequirements({})
    .addSecurityRequirements('bearerAuth')
    .setExternalDoc('Source repository for this practical work.', 'https://github.com/vladdemi-bot/freim-work')
    .build();

  return SwaggerModule.createDocument(app, config, {
    extraModels: [ApiErrorDto],
  });
}
