# 🌾 FarmAid

[![CI](https://github.com/Shubhampatel001/farmAid/actions/workflows/ci.yml/badge.svg)](https://github.com/Shubhampatel001/farmAid/actions/workflows/ci.yml)

FarmAid is a web application that helps **farmers find agricultural loan schemes, apply online and track their
applications**, while **loan officers (admins)** manage the schemes and approve or reject applications.

### 🌐 Live demo: **https://farmaid-onhl.onrender.com**

Log in with the demo accounts listed below. The demo runs on a free server that sleeps when unused,
so the first visit can take about a minute to load.

---

## 🎯 Try it in 3 steps (Demo mode, no technical setup)

Demo mode runs the complete application on your computer with **sample data and ready-made accounts**.
You don't need to install a database or change any settings.

### 1. Install Docker Desktop

Download it from **https://www.docker.com/products/docker-desktop/**, install it (restart your computer if asked),
then open it and wait until it says **"Engine running"**.

### 2. Get FarmAid

On the [GitHub page](https://github.com/Shubhampatel001/farmAid), click the green **Code** button →
**Download ZIP**, then extract (unzip) it, for example to your Desktop.

> Using Git? `git clone https://github.com/Shubhampatel001/farmAid.git`

### 3. Start it

| Your computer | What to do |
|---|---|
| **Windows** | Open the extracted folder and **double-click `start-demo.cmd`** |
| **macOS / Linux** | Open a terminal in the folder and run `bash start-demo.sh` |

The **first start takes a few minutes** while everything is prepared; later starts take seconds.
Your browser opens **http://localhost:8090** automatically when FarmAid is ready.

### Log in with a demo account

On the login page, click a demo account to fill it in (or type it):

| Role | Email | Password | What you can do |
|---|---|---|---|
| **Admin** (loan officer) | `admin@farmaid.demo` | `Admin@123` | Manage loan schemes, approve or reject applications, read feedback |
| **Farmer** | `ravi@farmaid.demo` | `Farmer@123` | Browse loans, apply, track applications, give feedback |
| **Farmer** | `priya@farmaid.demo` | `Farmer@123` | Same as above, with different sample applications |

**To stop:** press **Ctrl+C** in the window that opened (or close it).

> ℹ️ Demo mode is for trying and showing the app. **All data resets every time it restarts**, and the demo
> passwords are public, so never put real information into it.

<details>
<summary><b>Something not working?</b></summary>

| Problem | Fix |
|---|---|
| "Docker is not running" | Open Docker Desktop and wait for **Engine running**, then try again |
| Browser didn't open | Open **http://localhost:8090** yourself |
| "port is already allocated" | Something else uses port 8090. Close the other FarmAid window, or run `docker compose down` in the folder |
| Page looks outdated after downloading a new version | Run `docker compose up --build demo` in the folder |

</details>

---

## ✨ Features

**Farmers**
- Register, log in and browse active loan schemes with search and sorting
- EMI calculator to estimate monthly payments
- Apply with farm details, requested amount and a supporting document (image or PDF, up to 5 MB)
- Track application status and read the loan officer's remarks; cancel pending applications
- Give feedback and manage your own feedback

**Admins (loan officers)**
- Create, edit, deactivate and reactivate loan schemes
- Review all applications with filters and document preview
- Approve or reject applications (a reason is required when rejecting)
- View all feedback (read-only)

**Security:** role-based access, users only see their own data, encrypted passwords, token-based login.

## 🧱 Tech stack

| Part | Technology |
|---|---|
| Frontend | Angular 21, TypeScript, Bootstrap 5 |
| Backend | Java 21, Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, Flyway |
| Database | MySQL 8.4 (H2 in-memory for demo mode and tests) |
| Tooling | Docker / Docker Compose, Maven, npm, GitHub Actions CI |

## 📁 Project structure

```
farmaid/
├── backend/             Spring Boot REST API           → see backend/README.md
├── frontend/            Angular web app                → see frontend/README.md
├── Dockerfile           Single-container demo (site + API + sample data)
├── docker-compose.yml   Demo, local MySQL, and full-stack setups
├── start-demo.cmd/.sh   One-click demo start
└── .env.example         Configuration template for development
```

---

## 👩‍💻 For developers

Detailed guides:

- **[Backend guide](backend/README.md):** setup, configuration, API, security, database, tests
- **[Frontend guide](frontend/README.md):** setup, structure, routing, conventions, tests

### Requirements

| Tool | Version |
|---|---|
| Git | any recent |
| Java (JDK) | 21 or newer |
| Node.js | 22 LTS or 24 LTS |
| Docker Desktop | recent (for MySQL and the demo) |

Maven does not need to be installed; the project includes the Maven wrapper (`mvnw`).

### Run for development

```bash
git clone https://github.com/Shubhampatel001/farmAid.git
cd farmAid
cp .env.example .env                        # then edit the passwords and JWT_SECRET
docker compose up -d mysql                  # MySQL on localhost:3306

cd backend  && ./mvnw spring-boot:run       # API  → http://localhost:8080
cd frontend && npm install && npm start     # Web  → http://localhost:4200
```

The first backend start creates the database tables, four sample loan schemes and the admin account from your `.env`.

> **Frontend work without MySQL:** start the backend in demo mode instead:
> `./mvnw spring-boot:run -Dspring-boot.run.profiles=demo` (details in the [backend guide](backend/README.md#run-without-a-database-demo-profile)).

### Other ways to run

| Command | What it runs | URL |
|---|---|---|
| `docker compose up demo` | Demo mode (single container, sample data) | http://localhost:8090 |
| `docker compose --profile full up --build` | Full stack with MySQL (needs `JWT_SECRET` in `.env`) | http://localhost:8081 |

### Tests

```bash
cd backend  && ./mvnw verify                    # API integration tests
cd frontend && npx ng test --watch=false        # frontend unit tests
```

Every push to `main` and every pull request runs both test suites and the Docker builds in GitHub Actions.

---

## 🚀 Deployment

**Public demo link (free, simplest):** deploy the root `Dockerfile` as a **Docker web service on [Render](https://render.com)**:
Root Directory empty, Dockerfile Path `./Dockerfile`, Health Check Path `/actuator/health`, Free instance,
no environment variables. Free instances sleep when idle, so the first visit afterwards takes about a minute.

**Production (real data):** deploy `backend/` with the `prod` profile and a managed MySQL database, and `frontend/`
on a static host. See the deployment sections of the [backend](backend/README.md#deployment) and
[frontend](frontend/README.md#deployment) guides.

## 🤝 Contributing

1. Create a branch from `main`: `git checkout -b feature/short-description`
2. Make your changes and run the tests
3. Push and open a pull request; CI must pass before merging

Never commit `.env` or real passwords. `.env` is already in `.gitignore`.

## 🗺️ Roadmap

- Store uploaded documents in cloud storage (S3 / Cloudflare R2) instead of the database
- Email notifications on application decisions; password reset
- Server-side pagination for large lists
- Hindi / Odia translations; end-to-end browser tests

## 🖼️ Image credits

Photos in `frontend/public/images/` are free to use under their licences:

- `farm-fields.jpg`: [Pexels photo 974314](https://www.pexels.com/photo/974314/) (Pexels License)
- `vineyard-rows.jpg`: [Unsplash image](https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0) (Unsplash License)

The FarmAid icon and the social sharing image (`og-image.jpg`, built from `farm-fields.jpg`) were made for this project.
