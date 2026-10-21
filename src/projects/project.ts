export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: Date;
  /** Internal persistence metadata; never exposed through the response DTO. */
  internalNote?: string;
  deletedAt?: Date;
}

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export type CreateProjectInput = Pick<Project, 'name' | 'status'> &
  Partial<Pick<Project, 'description'>>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
