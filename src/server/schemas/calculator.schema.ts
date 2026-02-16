import { z } from 'zod';
import { CalcMode } from '@prisma/client';

export const evaluateSchema = z.object({
  expression: z.string().min(1, 'Expression is required'),
  mode: z.nativeEnum(CalcMode).optional().default(CalcMode.DEG),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
