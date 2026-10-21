import { CreateProjectInput, Project, UpdateProjectInput } from './project';

/** Persistence boundary consumed by the application service. */
export interface ProjectsRepository {
  create(input: CreateProjectInput): Promise<Project>;
  findAll(): Promise<Project[]>;
  findOne(id: string): Promise<Project | null>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  remove(id: string): Promise<boolean>;
}

export const PROJECTS_REPOSITORY = Symbol('PROJECTS_REPOSITORY');
