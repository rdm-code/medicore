import axios, { AxiosError, type AxiosInstance } from "axios";
import { z } from "zod";
import { env } from "../schemas/env.schema";
import {
  userResponseSchema,
  usersResponseSchema,
  doctorResponseSchema,
  doctorsResponseSchema,
  patientResponseSchema,
  patientsResponseSchema,
  appointmentResponseSchema,
  appointmentsResponseSchema,
  availableSlotsResponseSchema,
  currentUserSchema,
} from "../schemas";
import type {
  CurrentUser,
  LoginRequestDTO,
  PatientCreateDTO,
  DoctorCreateDTO,
  DoctorUpdateDTO,
  PatientUpdateDTO,
  UserCreateDTO,
  UserUpdateDTO,
  AppointmentCreateDTO,
  AppointmentNotesDTO,
  ChangePasswordPayload,
  AppointmentFilters,
  DoctorFilters,
  UserFilters,
} from "../types";

const BASE_URL = env.VITE_API_URL;

// ---------- Basic credentials (session storage) ----------
const CRED_KEY = "medicore_basic";

export function setBasicCredentials(email: string, password: string) {
  sessionStorage.setItem(CRED_KEY, btoa(`${email}:${password}`));
}

export function clearBasicCredentials() {
  sessionStorage.removeItem(CRED_KEY);
}

function getBasicHeader(): string | null {
  const raw = sessionStorage.getItem(CRED_KEY);
  return raw ? `Basic ${raw}` : null;
}

// ---------- Errors ----------
export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class ResponseValidationError extends Error {
  zodError: z.ZodError;
  raw: unknown;
  constructor(zodError: z.ZodError, raw: unknown) {
    super("Server returned an unexpected response shape");
    this.zodError = zodError;
    this.raw = raw;
  }
}

// ---------- Axios instance ----------
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  if (config.headers && config.headers.Authorization === "") {
    delete config.headers.Authorization;
  } else {
    const basic = getBasicHeader();
    if (basic) config.headers.Authorization = basic;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as
        | { message?: string; error?: string }
        | undefined;
      const message = data?.message ?? data?.error ?? error.response.statusText;
      throw new HttpError(error.response.status, message, data);
    }
    throw new HttpError(0, error.message);
  },
);

// ---------- /api/auth/me schema (with profile union) ----------
const authCurrentUserSchema = currentUserSchema.extend({
  profile: z
    .union([doctorResponseSchema, patientResponseSchema])
    .nullable()
    .optional(),
});

// ============================================================
// AUTH
// ============================================================
export const authApi = {
  /** POST /api/auth/login */
  async login(payload: LoginRequestDTO): Promise<CurrentUser> {
    setBasicCredentials(payload.email, payload.password);
    try {
      const res = await http.post("/api/auth/login", payload);
      const parsed = authCurrentUserSchema.safeParse(res.data);
      if (!parsed.success) {
        console.error(
          "login: response validation failed",
          parsed.error,
          res.data,
        );
        throw new ResponseValidationError(parsed.error, res.data);
      }
      return parsed.data as CurrentUser;
    } catch (e) {
      clearBasicCredentials();
      throw e;
    }
  },

  /** POST /api/auth/register */
  async register(payload: PatientCreateDTO): Promise<void> {
    await http.post("/api/auth/register", payload, {
      headers: { Authorization: "" },
    });
  },

  /** GET /api/auth/me */
  async me(): Promise<CurrentUser> {
    const res = await http.get("/api/auth/me");
    const parsed = authCurrentUserSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error("me: response validation failed", parsed.error, res.data);
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data as CurrentUser;
  },

  /** PUT /api/auth/change-password */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await http.put("/api/auth/change-password", payload);
  },

  /** POST /logout */
  async logout(): Promise<void> {
    clearBasicCredentials();
    try {
      await http.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
  },
};

