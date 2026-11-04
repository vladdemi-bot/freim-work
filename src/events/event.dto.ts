import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ minLength: 3, maxLength: 100, example: 'Node.js Workshop' })
  title!: string;

  @ApiPropertyOptional({ maxLength: 500, example: 'Introductory campus workshop.' })
  description?: string;

  @ApiProperty({ format: 'uuid', example: '11111111-1111-4111-8111-111111111111' })
  categoryId!: string;
}

export class UpdateEventDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 100, example: 'Advanced Node.js Workshop' })
  title?: string;

  @ApiPropertyOptional({ maxLength: 500, example: 'Updated workshop details.' })
  description?: string;

  @ApiPropertyOptional({ format: 'uuid', example: '11111111-1111-4111-8111-111111111111' })
  categoryId?: string;
}

export class CreateRegistrationDto {
  @ApiProperty({ format: 'uuid', example: '22222222-2222-4222-8222-222222222222' })
  participantId!: string;
}

export class EventResponseDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Node.js Workshop' })
  title!: string;

  @ApiPropertyOptional({ example: 'Introductory campus workshop.' })
  description?: string;

  @ApiProperty({ format: 'uuid', example: '11111111-1111-4111-8111-111111111111' })
  categoryId!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-07T06:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ format: 'date-time', example: '2026-10-07T06:00:00.000Z' })
  updatedAt!: Date;
}

export class CategoryResponseDto {
  @ApiProperty({ format: 'uuid', example: '11111111-1111-4111-8111-111111111111' })
  id!: string;

  @ApiProperty({ example: 'Academic' })
  name!: string;
}

export class RegistrationResponseDto {
  @ApiProperty({ format: 'uuid', example: '33333333-3333-4333-8333-333333333333' })
  id!: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  eventId!: string;

  @ApiProperty({ format: 'uuid', example: '22222222-2222-4222-8222-222222222222' })
  participantId!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-07T06:05:00.000Z' })
  createdAt!: Date;
}
