import { z } from "zod";
import { roleSchema } from "./user.schema";

// Mirrors LoginRequestDTO
export const loginSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/** POST /api/auth/register uses PatientCreateDTO (patient self-registration) */
export const registerSchema = z.object({
  email: z.string().email("Email must be valid"),
  password: z
    .string()
    .min(6, "Password must be 6 to 20 characters")
    .max(20, "Password must be 6 to 20 characters"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  age: z
    .number({ error: "Age is required" })
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(130, "Age must be realistic"),
  gender: z
    .string()
    .min(1, "Gender is required")
    .regex(/^(MALE|FEMALE|OTHER)$/i, "Gender must be MALE, FEMALE or OTHER"),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Phone must be a valid 10-digit Indian mobile number",
    ),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

/** GET /api/auth/me */
export const currentUserSchema = z.object({
  email: z.string().email(),
  role: roleSchema,
  profile: z.unknown().nullable().optional(),
});
export type CurrentUserResponse = z.infer<typeof currentUserSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password must be at most 20 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
