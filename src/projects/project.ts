export interface Project {
  id: string;
  name: string;
  description?: string;
}

export type CreateProjectInput = Omit<Project, 'id'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;
