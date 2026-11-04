import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodType } from 'zod';

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(
    private readonly schema: ZodType<T>,
    private readonly rootField = 'body',
  ) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const issues: ValidationIssue[] = this.formatIssues(result.error);
    throw new BadRequestException({
      message: 'Request validation failed',
      validationErrors: issues,
    });
  }

  private formatIssues(error: ZodError): ValidationIssue[] {
    return error.issues.flatMap((issue) => {
      if (issue.code === 'unrecognized_keys') {
        return issue.keys.map((key) => ({ field: key, message: `Unknown field: ${key}` }));
      }
      return [{ field: issue.path.join('.') || this.rootField, message: issue.message }];
    });
  }
}
