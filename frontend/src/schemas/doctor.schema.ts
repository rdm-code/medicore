import { z } from "zod";

/** Indian mobile number: exactly 10 digits starting with 6–9 */
const INDIAN_PHONE = /^[6-9]\d{9}$/;

export const doctorResponseSchema = z.object({
  id: z.string(),
  email: z.email(),
  fullName: z.string(),
  specialization: z.string(),
  phone: z.string(),
  updatedAt: z.string().nullable(),
});
export type DoctorResponse = z.infer<typeof doctorResponseSchema>;

export const doctorsResponseSchema = z.array(doctorResponseSchema);

// Mirrors DoctorCreateDTO
export const doctorCreateSchema = z.object({
  email: z.email("Email must be valid"),
  password: z
    .string()
    .min(6, "Password must be 6 to 20 characters")
    .max(20, "Password must be 6 to 20 characters"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  specialization: z
    .string()
    .min(1, "Specialization is required")
    .max(100, "Specialization must be at most 100 characters"),
  phone: z
    .string()
    .regex(INDIAN_PHONE, "Phone must be a valid 10-digit Indian mobile number"),
});
export type DoctorCreateFormValues = z.infer<typeof doctorCreateSchema>;

// Mirrors DoctorUpdateDTO
export const doctorUpdateSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  specialization: z
    .string()
    .min(1, "Specialization is required")
    .max(100, "Specialization must be at most 100 characters"),
  phone: z
    .string()
    .regex(INDIAN_PHONE, "Phone must be a valid 10-digit Indian mobile number"),
});
export type DoctorUpdateFormValues = z.infer<typeof doctorUpdateSchema>;

// Doctor's own profile (same as DoctorUpdateDTO)
export const doctorUpdateMeSchema = doctorUpdateSchema;
export type DoctorUpdateMeFormValues = z.infer<typeof doctorUpdateMeSchema>;
