import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 'https://example.com/problems/project-not-found' })
  type!: string;

  @ApiProperty({ example: 'Project not found' })
  title!: string;

  @ApiProperty({ example: 404, description: 'HTTP status code.' })
  status!: number;

  @ApiProperty({ example: 'Project with id 10 was not found' })
  detail!: string;

  @ApiProperty({ example: '/projects/10' })
  instance!: string;

  @ApiProperty({ example: 'PROJECT_NOT_FOUND' })
  code!: string;

  @ApiProperty({ type: String, format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  requestId!: string;

  @ApiProperty({
    type: 'array',
    required: false,
    items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } },
    example: [{ field: 'name', message: 'Name must contain at least 3 characters' }],
  })
  errors?: Array<{ field: string; message: string }>;
}
