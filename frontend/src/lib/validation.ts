import { ZodError, ZodType } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function zodToFieldErrors<T>(error: ZodError<T>): FieldErrors<T> {
  const result: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const path = issue.path[0] as keyof T | undefined;
    if (path !== undefined && !result[path]) {
      result[path] = issue.message;
    }
  }
  return result;
}

/**
 * Validate an arbitrary input with a Zod schema.
 * Returns either `{ data }` or `{ errors }`.
 */
export function validate<T>(
  schema: ZodType<T>,
  input: unknown,
): { success: true; data: T } | { success: false; errors: FieldErrors<T> } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { success: true, data: parsed.data };
  return { success: false, errors: zodToFieldErrors(parsed.error) };
}
