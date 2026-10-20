# MediCore - Smart Hospital Management

## Purpose
MediCore is a hospital management system with a Spring Boot REST API backend and a React + Vite frontend. It supports three roles — **ADMIN**, **DOCTOR**, and **PATIENT** — with session-based login, patient self-registration, doctor management, appointment booking, slot availability, and doctor notes. Admins manage users, doctors, patients, and appointments; doctors manage their own appointments and notes; patients book and cancel appointments.

## Tech Stack
- **Backend:** Java 21, Spring Boot 4.1.1 (Spring Security, Spring Data JPA, Spring Web MVC, Validation, Actuator)
- **Build Tool:** Maven (use the included `mvnw` wrapper)
- **Mapping:** MapStruct 1.6.3 + Lombok
- **Database:** PostgreSQL (also H2 on classpath for local runs)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind, SWR for data fetching, Zod for validation
- **Docs:** springdoc-openapi (Swagger UI)

## Prerequisites
- JDK 21+
- Node.js 18+ and npm (for the frontend)
- PostgreSQL 14+ (or use the H2 fallback)
- Maven (or use `./mvnw`)

## Database Setup
1. Create the database:
   ```sql
   CREATE DATABASE hospital_management;


---

## 2. API Documentation

### Endpoint Table (from your controllers)

| Method | URL | Description | Request body | Success | Error |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | Public patient self-registration | `PatientCreateDTO` | 201 | 400, 409 |
| POST | `/api/auth/login` | Session login, returns email+role | `LoginRequestDTO` | 200 | 400, 401 |
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

> ⚠️ **Inconsistencies I found in your code**
> - **`PATCH /api/admin/users/{id}/enabled`** is called by your frontend (`usersApi.setEnabled`), but **no controller endpoint exists** for it. You must add it, or the "Enable/Disable" button will 404.
> - **`PUT /api/auth/change-password`** is called by `authApi.changePassword`, but no controller method exists.
> - **`GET /api/auth/me`** in your controller returns only `{email, role}` but your frontend Zod schema `authCurrentUserSchema` expects `{email, role, profile?}`. `profile` is optional so it parses — but you should return profile for full parity.
> - **`frontend/schemas/user.schema.ts`** sends `enabled` in `UserCreateDTO`, but the backend record **does not have an `enabled` field** — Jackson will throw 400 on create if the frontend sends it. Align these.
> - **`AppointmentsService.book`** validates the time is on a 30-min boundary **and** `@Future`, but **does not validate business hours (08:00–16:00)** even though `SlotsService` only advertises that window. A patient can book at 03:00. Add a check or the slot API and booking API will disagree.
> - **`SlotsController` path `/{id}/available-slots`** — combined with `@RequestMapping("/api/doctors")` — is fine, but note it collides in URL-space with `DoctorsController /{id}`. Spring resolves by exact path suffix, so it works, but keep it in mind if you add more subresources.
> - **`UsersController`** is missing the `PATCH .../enabled` handler that the frontend expects, as noted above.
> - **`DoctorsRepo.findByIdForUpdate`** uses `@Lock(PESSIMISTIC_WRITE)` inside `AppointmentsService.book` — good. But `deleteDoctor` in `DoctorsService` **does not** check for existing appointments (its own TODO says so). Deleting a doctor with appointments will fail with a `DataIntegrityViolationException` (FK), which the frontend does not handle. Either soft-delete, cascade, or check before delete.

### Springdoc-OpenAPI

Add to `pom.xml`:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.7.0</version>
</dependency>