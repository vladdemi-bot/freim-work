import { Exclude, Expose } from 'class-transformer';
import { Project, ProjectStatus } from '../project';

@Exclude()
export class ProjectResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  status!: ProjectStatus;

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
