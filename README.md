# MediCore - Smart Hospital Management

## Purpose

MediCore is a hospital management system with a Spring Boot REST API backend and a React + Vite frontend. It supports three roles — **ADMIN**, **DOCTOR**, and **PATIENT** — with session-based login, patient self-registration, doctor management, appointment booking, slot availability, and doctor notes.

- **Admins** manage users, doctors, patients, and appointments.
- **Doctors** manage their own appointments and notes.
- **Patients** book and cancel appointments.

## Tech Stack

- **Backend:** Java 21, Spring Boot 4.1.1 (Spring Security, Spring Data JPA, Spring Web MVC, Validation, Actuator)
- **Build Tool:** Maven (use the included `mvnw` wrapper)
- **Mapping:** MapStruct 1.6.3 + Lombok
- **Database:** PostgreSQL (H2 is also on the classpath for local runs)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind, SWR for data fetching, Zod for validation
#- **Docs:** springdoc-openapi (Swagger UI)

## Prerequisites

- JDK 21+
- Node.js 18+ and npm (for the frontend)
- PostgreSQL 14+ (or use the H2 fallback)
- Maven (or use `./mvnw`)

## Database Setup

1. Create the database:

   ```sql
   CREATE DATABASE hospital_management;
   ```

2. Configure the connection (URL, username, password) in `src/main/resources/application.properties`, or override with environment variables.
3. For a quick local run without PostgreSQL, use the H2 fallback instead.

## Running Locally

## Clone the repo
```bash
git clone https://github.com/rdm-code/medicore.git
```
## After cloning

```bash

cd medicore

# Backend
cd hospitalmangement
./mvnw spring-boot:run

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```
## Deploying in docker

```bash
sudo docker compose up --build
```
---

# API Documentation

## Endpoints

| Method | URL | Description | Request body | Success | Error |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public patient self-registration | `PatientCreateDTO` | 201 | 400, 409 |
| POST | `/api/auth/login` | Session login, returns email + role | `LoginRequestDTO` | 200 | 400, 401 |
| GET | `/api/auth/me` | Current logged-in user | – | 200 | 401 |
| POST | `/api/auth/logout` | Ends session (handled by SecurityConfig) | – | 204 | – |
| GET | `/api/admin/users` | List users | – | 200 | 401, 403 |
| GET | `/api/admin/users/{id}` | Get user | – | 200 | 404 |
| POST | `/api/admin/users` | Create user | `UserCreateDTO` | 201 | 400, 409 |
| PUT | `/api/admin/users/{id}` | Update user | `UserUpdateDTO` | 200 | 400, 404, 409 |
| DELETE | `/api/admin/users/{id}` | Delete user | – | 204 | 404 |
| POST | `/api/admin/doctors` | Create doctor (creates user + profile) | `DoctorCreateDTO` | 201 | 400, 409 |
| PUT | `/api/admin/doctors/{id}` | Update doctor | `DoctorUpdateDTO` | 200 | 400, 404 |
| DELETE | `/api/admin/doctors/{id}` | Delete doctor | – | 204 | 404 |
| GET | `/api/doctors` | List doctors, optional `?specialization=` | – | 200 | 401 |
| GET | `/api/doctors/{id}` | Get doctor | – | 200 | 404 |
| GET | `/api/doctors/me` | Doctor's own profile | – | 200 | 403, 404 |
| PUT | `/api/doctors/me` | Doctor updates own profile | `DoctorUpdateDTO` | 200 | 400, 404 |
| GET | `/api/doctors/{id}/available-slots?date=YYYY-MM-DD` | Free 30-min slots | – | 200 | 401, 404 |
| GET | `/api/patients` | List patients (ADMIN) | – | 200 | 403 |
| GET | `/api/patients/{id}` | Get patient (ADMIN) | – | 200 | 403, 404 |
| GET | `/api/patients/me` | Own patient profile | – | 200 | 403, 404 |
| PUT | `/api/patients/me` | Update own profile | `PatientUpdateDTO` | 200 | 400, 404 |
| PUT | `/api/patients/{id}` | Admin update patient | `PatientUpdateDTO` | 200 | 400, 403, 404 |
| DELETE | `/api/patients/{id}` | Admin delete patient + user | – | 204 | 403, 404 |
| POST | `/api/appointments` | Patient books | `AppointmentCreateDTO` | 201 | 400, 403, 404, 409 |
| GET | `/api/appointments/me` | My appointments (PATIENT/DOCTOR) | – | 200 | 403 |
| GET | `/api/appointments?status=&doctorId=` | Admin list | – | 200 | 403 |
| GET | `/api/appointments/{id}` | Get one (participant or admin) | – | 200 | 403, 404 |
| PATCH | `/api/appointments/{id}/cancel` | Cancel (participant or admin) | – | 200 | 403, 404, 409 |
| PATCH | `/api/appointments/{id}/complete` | Complete (doctor or admin) | – | 200 | 403, 404, 409 |
| PATCH | `/api/appointments/{id}/notes` | Doctor adds notes | `AppointmentNotesDTO` | 200 | 400, 403, 404, 409 |
| DELETE | `/api/appointments/{id}` | Admin delete | – | 204 | 403, 404 |

