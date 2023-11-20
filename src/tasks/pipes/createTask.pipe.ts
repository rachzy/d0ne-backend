import { z } from 'zod';

export const createTaskSchema = z
  .object({
    title: z.string().min(2),
    description: z.string().min(2),
    completed: z.boolean().default(false),
  })
  .required()
  .strict();
