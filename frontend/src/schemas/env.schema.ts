// src/schemas/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  // Empty string = use relative URLs (same-origin, Nginx proxies /api/*)
  // Non-empty    = must be a valid URL (used in dev to hit :8080 directly)
  VITE_API_URL: z
    .string()
    .refine(
      (v) => v === '' || /^https?:\/\/.+/.test(v),
      'VITE_API_URL must be a valid URL or empty',
    ),
});

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL ?? '',
});