---

# MediCore Design

## Problem Statement

Hospitals juggle patients, doctors, and appointments across paper and spreadsheets. MediCore centralizes this in one REST API with role-based access: admins manage accounts and doctors, doctors see and complete their schedule and write notes, patients self-register, view available slots, and book/cancel appointments. The system must prevent double-booking of a doctor's time slot and enforce role permissions on every endpoint.

## Layered Architecture

```mermaid
flowchart LR
    A["React + Vite<br/>Nginx in prod"] -->|"HTTPS/JSON<br/>JSESSIONID cookie"| B["Controller layer<br/>@RestController"]
    B --> C["Service layer<br/>@Service @Transactional"]
    C --> D["Repository layer<br/>JpaRepository + custom @Query"]
    C -.-> M["MapStruct mappers<br/>DTO ⇄ Entity"]
    D -->|JDBC| E[("PostgreSQL<br/>hospital_management")]
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| PATIENT : "profile"
    USER ||--o| DOCTOR  : "profile"
    PATIENT ||--o{ APPOINTMENT : "books"
    DOCTOR  ||--o{ APPOINTMENT : "attends"

    USER {
        string  id PK
        string  email  "unique, not null"
        string  password "BCrypt"
        string  displayName
        enum    role   "ADMIN|DOCTOR|PATIENT"
        boolean enabled "default true"
        Instant createdAt
        Instant updatedAt
    }
    PATIENT {
        string  id PK
        string  userId FK "unique, not null"
        string  fullName
        int     age
        string  gender
        string  phone
        Instant updatedAt
    }
    DOCTOR {
        string  id PK
        string  userId FK "unique, not null"
        string  fullName
        string  specialization
        string  phone
        Instant updatedAt
    }
    APPOINTMENT {
        string   id PK
        string   patientId FK
        string   doctorId  FK
        datetime appointmentTime
        enum     status "SCHEDULED|COMPLETED|CANCELLED"
        string   reason  "max 500"
        string   notes   "max 1000"
        Instant  createdAt
        Instant  updatedAt
    }
```

## Architecture Design

