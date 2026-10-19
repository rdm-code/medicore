import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "DOCTOR", "PATIENT"]);

// Mirrors UserResponseDTO
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string().nullable(),
  role: roleSchema,
  enabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;

export const usersResponseSchema = z.array(userResponseSchema);

// Mirrors UserCreateDTO
export const userCreateSchema = z.object({
  email: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  displayName: z.string().max(100).optional().or(z.literal("")),
  role: roleSchema,
  enabled: z.boolean().default(true),
});
export type UserCreateFormValues = z.infer<typeof userCreateSchema>;

// Mirrors UserUpdateDTO (all optional)
export const userUpdateSchema = z.object({
  email: z.email("Invalid email format").optional().or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional()
    .or(z.literal("")),
  displayName: z.string().max(100).optional().or(z.literal("")),
  role: roleSchema.optional(),
  enabled: z.boolean().optional(),
});
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