// ============================================================
// USERS (ADMIN)
// ============================================================
export const usersApi = {
  /** GET /api/admin/users?role= */
  async list(
    filters: UserFilters = {},
  ): Promise<z.infer<typeof usersResponseSchema>> {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", filters.role);
    const url = `/api/admin/users${params.toString() ? `?${params}` : ""}`;

    const res = await http.get(url);
    // const data = res.data;
    // console.log("listUsers: response data", data);
    const parsed = usersResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "listUsers: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/admin/users/{id} */
  async get(id: string): Promise<z.infer<typeof userResponseSchema>> {
    const res = await http.get(`/api/admin/users/${id}`);
    const parsed = userResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getUser: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** POST /api/admin/users */
  async create(
    payload: UserCreateDTO,
  ): Promise<z.infer<typeof userResponseSchema>> {
    const res = await http.post("/api/admin/users", payload);
    const parsed = userResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "createUser: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PUT /api/admin/users/{id} */
  async update(
    id: string,
    payload: UserUpdateDTO,
  ): Promise<z.infer<typeof userResponseSchema>> {
    const res = await http.put(`/api/admin/users/${id}`, payload);
    const parsed = userResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "updateUser: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PATCH /api/admin/users/{id}/enabled?enabled= */
  async setEnabled(
    id: string,
    enabled: boolean,
  ): Promise<z.infer<typeof userResponseSchema>> {
    const params = new URLSearchParams();
    params.append("enabled", String(enabled));
    const res = await http.patch(
      `/api/admin/users/${id}/enabled?${params.toString()}`,
    );
    const parsed = userResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "setUserEnabled: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** DELETE /api/admin/users/{id} */
  async remove(id: string): Promise<void> {
    await http.delete(`/api/admin/users/${id}`);
  },
};

// ============================================================
// DOCTORS
// ============================================================
export const doctorsApi = {
  /** GET /api/doctors?specialization= */
  async list(
    filters: DoctorFilters = {},
  ): Promise<z.infer<typeof doctorsResponseSchema>> {
    const params = new URLSearchParams();
    if (filters.specialization) {
      params.append("specialization", filters.specialization);
    }
    const url = `/api/doctors${params.toString() ? `?${params}` : ""}`;

    const res = await http.get(url);
    const parsed = doctorsResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "listDoctors: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/doctors/{id} */
  async get(id: string): Promise<z.infer<typeof doctorResponseSchema>> {
    const res = await http.get(`/api/doctors/${id}`);
    const parsed = doctorResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getDoctor: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/doctors/me */
  async me(): Promise<z.infer<typeof doctorResponseSchema>> {
    const res = await http.get("/api/doctors/me");
    const parsed = doctorResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getMyDoctor: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** POST /api/admin/doctors */
  async create(
    payload: DoctorCreateDTO,
  ): Promise<z.infer<typeof doctorResponseSchema>> {
    const res = await http.post("/api/admin/doctors", payload);
    const parsed = doctorResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "createDoctor: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PUT /api/admin/doctors/{id} */
  async update(
    id: string,
    payload: DoctorUpdateDTO,
  ): Promise<z.infer<typeof doctorResponseSchema>> {
    const res = await http.put(`/api/admin/doctors/${id}`, payload);
    const parsed = doctorResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "updateDoctor: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PUT /api/doctors/me */
  async updateMe(
    payload: DoctorUpdateDTO,
  ): Promise<z.infer<typeof doctorResponseSchema>> {
    const res = await http.put("/api/doctors/me", payload);
    const parsed = doctorResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "updateMyDoctor: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** DELETE /api/admin/doctors/{id} */
  async remove(id: string): Promise<void> {
    await http.delete(`/api/admin/doctors/${id}`);
  },
};

// ============================================================
// PATIENTS
// ============================================================
export const patientsApi = {
  /** GET /api/patients */
  async list(): Promise<z.infer<typeof patientsResponseSchema>> {
    const res = await http.get("/api/patients");
    const parsed = patientsResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "listPatients: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/patients/{id} */
  async get(id: string): Promise<z.infer<typeof patientResponseSchema>> {
    const res = await http.get(`/api/patients/${id}`);
    const parsed = patientResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getPatient: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/patients/me */
  async me(): Promise<z.infer<typeof patientResponseSchema>> {
    const res = await http.get("/api/patients/me");
    const parsed = patientResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getMyPatient: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PUT /api/patients/me */
  async updateMe(
    payload: PatientUpdateDTO,
  ): Promise<z.infer<typeof patientResponseSchema>> {
    const res = await http.put("/api/patients/me", payload);
    const parsed = patientResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "updateMyPatient: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PUT /api/patients/{id} */
  async update(
    id: string,
    payload: PatientUpdateDTO,
  ): Promise<z.infer<typeof patientResponseSchema>> {
    const res = await http.put(`/api/patients/${id}`, payload);
    const parsed = patientResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "updatePatient: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** DELETE /api/patients/{id} */
  async remove(id: string): Promise<void> {
    await http.delete(`/api/patients/${id}`);
  },
};

// ============================================================
// APPOINTMENTS
// ============================================================
export const appointmentsApi = {
  /** GET /api/appointments?status=&doctorId=&date= */
  async list(
    filters: AppointmentFilters = {},
  ): Promise<z.infer<typeof appointmentsResponseSchema>> {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.doctorId) params.append("doctorId", filters.doctorId);
    if (filters.date) params.append("date", filters.date);
    const url = `/api/appointments${params.toString() ? `?${params}` : ""}`;

    const res = await http.get(url);
    const parsed = appointmentsResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "listAppointments: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/appointments/me */
  async mine(): Promise<z.infer<typeof appointmentsResponseSchema>> {
    const res = await http.get("/api/appointments/me");
    const parsed = appointmentsResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "listMyAppointments: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** GET /api/appointments/{id} */
  async get(id: string): Promise<z.infer<typeof appointmentResponseSchema>> {
    const res = await http.get(`/api/appointments/${id}`);
    const parsed = appointmentResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getAppointment: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** POST /api/appointments */
  async create(
    payload: AppointmentCreateDTO,
  ): Promise<z.infer<typeof appointmentResponseSchema>> {
    const res = await http.post("/api/appointments", payload);
    const parsed = appointmentResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "createAppointment: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PATCH /api/appointments/{id}/cancel */
  async cancel(id: string): Promise<z.infer<typeof appointmentResponseSchema>> {
    const res = await http.patch(`/api/appointments/${id}/cancel`);
    const parsed = appointmentResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "cancelAppointment: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PATCH /api/appointments/{id}/complete */
  async complete(
    id: string,
  ): Promise<z.infer<typeof appointmentResponseSchema>> {
    const res = await http.patch(`/api/appointments/${id}/complete`);
    const parsed = appointmentResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "completeAppointment: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** PATCH /api/appointments/{id}/notes */
  async addNotes(
    id: string,
    payload: AppointmentNotesDTO,
  ): Promise<z.infer<typeof appointmentResponseSchema>> {
    const res = await http.patch(`/api/appointments/${id}/notes`, payload);
    const parsed = appointmentResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "addAppointmentNotes: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },

  /** DELETE /api/appointments/{id} */
  async remove(id: string): Promise<void> {
    await http.delete(`/api/appointments/${id}`);
  },
};

// ============================================================
// SLOTS
// ============================================================
export const slotsApi = {
  /** GET /api/doctors/{id}/available-slots?date= */
  async available(
    doctorId: string,
    date: string,
  ): Promise<z.infer<typeof availableSlotsResponseSchema>> {
    const params = new URLSearchParams();
    params.append("date", date);

    const res = await http.get(
      `/api/doctors/${doctorId}/available-slots?${params.toString()}`,
    );
    const parsed = availableSlotsResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "getAvailableSlots: response validation failed",
        parsed.error,
        res.data,
      );
      throw new ResponseValidationError(parsed.error, res.data);
    }
    return parsed.data;
  },
};

// ---------- SWR fetcher ----------
export const fetcher = <T>(fn: () => Promise<T>) => fn();
