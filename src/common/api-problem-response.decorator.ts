import { ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiErrorDto } from './api-error.dto';

export function ApiProblemResponse(
  status: number,
  description: string,
  example?: Record<string, unknown>,
): MethodDecorator {
  return ApiResponse({
    status,
    description,
    content: {
      'application/problem+json': {
        schema: { $ref: getSchemaPath(ApiErrorDto) },
        ...(example ? { examples: { problem: { summary: description, value: example } } } : {}),
      },
    },
  });
}
