import { IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../project';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name (3–100 characters).',
    minLength: 3,
    maxLength: 100,
    example: 'StudyFlow',
  })
  @IsString()
  @Length(3, 100)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional project description, up to 500 characters.',
    maxLength: 500,
    example: 'A system for managing learning projects.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Current project status.',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
