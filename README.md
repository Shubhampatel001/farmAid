# 🌾 FarmAid

FarmAid is a web platform where farmers discover agricultural loan schemes, apply online with supporting
documents and track their applications, while administrators manage schemes, review applications and read feedback.

| Layer | Stack |
|---|---|
| Frontend | Angular 21 (standalone components, signals, zoneless), Bootstrap 5, Vitest |
| Backend | Spring Boot 3.5, Java 21, Spring Security + JWT (jjwt 0.13), Spring Data JPA, Flyway, springdoc OpenAPI |
| Database | MySQL 8.4 |
| Ops | Docker / docker compose, GitHub Actions |

## Features

**Farmers (USER):** register and log in · browse and search active loan schemes · EMI calculator · apply with farm details,
requested amount and a PNG/JPG/WEBP/PDF document (≤ 5 MB) · track status and officer remarks · cancel pending applications ·
leave and manage feedback.

**Administrators (ADMIN):** create, edit, deactivate and reactivate loan schemes · review all applications with filters ·
approve or reject (remarks required on rejection) · view document previews · read all feedback (view only).

**Security:** deny-by-default authorization, server-assigned roles (admins are seeded, never self-registered), ownership checks
on every user-scoped resource, BCrypt passwords, stateless JWT, strict CORS, consistent JSON errors.

## Project layout

```
backend/    Spring Boot API (com.farmaid: controller, service, repository, model, dto, mapper, security, exception, config)
frontend/   Angular app (core: models, services, guards, interceptors · shared: modal, pagination, … · components: pages)
docker-compose.yml   MySQL for development; add --profile full for the whole stack
.env.example         all configuration variables
```

## Running locally

Prerequisites: **JDK 21+**, **Node 24.15+** (Node 24.12 works with Angular 21; Angular 22 needs 24.15+), **Docker Desktop**.

```bash
cp .env.example .env              # then set real passwords and a JWT secret (openssl rand -base64 48)
docker compose up -d mysql        # MySQL on localhost:3306

cd backend && ./mvnw spring-boot:run          # API on http://localhost:8080 (reads ../.env)
cd frontend && npm install && npm start       # UI on http://localhost:4200, /api proxied to :8080
```

On first start Flyway creates the schema and seeds four sample loan schemes, and the admin account from
`ADMIN_EMAIL` / `ADMIN_PASSWORD` is created.

- Swagger UI: http://localhost:8080/swagger-ui.html (disabled in the `prod` profile)
- Health: http://localhost:8080/actuator/health

**Everything in Docker:** `docker compose --profile full up --build` → http://localhost:8081

## Public demo (single container)

The root `Dockerfile` builds a self-contained demo: the Angular site served by Spring Boot, an in-memory H2
database and sample data. It needs **no database and no environment variables**, and data **resets on every restart**.

With Docker Desktop running, start it in one of these ways:

- **Windows:** double-click **`start-demo.cmd`**
- **macOS / Linux:** `./start-demo.sh`
- **Any OS:** `docker compose up demo` (add `--build` after pulling new code)

Then open **http://localhost:8090** (the scripts open it for you when it's ready). Press **Ctrl+C** to stop.
The first run builds the image and takes a few minutes; later runs start in seconds.

Demo accounts (also shown on the login page):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@farmaid.demo` | `Admin@123` |
| Farmer | `ravi@farmaid.demo`, `priya@farmaid.demo`, `arjun@farmaid.demo` | `Farmer@123` |

**Deploy on Render (free):** New → Web Service → this repo → Language **Docker**, Root Directory empty,
Dockerfile Path `./Dockerfile`, Health Check Path `/actuator/health`, Free instance, no environment variables.
Free instances sleep when idle, so the first visit after a while takes about a minute.

## Configuration

| Variable | Purpose |
|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET` | ≥ 32 bytes, base64 recommended. **Required** outside the `dev` profile |
| `JWT_EXPIRATION_MINUTES` | Token lifetime (default 300) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins, e.g. `https://farmaid.example` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Initial administrator (created once if missing) |
| `SPRING_PROFILES_ACTIVE` | `dev` (default) or `prod` |
| `PORT` | HTTP port (default 8080) |

## Tests

```bash
cd backend && ./mvnw verify       # API integration tests (H2 in MySQL mode): auth, roles, ownership, lifecycle rules
cd frontend && npx ng test --watch=false   # Vitest unit tests: guards, interceptor, EMI, filtering, pagination
```

> Windows note: Vitest cannot find spec files when the project path contains parentheses (e.g. `FarmAid (GIT HUB)`).
> Run the tests from a path without them (or a directory junction). CI is unaffected.

## API overview

| Method & path | Access |
|---|---|
| `POST /api/auth/register`, `POST /api/auth/login` | public |
| `GET /api/loans`, `GET /api/loans/{id}`, `GET /api/location/states`, `GET /api/location/districts?state=` | public |
| `POST /api/loans`, `PUT /api/loans/{id}`, `PATCH /api/loans/{id}/status?active=` | ADMIN |
| `POST /api/applications`, `GET /api/applications/me`, `PATCH /api/applications/{id}/cancel` | USER |
| `GET /api/applications?status=`, `PATCH /api/applications/{id}/decision` | ADMIN |
| `GET /api/applications/{id}` (includes document) | owner or ADMIN |
| `POST /api/feedback`, `GET /api/feedback/me` | USER |
| `GET /api/feedback` | ADMIN |
| `DELETE /api/feedback/{id}` | USER, owner only (admins can view feedback but not delete it) |
| `GET/PUT /api/users/me`, `PUT /api/users/me/password` | authenticated |
| `GET /api/users` | ADMIN |

## Deployment

Suggested low-cost setup: frontend on Cloudflare Pages / Netlify (SPA fallback to `index.html`, rewrite `/api/*` to the backend),
backend Docker image on Railway / Render / Fly.io with `SPRING_PROFILES_ACTIVE=prod`, and a managed MySQL database.
Set `CORS_ALLOWED_ORIGINS` to the frontend URL, or set `apiUrl` in `frontend/src/environments/environment.prod.ts`
if the API lives on another domain.

## Image credits

Photos in `frontend/public/images/` are free to use under their licences (no attribution required, credited anyway):

- `farm-fields.jpg`: [Pexels photo 974314](https://www.pexels.com/photo/974314/) (Pexels License)
- `vineyard-rows.jpg`: [Unsplash image 1563514227147-6d2ff665a6a0](https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0) (Unsplash License)

## Roadmap

- Move uploaded documents to object storage (S3 / Cloudflare R2) instead of the database
- Email notifications on application decisions; password reset
- Server-side pagination for large application lists
- Hindi / Odia translations; Playwright end-to-end tests
