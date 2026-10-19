export type Role = "ADMIN" | "DOCTOR" | "PATIENT";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type Gender = "MALE" | "FEMALE" | "OTHER";

// ---------- Response DTOs ----------
export interface UserResponseDTO {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorResponseDTO {
  id: string;
  email: string;
  fullName: string;
  specialization: string;
  phone: string;
  updatedAt: string;
}

export interface PatientResponseDTO {
  id: string;
  email: string;
  fullName: string;
  age: number | null;
  gender: string | null;
  phone: string;
  updatedAt: string;
}

export interface AppointmentResponseDTO {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  patientId: string;
  patientName: string;
  appointmentTime: string; // ISO LocalDateTime
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /api/auth/me */
export interface CurrentUser {
  email: string;
  role: Role;
  profile?: DoctorResponseDTO | PatientResponseDTO | null;
}

// ---------- Request DTOs ----------
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface DoctorCreateDTO {
  email: string;
  password: string; // 6–20 chars
  fullName: string; // ≤100
  specialization: string; // ≤100
  phone: string; // Indian mobile: ^[6-9]\d{9}$
}

export interface DoctorUpdateDTO {
  fullName: string;
  specialization: string;
  phone: string;
}

export interface PatientCreateDTO {
  email: string;
  password: string; // 6–20
  fullName: string; // ≤100
  age: number; // 0–130
  gender: Gender;
  phone: string; // Indian mobile
}

export interface PatientUpdateDTO {
  fullName: string;
  age?: number; // 0–130
  gender: Gender;
  phone: string;
}

export interface UserCreateDTO {
  email: string;
  password: string; // ≥6
  displayName?: string;
  role: Role;
}

export interface UserUpdateDTO {
  email?: string;
  password?: string; // ≥6
  displayName?: string;
  role?: Role;
  enabled?: boolean;
}

export interface AppointmentCreateDTO {
  doctorId: string;
  appointmentTime: string; // ISO LocalDateTime
  reason?: string; // ≤500
}

export interface AppointmentNotesDTO {
  notes: string; // 1–1000
}

// ---------- Misc ----------
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  doctorId?: string;
  date?: string;
}

export interface DoctorFilters {
  specialization?: string;
}

export interface UserFilters {
  role?: Role;
}
