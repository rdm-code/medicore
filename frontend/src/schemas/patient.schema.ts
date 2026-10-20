import { z } from "zod";

const INDIAN_PHONE = /^[6-9]\d{9}$/;
const GENDER = /^(MALE|FEMALE|OTHER)$/i;

export const patientResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  fullName: z.string(),
  age: z.number().int().min(0).max(130).nullable(),
  gender: z.string().nullable(),
  phone: z.string().nullable(),
  updatedAt: z.string().nullable(),
});
export type PatientResponse = z.infer<typeof patientResponseSchema>;

export const patientsResponseSchema = z.array(patientResponseSchema);

// Mirrors PatientCreateDTO
export const patientCreateSchema = z.object({
  email: z.email("Email must be valid"),
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
    .regex(GENDER, "Gender must be MALE, FEMALE or OTHER"),
  phone: z
    .string()
    .regex(INDIAN_PHONE, "Phone must be a valid 10-digit Indian mobile number"),
});
export type PatientCreateFormValues = z.infer<typeof patientCreateSchema>;

// Mirrors PatientUpdateDTO
export const patientUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  age: z
    .number()
    .int("Age must be an integer")
    .min(0, "Age cannot be negative")
    .max(130, "Age must be realistic")
    .optional(),
  gender: z
    .string()
    .min(1, "Gender is required")
    .regex(GENDER, "Gender must be MALE, FEMALE or OTHER"),
  phone: z
    .string()
    .regex(INDIAN_PHONE, "Phone must be a valid 10-digit Indian mobile number"),
});
export type PatientUpdateFormValues = z.infer<typeof patientUpdateSchema>;
