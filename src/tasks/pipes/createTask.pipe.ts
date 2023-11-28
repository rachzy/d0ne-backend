import { z } from 'zod';

export const createTaskSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().default('No description provided.'),
    completed: z.boolean().default(false),
  })
  .required()
  .strict();
