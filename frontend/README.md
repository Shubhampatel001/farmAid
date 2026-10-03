# FarmAid Frontend

Web application for FarmAid, built with **Angular 21** (standalone components, signals, zoneless change detection)
and **Bootstrap 5**.

> New to the project? Start with the [main README](../README.md). The quickest way to see everything running is
> **demo mode**.

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Build configurations](#build-configurations)
- [Project structure](#project-structure)
- [Routes and roles](#routes-and-roles)
- [How login works](#how-login-works)
- [Conventions](#conventions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Tech stack

| Concern | Technology |
|---|---|
| Framework | Angular 21, TypeScript 5.9 |
| State | Angular signals (zoneless, no zone.js) |
| Forms | Reactive forms (template-driven forms for small inputs) |
| Styling | Bootstrap 5, Bootstrap Icons, component CSS, Poppins font |
| HTTP | `HttpClient` with functional interceptors |
| Tests | Vitest via the Angular CLI test builder |

## Getting started

### Prerequisites

- **Node.js 22 LTS or 24 LTS** (`node -v`) and npm
- A running **backend** on `http://localhost:8080`

### 1. Start a backend

Either option works:

- **Quickest (no database):** from `backend/`, run `./mvnw spring-boot:run -Dspring-boot.run.profiles=demo`.
  It comes with sample data and demo logins; see the [backend guide](../backend/README.md#run-without-a-database-demo-profile).
- **Full setup with MySQL:** follow the [backend guide](../backend/README.md#run-with-mysql-standard-development-setup).

### 2. Start the frontend

```bash
npm install
npm start
```

Open **http://localhost:4200**. Requests to `/api` are forwarded to `http://localhost:8080` by
[`proxy.conf.json`](proxy.conf.json), so there's nothing to configure and no CORS setup.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Dev server on port 4200 with live reload and the `/api` proxy |
| `npm run build` | Production build into `dist/frontend/browser` |
| `npx ng build --configuration demo` | Demo build (shows demo accounts on the login page) |
| `npm run watch` | Development build that rebuilds on changes |
| `npx ng test --watch=false` | Run unit tests once (`npm test` runs in watch mode) |

## Build configurations

| Configuration | Environment file | Used by |
|---|---|---|
| `development` | `environment.ts` | `npm start` |
| `production` (default for `ng build`) | `environment.prod.ts` | Production deployments |
| `demo` | `environment.demo.ts` | Root `Dockerfile` (demo image); lists the demo accounts on the login page |

`apiUrl` is `/api` in every environment. If the API is hosted on a different domain without a proxy, set the full URL
in `environment.prod.ts` (for example `https://api.example.com/api`) and add the frontend's origin to the backend's
`CORS_ALLOWED_ORIGINS`.

## Project structure

```
src/
├── app/
│   ├── core/                  App-wide logic, no UI
│   │   ├── models.ts          Types matching the backend DTOs
│   │   ├── services/          AuthService, API services, ToastService
│   │   ├── http.ts            Interceptors (bearer token, session expiry) and errorMessage()
│   │   ├── guards.ts          authGuard (login and role), guestGuard
│   │   └── title-strategy.ts  "<Page> | FarmAid" browser titles
│   ├── shared/                Reusable UI: modal, pagination, status badge, toasts, document preview, helpers
│   ├── components/            Pages and the navbars (one folder per component)
│   ├── app.routes.ts          Routes (lazy-loaded) with guards
│   └── app.config.ts          Providers: router, HTTP, interceptors, startup session check
├── environments/              API URL and demo accounts per build configuration
├── index.html                 Page title, meta tags, fonts
└── styles.css                 Global styles and theme colours
public/
└── images/                    Local images (see image credits in the main README)
```

## Routes and roles

| Path | Page | Access |
|---|---|---|
| `/` · `/about` · `/services` · `/contact` · `/privacy` · `/terms` | Public pages | Everyone |
| `/loans` | Loan schemes, EMI calculator | Everyone (applying needs login) |
| `/login` · `/signup` | Authentication | Visitors only |
| `/loans/:loanId/apply` · `/my/applications` · `/my/feedback` · `/my/feedback/new` | Farmer pages | `USER` |
| `/admin/loans` · `/admin/loans/new` · `/admin/loans/:loanId/edit` · `/admin/applications` · `/admin/feedback` | Admin pages | `ADMIN` |
| anything else | Not-found page | Everyone |

A protected route declares its role in route data (`data: { role: 'USER' }`) and uses `authGuard`. Visitors are sent
to `/login?returnUrl=…` and come back after logging in. Users with the wrong role go to their own home page.

The navbar switches automatically between the visitor, farmer and admin versions.

## How login works

1. `AuthService.login()` stores the token, user ID, name, role and expiry in `localStorage`.
2. `authInterceptor` adds `Authorization: Bearer <token>` to every `/api` request.
3. **On startup**, `AuthService.validateSession()` checks the saved login with `GET /api/users/me` in the background.
   - Valid: the stored name and role are refreshed.
   - Rejected (for example after the demo restarts): the login is cleared, with a single message.
   - Server unreachable: the user stays logged in.
4. If any request later returns **401**, `sessionExpiryInterceptor` ends the session once, shows one message and
   redirects to `/login`.

## Conventions

- **Standalone components only.** Each component imports exactly what it uses.
- **Use signals for component state.** The app is zoneless, so a value changed inside a callback (for example an
  HTTP response) only updates the screen if it is a signal. Use `signal()`, `computed()` and `linkedSignal()`.
- **Use the built-in control flow** (`@if`, `@for`, `@switch`) instead of `*ngIf` / `*ngFor`.
- **Modals:** use `<app-modal>` inside an `@if` block. Don't use Bootstrap's modal JavaScript.
- **Messages:** use `ToastService` for success and error messages, and `errorMessage(err)` to turn API errors into text.
- **API access** goes through the services in `core/services/api.services.ts`, never `HttpClient` directly in components.
- **Styling:** use the theme colours from `styles.css` (`#437057` green, `#fbc02d` yellow). Keep images in
  `public/images/`; don't link images from other websites.

## Testing

```bash
npx ng test --watch=false
```

| Spec | Covers |
|---|---|
| `core/core.spec.ts` | Guards, bearer-token interceptor, error messages, startup session check (valid, rejected, offline, single message) |
| `shared/shared.spec.ts` | EMI formula, loan search and sort, pagination, rating emojis |

> **Windows note:** Vitest can't find test files when the project path contains parentheses, for example
> `C:\...\FarmAid (GIT HUB)\...`. Clone into a path without them. CI isn't affected.

## Deployment

`npm run build` outputs static files to `dist/frontend/browser`. Any static host works, as long as it:

1. **Serves `index.html` for unknown paths** (SPA fallback), so refreshing `/my/applications` works.
2. **Forwards `/api/*` to the backend**, or uses a full API URL in `environment.prod.ts` (see
   [Build configurations](#build-configurations)).

Examples:

| Host | Setup |
|---|---|
| Netlify | `public/_redirects` with `/api/*  https://<backend>/api/:splat  200` and `/*  /index.html  200` |
| Vercel | `vercel.json` rewrites for `/api/:path*` and `/(.*)` → `/index.html` |
| Docker / nginx | `frontend/Dockerfile` with [`nginx.conf`](nginx.conf), which already includes both rules |

## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server" message | The backend isn't running on port 8080 |
| Page doesn't update after changing data in a callback | The value isn't a signal (see [Conventions](#conventions)) |
| `ng` command not found | Use `npx ng …` or the npm scripts |
| Engine warnings during `npm install` | Use Node 22 LTS or 24 LTS |
| Tests report "No test files found" on Windows | The path contains parentheses (see [Testing](#testing)) |
