# ⚡ JIM-System (Full-Stack Personal Gym & Fitness Platform)

A modern, maintainable, and type-safe full-stack platform for a **personal gym, fitness, health, performance, and wellbeing tracker**, powered by a **NestJS** backend with **Prisma ORM** + **PostgreSQL** and an ultra-responsive, dark-mode glassmorphic **React 19 + TypeScript + Vite** frontend.

---

## 🏗️ Architecture & Technology Stack

```
                   ┌──────────────────────────────────────────────┐
                   │               CLIENT LAYER                   │
                   │   React 19 + TypeScript + Vite 8 SPA         │
                   │   Dark-mode Glassmorphism UI (Vanilla CSS)   │
                   └──────────────────────┬───────────────────────┘
                                          │
                                HTTP / REST (JSON)
                                 (Bearer JWT Auth)
                                          │
                   ┌──────────────────────▼───────────────────────┐
                   │               BACKEND LAYER                  │
                   │      NestJS 12 (TypeScript, NodeNext ESM)    │
                   │   Global Validation Pipe & Exception Filters │
                   │   OpenAPI / Swagger at `/api/docs`           │
                   └──────────────────────┬───────────────────────┘
                                          │
                                      Prisma ORM
                                          │
                   ┌──────────────────────▼───────────────────────┐
                   │              DATABASE LAYER                  │
                   │       PostgreSQL 16+ (Embedded / Docker)     │
                   └──────────────────────────────────────────────┘
```

