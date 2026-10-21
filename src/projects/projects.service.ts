import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectInput, Project, UpdateProjectInput } from './project';
import { PROJECTS_REPOSITORY, ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECTS_REPOSITORY) private readonly repository: ProjectsRepository,
  ) {}

  create(input: CreateProjectInput): Promise<Project> {
    return this.repository.create(input);
  }

  findAll(): Promise<Project[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.repository.findOne(id);
    if (!project) throw new NotFoundException(`Project ${id} was not found`);
    return project;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const project = await this.repository.update(id, input);
    if (!project) throw new NotFoundException(`Project ${id} was not found`);
    return project;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id);
    if (!removed) throw new NotFoundException(`Project ${id} was not found`);
  }
}
