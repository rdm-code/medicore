// import type { User, Doctor, Patient, Appointment } from "../types";

// export const users: User[] = [
//   {
//     id: 1,
//     email: "admin@medicore.com",
//     role: "ADMIN",
//     name: "Sarah Admin",
//     enabled: true,
//   },
//   {
//     id: 2,
//     email: "dr.smith@medicore.com",
//     role: "DOCTOR",
//     name: "Dr. John Smith",
//     specialization: "Cardiology",
//     enabled: true,
//   },
//   {
//     id: 3,
//     email: "dr.jones@medicore.com",
//     role: "DOCTOR",
//     name: "Dr. Emily Jones",
//     specialization: "Neurology",
//     enabled: true,
//   },
//   {
//     id: 4,
//     email: "patient@example.com",
//     role: "PATIENT",
//     name: "Alice Johnson",
//     enabled: true,
//   },
//   {
//     id: 5,
//     email: "bob@example.com",
//     role: "PATIENT",
//     name: "Bob Williams",
//     enabled: true,
//   },
// ];

// export const doctors: Doctor[] = [
//   {
//     id: 1,
//     userId: 2,
//     name: "Dr. John Smith",
//     email: "dr.smith@medicore.com",
//     specialization: "Cardiology",
//     phone: "555-0101",
//     room: "A-201",
//   },
//   {
//     id: 2,
//     userId: 3,
//     name: "Dr. Emily Jones",
//     email: "dr.jones@medicore.com",
//     specialization: "Neurology",
//     phone: "555-0102",
//     room: "B-105",
//   },
// ];

// export const patients: Patient[] = [
//   {
//     id: 1,
//     userId: 4,
//     name: "Alice Johnson",
//     email: "patient@example.com",
//     phone: "555-0201",
//     dob: "1990-05-15",
//     address: "123 Main St",
//   },
//   {
//     id: 2,
//     userId: 5,
//     name: "Bob Williams",
//     email: "bob@example.com",
//     phone: "555-0202",
//     dob: "1985-08-22",
//     address: "456 Oak Ave",
//   },
// ];

// export const appointments: Appointment[] = [
//   {
//     id: 1,
//     patientId: 1,
//     doctorId: 1,
//     date: "2026-11-02",
//     time: "09:00",
//     status: "SCHEDULED",
//     notes: "",
//   },
//   {
//     id: 2,
//     patientId: 2,
//     doctorId: 2,
//     date: "2026-11-02",
//     time: "10:00",
//     status: "SCHEDULED",
//     notes: "",
//   },
//   {
//     id: 3,
//     patientId: 1,
//     doctorId: 1,
//     date: "2026-11-03",
//     time: "14:00",
//     status: "COMPLETED",
//     notes: "Patient recovered well.",
//   },
// ];

// export const availableSlots = [
//   "09:00",
//   "09:30",
//   "10:00",
//   "10:30",
//   "11:00",
//   "14:00",
//   "14:30",
//   "15:00",
//   "15:30",
// ];

// export const specializations = [
//   "Cardiology",
//   "Neurology",
//   "Pediatrics",
//   "Orthopedics",
//   "Dermatology",
//   "General Medicine",
// ];
