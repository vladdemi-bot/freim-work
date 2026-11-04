import { Injectable } from '@nestjs/common';
import { CreateProjectInput, Project, UpdateProjectInput } from './project';
import { ProjectsRepository } from './projects.repository';

/** Replaceable adapter; keeps this vertical slice runnable without a database. */
@Injectable()
export class InMemoryProjectsRepository implements ProjectsRepository {
  private readonly projects = new Map<number, Project>();
  private nextId = 1;

  async create(input: CreateProjectInput): Promise<Project> {
    const project: Project = { ...input, id: this.nextId++, createdAt: new Date() };
    this.projects.set(project.id, project);
    return { ...project };
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects.values()].map((project) => ({ ...project }));
  }

  async findOne(id: number): Promise<Project | null> {
    const project = this.projects.get(id);
    return project ? { ...project } : null;
  }

  async findByName(name: string): Promise<Project | null> {
    const normalizedName = name.toLocaleLowerCase();
    const project = [...this.projects.values()].find(
      (item) => item.name.toLocaleLowerCase() === normalizedName,
    );
    return project ? { ...project } : null;
  }

  async update(id: number, input: UpdateProjectInput): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) return null;
    const updated = { ...project, ...input, id };
    this.projects.set(id, updated);
    return { ...updated };
  }

  async remove(id: number): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) return null;
    this.projects.delete(id);
    return { ...project };
  }
}
