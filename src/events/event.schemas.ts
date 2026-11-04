import { z } from 'zod';

export const eventIdSchema = z.string().uuid('Event id must be a UUID');

const createEventFields = {
  title: z.string().trim()
    .min(3, 'Title must contain at least 3 characters')
    .max(100, 'Title must contain no more than 100 characters'),
  description: z.string().trim()
    .max(500, 'Description must contain no more than 500 characters')
    .optional(),
  categoryId: z.string().uuid('Category id must be a UUID'),
};

export const createEventSchema = z.object(createEventFields).strict();

export const updateEventSchema = z.object({
  title: createEventFields.title.optional(),
  description: createEventFields.description,
  categoryId: createEventFields.categoryId.optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const createRegistrationSchema = z.object({
  participantId: z.string().uuid('Participant id must be a UUID'),
}).strict();

export type CreateEventPayload = z.infer<typeof createEventSchema>;
export type UpdateEventPayload = z.infer<typeof updateEventSchema>;
export type CreateRegistrationPayload = z.infer<typeof createRegistrationSchema>;