### 🛠️ Backend Stack
- **Framework**: [NestJS 12](https://nestjs.com/)
- **Language**: TypeScript (ES2023, NodeNext ESM)
- **Database**: PostgreSQL 16+
- **ORM**: [Prisma 6](https://www.prisma.io/)
- **API Documentation**: OpenAPI / Swagger UI
- **Authentication**: Passport JWT, bcrypt
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: [Vitest](https://vitest.dev/) & Supertest

### 🎨 Frontend Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Language**: TypeScript
- **Styling**: Curated Dark Glassmorphic Design System (Pure Vanilla CSS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Celebration Effects**: `canvas-confetti`
- **Dev Reverse-Proxy**: Preconfigured `/api` proxy to backend (`http://localhost:3000`)

---

## 🚀 Key Features Implemented

### 1. Active Workout Session Tracker
- **Real-Time Duration Timer**: Live elapsed time counter formatted in `hh:mm:ss`.
- **Comprehensive Set Logging**: Support for `WORKING`, `WARMUP`, `DROP_SET`, and `FAILURE` set classifications.
- **Biomechanical Metrics**: Track load, reps, target reps, RPE (Rating of Perceived Exertion), and completion status.
- **Dynamic Exercise Selection**: Search and insert any catalog or custom exercise directly into an ongoing workout.
- **Built-in Rest Timer**: Floating circular countdown timer with quick presets (30s, 60s, 90s, 120s, 180s) and sound cues.
- **Volume Computation Engine**: Real-time working volume calculation (excluding warm-up sets) and working set counter.
- **Celebration Feedback**: Confetti burst upon completing a workout session.

### 2. Workout History & Analytics
- **Chronological Session Feed**: List of past workouts with local date grouping, duration, and calculated tonnage.
- **Expandable Session Drilldown**: Inspect exercise-level set breakdowns, weights, reps, and RPE ratings.
- **Safe Session Management**: Full deletion with confirmation cascades to underlying set records.

### 3. Exercise Catalog & Muscle Taxonomy
- **Default Catalog**: Seeded library categorized by movement pattern (`PUSH`, `PULL`, `SQUAT`, `HINGE`, `ISOLATION`, `CARRY`, etc.) and equipment (`BARBELL`, `DUMBBELL`, `CABLE`, `MACHINE`, `BODYWEIGHT`).
- **Custom Exercise Creator**: Athletes can create custom exercises with primary and secondary muscle group tagging.
- **Performance History Lookup**: Inspect historical loads, sets, and date logs for individual exercises.
- **Search & Multi-Filter**: Real-time filtering by category and equipment type.

### 4. Workout Routine Templates
- **Reusable Routine Library**: Save recurring workouts (e.g., Push Day, Pull Day, Leg Hypertrophy).
- **1-Click Session Launcher**: Instantly spin up an active workout session pre-populated from any saved routine.
- **Template Creator**: Build routines with suggested exercises, target sets, reps, and rest intervals.

### 5. Athlete Profile & Unit Customization
- **Multi-Tenant JWT Isolation**: All records are strictly scoped to the authenticated user.
- **Configurable Preferences**: Toggle between `KG` and `LB`, configure height, select timezones, and set week start day (`MONDAY`/`SUNDAY`).
- **Direct Swagger Shortcut**: In-app link to test and inspect the underlying REST API.

---

## 📂 Project Directory Structure

```text
JIM-System/
├── frontend/                     # React + TypeScript + Vite SPA
│   ├── public/                   # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/               # Branding and illustrations
│   │   ├── components/           # Modular UI views & widgets
│   │   │   ├── ActiveWorkout.tsx     # Real-time workout session logger
│   │   │   ├── AuthScreen.tsx        # Authentication & Registration view
│   │   │   ├── ExerciseLibrary.tsx   # Catalog, search, filters & custom exercises
│   │   │   ├── RestTimer.tsx         # Circular rest timer with presets
│   │   │   ├── UserProfileTab.tsx    # Athlete settings & Swagger shortcut
│   │   │   ├── WorkoutHistory.tsx    # Historical logs & session breakdowns
│   │   │   └── WorkoutTemplates.tsx  # Routine templates & 1-click launcher
│   │   ├── context/
│   │   │   └── AuthContext.tsx       # Auth provider & persistent state
│   │   ├── services/
│   │   │   └── api.ts                # Type-safe API client & HTTP interceptor
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript contracts & DTOs
│   │   ├── App.tsx                   # Main navigation & shell layout
│   │   ├── index.css                 # Dark-mode glassmorphic design system
│   │   └── main.tsx                  # Client application entry point
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite config with API reverse proxy
├── prisma/                       # Database ORM
│   └── schema.prisma             # PostgreSQL schema & relations
├── scripts/                      # DB utilities
│   ├── seed.js                   # Exercise library & demo seed script
│   └── start-db.js               # Zero-dependency embedded Postgres runner
├── src/                          # NestJS Backend API
│   ├── auth/                     # Authentication & Profile management
│   ├── common/                   # Guards, interceptors, filters, decorators
│   ├── exercises/                # Exercise catalog services & controllers
│   ├── prisma/                   # Prisma client service
│   ├── workout-templates/        # Routine templates modules
│   ├── workouts/                 # Workout sessions & transactional sets
│   ├── app.module.ts             # Root application module
│   └── main.ts                   # NestJS bootstrap & Swagger configuration
├── test/                         # End-to-end integration tests
├── docker-compose.yml            # Containerized PostgreSQL service
├── package.json                  # Root monorepo scripts & dependencies
└── README.md
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js**: `v20+` or `v24+`
- **npm**: `10+`

---

### 2. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Default `.env` configuration for local embedded PostgreSQL:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:54329/postgres?schema=public"
JWT_SECRET="jim-gym-tracker-super-secret-jwt-key-2026"
JWT_EXPIRATION="7d"
NODE_ENV="development"
```

---

### 3. Start Local Database
Choose either zero-dependency embedded PostgreSQL or Docker Compose:

**Option A: Embedded PostgreSQL (Recommended for quick local dev - zero external install needed)**
```bash
npm run db:start
```

**Option B: Docker Compose**
```bash
docker compose up -d
```
*(If using Docker Compose on default port 5432, ensure `DATABASE_URL` in `.env` points to port `5432`)*

---

### 4. Database Setup & Seeding
Push the Prisma schema to the database and seed default exercises, workout routines, and demo user:
```bash
# Push schema to database
npm run db:push

# Seed default exercise catalog and demo athlete
npm run db:seed
```

**Demo User Credentials:**
- **Email**: `demo@jim.app`
- **Password**: `Password123!`

---

### 5. Running the Application

Open two terminal windows (or run concurrently):

#### Terminal 1: Backend API (NestJS)
```bash
npm run start:dev
```
- API Base: `http://localhost:3000/api/v1`
- Interactive Swagger UI: `http://localhost:3000/api/docs`

#### Terminal 2: Frontend Web App (Vite + React)
```bash
npm run frontend:dev
```
- Web Application: **`http://localhost:5173`**
- All `/api/*` calls are automatically reverse-proxied to `http://localhost:3000`.

---

## 🧪 Testing & Validation

```bash
# Run backend unit tests (Vitest)
npm test

# Run backend end-to-end integration tests
npm run test:e2e

# Run backend tests with code coverage
npm run test:cov

# Validate and build the frontend bundle
npm run frontend:build
```

---

## 🗺️ API Reference

### Authentication & Profile (`/api/v1`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user and initialize athlete profile | No |
| `POST` | `/auth/login` | Authenticate and obtain JWT Bearer token | No |
| `GET` | `/auth/me` | Fetch authenticated user identity | Yes |
| `GET` | `/profile` | Fetch user profile & unit preferences | Yes |
| `PATCH` | `/profile` | Update profile (weightUnit, lengthUnit, timezone, etc.) | Yes |

### Exercises (`/api/v1/exercises`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/exercises` | List exercises with search, filtering & pagination | Yes |
| `GET` | `/exercises/:id` | Get exercise details | Yes |
| `GET` | `/exercises/:id/history` | Historical performance log for an exercise | Yes |
| `POST` | `/exercises` | Create a custom exercise | Yes |
| `PATCH` | `/exercises/:id` | Update a custom exercise | Yes |
| `DELETE` | `/exercises/:id` | Archive/delete a custom exercise | Yes |

### Workout Templates (`/api/v1/workout-templates`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/workout-templates` | List user's saved routine templates | Yes |
| `GET` | `/workout-templates/:id` | Get template with planned exercises & sets | Yes |
| `POST` | `/workout-templates` | Create a workout template | Yes |
| `PATCH` | `/workout-templates/:id` | Update a workout template | Yes |
| `DELETE` | `/workout-templates/:id` | Archive a workout template | Yes |

### Workout Sessions (`/api/v1/workouts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/workouts` | List logged workouts with date & status filters | Yes |
| `GET` | `/workouts/:id` | Get workout details, sets, and volume summary | Yes |
| `POST` | `/workouts` | Record a workout session with nested sets | Yes |
| `PATCH` | `/workouts/:id` | Update workout session & sets transactionally | Yes |
| `DELETE` | `/workouts/:id` | Delete workout session (cascade delete sets) | Yes |

---

## 🔮 Roadmap & Future Phases

- **Phase 2: Health, Wellbeing & Goals**
  - Daily check-ins (`DailyCheckIn`: sleep hours, soreness heatmap, fatigue, mood, stress).
  - Health observations (`HealthObservation`: body weight, waist, body fat %, resting HR, steps).
  - Cardio activity logging (`CardioActivity`: running, cycling, pace, elevation, HR).
  - Goal tracking (`Goal`: strength milestones, body composition targets, workout frequency).
- **Phase 3: Analytics & Calculation Engine**
  - Estimated 1RM calculators (Brzycki & Epley algorithms).
  - Volume progression charts and weekly muscle group distribution heatmaps.
  - Recovery vs. training strain correlation insights.
- **Phase 4: Data Portability & Backup**
  - Canonical JSON export and import with conflict resolution.
  - CSV exports for spreadsheet analysis.
  - Full automated backup & restore verification.
