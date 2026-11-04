import { z } from 'zod';
import { ProjectStatus } from './project';

const projectFields = {
  name: z.string().trim()
    .min(3, 'Name must contain at least 3 characters')
    .max(100, 'Name must contain no more than 100 characters'),
  description: z.string().trim().max(500, 'Description must contain no more than 500 characters').optional(),
  status: z.nativeEnum(ProjectStatus),
};

export const createProjectSchema = z.object(projectFields).strict();

export const updateProjectSchema = z.object({
  name: projectFields.name.optional(),
  description: projectFields.description,
  status: projectFields.status.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const projectIdSchema = z.coerce.number()
  .int('Project id must be an integer')
  .positive('Project id must be positive');

export type CreateProjectPayload = z.infer<typeof createProjectSchema>;
export type UpdateProjectPayload = z.infer<typeof updateProjectSchema>;
