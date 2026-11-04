import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project, ProjectStatus } from '../project';

@Exclude()
export class ProjectResponseDto {
  @ApiProperty({ type: Number, example: 10, description: 'Unique project identifier.' })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'StudyFlow', description: 'Project name.' })
  @Expose()
  name!: string;

  @ApiPropertyOptional({ example: 'A system for managing learning projects.', description: 'Project description.' })
  @Expose()
  description?: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.ACTIVE })
  @Expose()
  status!: ProjectStatus;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-09-23T10:00:00.000Z' })
  @Expose()
  createdAt!: string;

  static fromProject(project: Project): ProjectResponseDto {
    return Object.assign(new ProjectResponseDto(), {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt.toISOString(),
    });
  }
}
