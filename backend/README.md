# FarmAid Backend

REST API for FarmAid, built with **Spring Boot 3.5** and **Java 21**. It handles authentication, loan schemes,
loan applications (with supporting documents), feedback, and Indian state/district lookups.

> New to the project? Start with the [main README](../README.md). The quickest way to see everything running is
> **demo mode**.

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Profiles](#profiles)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Domain model](#domain-model)
- [API](#api)
- [Security](#security)
- [Database and migrations](#database-and-migrations)
- [Testing](#testing)
- [Building and Docker](#building-and-docker)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Tech stack

| Concern | Technology |
|---|---|
| Framework | Spring Boot 3.5 (Web, Data JPA, Security, Validation, Actuator) |
| Language | Java 21 (builds on newer JDKs too) |
| Auth | Stateless JWT (jjwt 0.13), BCrypt password hashing |
| Database | MySQL 8.4 in development/production; H2 (in-memory, MySQL mode) for demo and tests |
| Migrations | Flyway |
| API docs | springdoc-openapi (Swagger UI) |
| Build | Maven (wrapper included), Lombok |

## Getting started

### Prerequisites

- **JDK 21 or newer** (`java -version`)
- **Docker Desktop** for the local MySQL database (or your own MySQL 8.x)
- Maven is **not** required: use the included wrapper `./mvnw` (Windows: `mvnw.cmd`)

### Run with MySQL (standard development setup)

From the repository root:

```bash
cp .env.example .env          # set DB_PASSWORD, MYSQL_ROOT_PASSWORD and a long random JWT_SECRET
docker compose up -d mysql    # starts MySQL 8.4 on localhost:3306
```

Then from `backend/`:

```bash
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

The API starts on **http://localhost:8080**. On first start:

- Flyway creates the schema and seeds four sample loan schemes
- an admin account is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

Useful URLs:

| URL | Purpose |
|---|---|
| http://localhost:8080/swagger-ui.html | Interactive API documentation (not in `prod`) |
| http://localhost:8080/actuator/health | Health check |

> The backend reads `.env` from the repository root (or `backend/`) automatically, so you don't need to export the
> variables yourself.

### Run without a database (demo profile)

For frontend work or a quick look at the API, run with the **demo** profile. It uses an in-memory database filled
with sample farmers, applications and feedback, and needs no `.env`:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo
```

Windows PowerShell needs the argument in quotes:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Demo logins: `admin@farmaid.demo` / `Admin@123`, and `ravi@farmaid.demo`, `priya@farmaid.demo`,
`arjun@farmaid.demo` / `Farmer@123`. **Data resets on every restart.**

## Profiles

Set with `SPRING_PROFILES_ACTIVE` (default `dev`).

| Profile | Database | Use for | Notes |
|---|---|---|---|
| `dev` (default) | MySQL | Local development | SQL logging on; a dev-only JWT secret is used if `JWT_SECRET` is unset |
| `prod` | MySQL | Production | Swagger disabled; `JWT_SECRET` is required |
| `demo` | H2 in-memory | Public demo, frontend development | Sample data and fixed demo accounts; resets on restart; never use with real data |
| `test` | H2 in-memory | Automated tests | Used by `@ActiveProfiles("test")` |

## Configuration

All settings come from environment variables (or `.env`). See [`.env.example`](../.env.example).

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/farmaid` | JDBC URL |
| `DB_USER` / `DB_PASSWORD` | `farmaid` / *(empty)* | Database credentials |
| `JWT_SECRET` | *(none)* | Token signing key, **at least 32 bytes** (base64 recommended: `openssl rand -base64 48`) |
| `JWT_EXPIRATION_MINUTES` | `300` | Login token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` | Comma-separated frontend origins allowed to call the API |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | *(none)* | Initial admin, created once if it doesn't exist |
| `PORT` | `8080` | HTTP port (hosting platforms set this automatically) |

## Project structure

```
src/main/java/com/farmaid/
├── controller/    REST endpoints (thin: validate input, call a service)
├── service/       Business rules and transactions
├── repository/    Spring Data JPA repositories
├── model/         JPA entities and enums
├── dto/           Request/response records (entities never leave the service layer)
├── mapper/        Entity → DTO conversion
├── security/      JWT filter, security rules, CORS, JSON 401/403 responses
├── exception/     Exceptions and the global error handler
└── config/        Admin seeding, demo data, OpenAPI, SPA hosting
src/main/resources/
├── application.yml            Configuration and profiles
├── db/migration/              Flyway migrations (V1__init.sql, V2__seed_loans.sql)
└── data/StatesAPI.json        States and districts
```

## Domain model

| Entity | Key fields |
|---|---|
| `User` | email (unique), username, mobileNumber, role (`USER` or `ADMIN`) |
| `Loan` | loanType (unique), interestRate, maximumAmount, repaymentTenure (months), eligibility, documentsRequired, active |
| `LoanApplication` | user, loan, requestedAmount, farm details, state/district, status, adminRemarks, document |
| `ApplicationDocument` | base64 data URL of the uploaded file (separate table, loaded only when needed) |
| `Feedback` | user, text, rating (1–5), date |

**Application lifecycle**

```
PENDING ──(admin)──▶ APPROVED
   │      (admin, remarks required)──▶ REJECTED
   └──(owner)──▶ CANCELLED
```

Business rules:

- Applications are only accepted for **active** loans
- The requested amount can't exceed the loan's maximum
- One **pending** application per farmer per loan
- Only pending applications can be decided or cancelled
- Loans are never deleted, only deactivated, because applications reference them

## API

All endpoints are under `/api`. Full request and response schemas are in Swagger UI.

| Method & path | Access |
|---|---|
| `POST /auth/register` · `POST /auth/login` | Public |
| `GET /loans` · `GET /loans/{id}` | Public (admins also see inactive loans) |
| `GET /location/states` · `GET /location/districts?state=` | Public |
| `POST /loans` · `PUT /loans/{id}` · `PATCH /loans/{id}/status?active=` | ADMIN |
| `POST /applications` · `GET /applications/me` · `PATCH /applications/{id}/cancel` | USER |
| `GET /applications?status=` · `PATCH /applications/{id}/decision` | ADMIN |
| `GET /applications/{id}` (includes the document) | Owner or ADMIN |
| `POST /feedback` · `GET /feedback/me` · `DELETE /feedback/{id}` | USER (delete: own feedback only) |
| `GET /feedback` | ADMIN (read-only) |
| `GET /users/me` · `PUT /users/me` · `PUT /users/me/password` | Any logged-in user |
| `GET /users` | ADMIN |

**Authentication:** call `POST /api/auth/login`, then send `Authorization: Bearer <token>` with each request.

**Errors** always use one JSON shape:

```json
{
  "timestamp": "2026-10-04T10:15:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/applications",
  "fieldErrors": { "requestedAmount": "Requested amount must be positive" }
}
```

| Status | Meaning |
|---|---|
| 400 | Invalid input or a broken business rule |
| 401 | Not logged in, or the token is invalid or expired |
| 403 | Logged in but not allowed |
| 404 | Not found, or not yours |
| 409 | Duplicate, or not allowed in the current state |

## Security

- **Deny by default:** every endpoint is listed explicitly in `SecurityConfig`; anything else is rejected.
- **Roles are assigned by the server.** Registration always creates a `USER`; admins come only from
  `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Ownership:** user-scoped endpoints take the user ID from the token, never from the URL. Other people's records
  return 404, so their IDs aren't revealed.
- **Stateless JWT** (HS256). Each request reloads the user, so deleted users and role changes apply immediately.
- **CORS** is limited to `CORS_ALLOWED_ORIGINS`.
- **Uploads** must be PNG, JPG, WEBP or PDF data URLs under 5 MB.

## Database and migrations

The schema is managed by **Flyway**, and Hibernate only validates it (`ddl-auto=validate`).

To change the schema, add a new file such as `src/main/resources/db/migration/V3__add_column.sql`.

> ⚠️ **Never edit a migration that has already run.** Always add a new version.

To reset your local database: `docker compose down -v`, then `docker compose up -d mysql`. This deletes all local data.

## Testing

```bash
./mvnw verify
```

| Test class | Covers |
|---|---|
| `FarmAidApiIntegrationTest` | Registration and validation, role checks (401/403), ownership, loan management, the full application lifecycle, feedback permissions |
| `DemoProfileIntegrationTest` | Demo profile starts with sample data and demo logins; frontend routes aren't blocked by security |

Tests run on H2 in MySQL mode, so no database or Docker is needed.

## Building and Docker

```bash
./mvnw package                # → target/farmaid-backend-1.0.0.jar
java -jar target/farmaid-backend-1.0.0.jar
```

```bash
docker build -t farmaid-backend .     # production image (backend only), uses the prod profile
```

The repository root `Dockerfile` builds the **demo** image instead: frontend and backend in one container.

## Deployment

1. Provision a MySQL 8 database.
2. Run the backend image or JAR with:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DB_URL`, `DB_USER`, `DB_PASSWORD`
   - a strong `JWT_SECRET`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`
   - `CORS_ALLOWED_ORIGINS` set to your frontend URL
3. Point the host's health check at `/actuator/health`.

Logs go to standard output, which suits container platforms.

## Troubleshooting

| Problem | Fix |
|---|---|
| `JWT_SECRET must be set` | Add `JWT_SECRET` to `.env`, at least 32 bytes |
| `Communications link failure` | MySQL isn't running: `docker compose up -d mysql` |
| `Port 8080 was already in use` | Stop the other process, or set `PORT=8081` |
| Lombok errors in the IDE (missing getters) | Enable annotation processing and install the Lombok plugin |
| Flyway `checksum mismatch` | An applied migration was edited. Revert it and add a new version (or reset your local database) |
