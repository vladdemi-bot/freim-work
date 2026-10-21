import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateProjectInput, Project, UpdateProjectInput } from './project';
import { ProjectsRepository } from './projects.repository';

/** Replaceable adapter; keeps this vertical slice runnable without a database. */
@Injectable()
export class InMemoryProjectsRepository implements ProjectsRepository {
  private readonly projects = new Map<string, Project>();

  async create(input: CreateProjectInput): Promise<Project> {
    const project: Project = { ...input, id: randomUUID() };
    this.projects.set(project.id, project);
    return { ...project };
  }

  async findAll(): Promise<Project[]> {
    return [...this.projects.values()].map((project) => ({ ...project }));
  }

  async findOne(id: string): Promise<Project | null> {
    const project = this.projects.get(id);
    return project ? { ...project } : null;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) return null;
    const updated = { ...project, ...input, id };
    this.projects.set(id, updated);
    return { ...updated };
  }

  async remove(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}
