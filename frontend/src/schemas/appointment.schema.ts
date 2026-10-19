import { z } from "zod";

export const appointmentStatusSchema = z.enum([
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
]);

// Mirrors AppointmentResponseDTO
export const appointmentResponseSchema = z.object({
  id: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  specialization: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  appointmentTime: z.string(),
  status: appointmentStatusSchema,
  reason: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});
export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;

export const appointmentsResponseSchema = z.array(appointmentResponseSchema);

// Mirrors AppointmentCreateDTO — UI keeps date + time separately, we combine on submit
export const appointmentCreateSchema = z.object({
  doctorId: z.string().min(1, "Doctor id is required"),
  date: z.string().min(1, "Appointment time is required"),
  time: z.string().min(1, "Appointment time is required"),
  reason: z
    .string()
    .max(500, "Reason must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});
export type AppointmentCreateFormValues = z.infer<
  typeof appointmentCreateSchema
>;

// Mirrors AppointmentNotesDTO
export const appointmentNotesSchema = z.object({
  notes: z
    .string()
    .min(1, "Notes cannot be blank")
    .max(1000, "Notes must be at most 1000 characters"),
});
export type AppointmentNotesFormValues = z.infer<typeof appointmentNotesSchema>;

export const availableSlotsResponseSchema = z.array(z.string());
