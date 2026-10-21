import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 404, description: 'HTTP status code.' })
  statusCode!: number;

  @ApiProperty({
    example: 'PROJECT_NOT_FOUND',
    description: 'Stable machine-readable error code.',
  })
  errorCode!: string;

  @ApiProperty({ example: 'Project with id 10 was not found' })
  message!: string;

  @ApiProperty({ example: '/projects/10' })
  path!: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-09-23T10:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ type: String, format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  traceId!: string;
}
