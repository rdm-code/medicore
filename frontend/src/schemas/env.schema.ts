import { z } from "zod";

export const envSchema = z.object({
  VITE_API_URL: z.url().default("http://localhost:8080"),
});

export type Env = z.infer<typeof envSchema>;

// Validate once at module load
export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});
