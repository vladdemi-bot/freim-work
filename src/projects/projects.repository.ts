import { CreateProjectInput, Project, UpdateProjectInput } from './project';

/** Persistence boundary consumed by the application service. */
export interface ProjectsRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findAll(): Promise<Project[]>;
  findOne(id: number): Promise<Project | null>;
  findByName(name: string): Promise<Project | null>;
  update(id: number, input: UpdateProjectInput): Promise<Project | null>;
  remove(id: number): Promise<Project | null>;
}

export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');
