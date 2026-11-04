import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectInput, Project, UpdateProjectInput } from './project';
import { PROJECTS_REPOSITORY, ProjectsRepository } from './projects.repository';
import { ProjectResponseDto } from './dto/project-response.dto';
import { env } from '../config/env';
import { ApiException } from '../common/api-exception';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY) private readonly repository: ProjectsRepository,
  ) {}

  async create(input: CreateProjectInput): Promise<ProjectResponseDto> {
    const existing = await this.repository.findByName(input.name);
    if (existing) {
      throw new ApiException(
        'PROJECT_ALREADY_EXISTS',
        `Project with name "${input.name}" already exists`,
        409,
      );
    }
    if ((await this.repository.findAll()).length >= env.MAX_PROJECTS) {
      throw new ApiException(
        'PROJECT_LIMIT_REACHED',
        'Maximum number of projects has been reached',
        409,
      );
    }
    const project = await this.repository.create(input);
    return this.toResponse(project);
  }

  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.repository.findAll();
    return projects.map((project) => this.toResponse(project));
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    const project = await this.repository.findOne(id);
    if (!project) throw this.notFound(id);
    return this.toResponse(project);
  }

  async update(id: number, input: UpdateProjectInput): Promise<ProjectResponseDto> {
    const current = await this.repository.findOne(id);
    if (!current) throw this.notFound(id);

    if (input.name && input.name !== current.name) {
      const existing = await this.repository.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new ApiException(
          'PROJECT_ALREADY_EXISTS',
          `Project with name "${input.name}" already exists`,
          409,
        );
      }
    }

    const project = await this.repository.update(id, input);
    if (!project) throw this.notFound(id);
    return this.toResponse(project);
  }

  async remove(id: number): Promise<ProjectResponseDto> {
    const project = await this.repository.remove(id);
    if (!project) throw this.notFound(id);
    return this.toResponse(project);
  }

  private notFound(id: number): NotFoundException {
    return new NotFoundException(`Project with id ${id} was not found`);
  }

  private toResponse(project: Project): ProjectResponseDto {
    return ProjectResponseDto.fromProject(project);
  }
}