```mermaid
%% Generated by https://gitdiagram.com/rdm-code/medicore
flowchart TD

subgraph group_client["React client"]
  node_app["Role-based pages<br/>[App.tsx]"]
  node_authui["Auth state<br/>[AuthContext.tsx]"]
  node_clientapi["API client<br/>[api.ts]"]
  node_appointmentsui["Appointment views"]
  node_adminui["Admin management<br/>[AdminUsers.tsx]"]
  node_doctorui["Doctor workspace"]
end

subgraph group_api["REST API"]
  node_authcontroller["Authentication"]
  node_appointmentscontroller["Appointment endpoints"]
  node_othercontrollers["Profile and admin endpoints"]
end

subgraph group_domain["Hospital services"]
  node_authservice["Registration and login"]
  node_appointmentservice["Booking and lifecycle"]
  node_doctorservice["Doctor management"]
  node_patientservice["Patient management"]
  node_userservice["User management<br/>[UsersService.java]"]
  node_slots["Slot availability<br/>[SlotsService.java]"]
end

subgraph group_persistence["Persistence"]
  node_repos["JPA repositories"]
  node_database[("Hospital database")]
end

node_users(("Admins, doctors, patients"))

node_users -->|"use"| node_app
node_app -->|"checks roles"| node_authui
node_authui -->|"authenticates"| node_clientapi
node_appointmentsui -.->|"requests data"| node_clientapi
node_adminui -.->|"manages records"| node_clientapi
node_doctorui -.->|"manages schedule"| node_clientapi
node_clientapi -.->|"calls REST API"| node_authcontroller
node_clientapi -.->|"calls REST API"| node_appointmentscontroller
node_users -->|"registers, logs in"| node_authcontroller
node_users -->|"books, manages"| node_appointmentscontroller
node_authcontroller -->|"registers via"| node_authservice
node_appointmentscontroller -->|"delegates"| node_appointmentservice
node_authservice -->|"creates profile"| node_repos
node_appointmentservice -->|"reads and writes"| node_repos
node_doctorservice -->|"reads and writes"| node_repos
node_patientservice -->|"reads and writes"| node_repos
node_userservice -->|"reads and writes"| node_repos
node_othercontrollers -.->|"delegates"| node_doctorservice
node_othercontrollers -.->|"delegates"| node_patientservice
node_othercontrollers -.->|"delegates"| node_userservice
node_othercontrollers -.->|"serves availability"| node_slots
node_slots -.->|"checks bookings"| node_repos
node_repos -.->|"persists entities"| node_database

click node_app "https://github.com/rdm-code/medicore/blob/main/frontend/src/App.tsx"
click node_authui "https://github.com/rdm-code/medicore/blob/main/frontend/src/context/AuthContext.tsx"
click node_clientapi "https://github.com/rdm-code/medicore/blob/main/frontend/src/lib/api.ts"
click node_appointmentsui "https://github.com/rdm-code/medicore/blob/main/frontend/src/pages/patient/BookAppointment.tsx"
click node_adminui "https://github.com/rdm-code/medicore/blob/main/frontend/src/pages/admin/AdminUsers.tsx"
click node_doctorui "https://github.com/rdm-code/medicore/blob/main/frontend/src/pages/doctor/DoctorAppointments.tsx"
click node_authcontroller "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/controllers/AuthController.java"
click node_appointmentscontroller "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/controllers/AppointmentsController.java"
click node_othercontrollers "https://github.com/rdm-code/medicore/tree/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/controllers"
click node_authservice "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/services/PatientsService.java"
click node_appointmentservice "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/services/AppointmentsService.java"
click node_doctorservice "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/services/DoctorsService.java"
click node_patientservice "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/services/PatientsService.java"
click node_userservice "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/services/UsersService.java"
click node_slots "https://github.com/rdm-code/medicore/blob/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/services/SlotsService.java"
click node_repos "https://github.com/rdm-code/medicore/tree/main/hospitalmangement/src/main/java/com/medicore/hospitalmangement/repos"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_app,node_authui,node_clientapi,node_appointmentsui,node_adminui,node_doctorui toneBlue
class node_authcontroller,node_appointmentscontroller,node_othercontrollers toneAmber
class node_authservice,node_appointmentservice,node_doctorservice,node_patientservice,node_userservice,node_slots toneMint
class node_repos,node_database toneRose
class node_users toneIndigo
```

[![Architecture diagram of rdm-code/medicore](https://gitdiagram.com/rdm-code/medicore/diagram.png)](https://gitdiagram.com/rdm-code/medicore?utm_source=readme&utm_medium=picture)

<!-- [![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/rdm-code/medicore?utm_source=readme&utm_medium=badge) -->
