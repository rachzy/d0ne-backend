import { z } from 'zod';

export const createUserSchema = z
  .object({
    nickname: z.string().min(4).max(16),
    email: z.string().min(8).max(128),
    password: z.string().min(4).max(64),
  })
  .required()
  .strict();
