# JIM-System (Personal Gym Tracker Backend & REST API)

A robust, maintainable, and type-safe backend for a **personal gym, fitness, health, performance, and wellbeing tracker**, built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## 🚀 Key Features (Phase 1 Implemented)

- **User Authentication & Profile**:
  - Secure JWT authentication (`/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`).
  - Unit preferences and profile management (`/api/v1/profile`): configurable weight unit (`KG`/`LB`), length unit (`CM`/`INCH`), fluid unit (`ML`/`OZ`), time zones, and week start preference.
  - Multi-tenant data isolation: all private operations are bound to the authenticated user.
- **Exercise Catalog**:
  - System default exercises across movement categories (`PUSH`, `PULL`, `SQUAT`, `HINGE`, `ISOLATION`, etc.) and equipment (`BARBELL`, `DUMBBELL`, `CABLE`, `MACHINE`, `BODYWEIGHT`).
  - User-created custom exercises with muscle group tagging (`primaryMuscleGroups`, `secondaryMuscleGroups`).
  - Search, filter, pagination, and historical exercise performance lookup.
  - Protection: Default system exercises cannot be modified or deleted by regular users.
- **Workout Routine Templates**:
  - Reusable workout templates with suggested exercises, sets, reps, load, and rest periods (`/api/v1/workout-templates`).
  - Transactional update logic.
- **Workout Sessions, Exercises & Sets**:
  - Full CRUD for workout sessions (`/api/v1/workouts`).
  - Record nested exercises and sets transactionally in a single atomic database operation.
  - Set types: `WARMUP`, `WORKING`, `DROP_SET`, `FAILURE`.
  - Rich metadata per set: weight, weight unit, reps, target reps, RPE, RIR, tempo, rest duration, limb/side.
  - Automatic calculation of session volume (kg) excluding warm-up sets, working set count, and total reps.
  - Cascading deletes with data integrity preservation.
- **Developer Experience & Tooling**:
  - Global OpenAPI / Swagger documentation at `/api/docs`.
  - Global input validation via `class-validator` and `ValidationPipe`.
  - Uniform JSON error responses via `AllExceptionsFilter`.
  - Zero-dependency local development via embedded PostgreSQL (`embedded-postgres`), with optional Docker Compose support.
  - Complete automated test suite (Unit & E2E) with Vitest.

---

## 🛠️ Technology Stack

- **Framework**: [NestJS 12](https://nestjs.com/)
- **Language**: TypeScript (ES2023, NodeNext ESM)
- **Database**: PostgreSQL 16+
- **ORM**: [Prisma 6](https://www.prisma.io/)
- **Documentation**: Swagger / OpenAPI 3.0
- **Testing**: [Vitest](https://vitest.dev/) & Supertest
- **Security**: Passport JWT, bcrypt

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- npm `10+`

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` settings for local embedded PostgreSQL:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:54329/postgres?schema=public"
JWT_SECRET="jim-gym-tracker-super-secret-jwt-key-2026"
JWT_EXPIRATION="7d"
NODE_ENV="development"
```

### 3. Start Local Database
You can choose either the embedded PostgreSQL (zero external dependencies) or Docker Compose:

**Option A: Embedded PostgreSQL (Recommended for quick local dev)**
```bash
npm run db:start
```

**Option B: Docker Compose**
```bash
docker compose up -d
```
*(If using Docker Compose on default port 5432, update `DATABASE_URL` in `.env` to port `5432`)*

### 4. Database Setup & Seeding
Synchronize schema and seed realistic exercises, a demo user, and workout routines:
```bash
# Push schema to database
npm run db:push

# Seed default exercise catalog and demo data
npm run db:seed
```

Demo user credentials:
- **Email**: `demo@jim.app`
- **Password**: `Password123!`

### 5. Start the Application
```bash
# Development watch mode
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```
The server will start at `http://localhost:3000/api/v1`.
Explore and test the endpoints via Swagger UI at **`http://localhost:3000/api/docs`**.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run end-to-end integration tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

---

## 🗺️ API Reference

### Authentication & Profile (`/api/v1`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user and initialize profile | No |
| `POST` | `/auth/login` | Authenticate and obtain JWT Bearer token | No |
| `GET` | `/auth/me` | Fetch authenticated user identity | Yes |
| `GET` | `/profile` | Fetch user profile & unit preferences | Yes |
| `PATCH` | `/profile` | Update profile (weightUnit, lengthUnit, timezone, etc.) | Yes |

### Exercises (`/api/v1/exercises`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/exercises` | List exercises with filtering & pagination | Yes |
| `GET` | `/exercises/:id` | Get exercise details | Yes |
| `GET` | `/exercises/:id/history` | Historical performance log for an exercise | Yes |
| `POST` | `/exercises` | Create custom exercise | Yes |
| `PATCH` | `/exercises/:id` | Update custom exercise | Yes |
| `DELETE` | `/exercises/:id` | Delete/archive custom exercise | Yes |

### Workout Templates (`/api/v1/workout-templates`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/workout-templates` | List user's saved routines | Yes |
| `GET` | `/workout-templates/:id` | Get template with planned exercises & sets | Yes |
| `POST` | `/workout-templates` | Create a workout template | Yes |
| `PATCH` | `/workout-templates/:id` | Update a workout template | Yes |
| `DELETE` | `/workout-templates/:id` | Archive a workout template | Yes |

### Workout Sessions (`/api/v1/workouts`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/workouts` | List logged workouts with date filters | Yes |
| `GET` | `/workouts/:id` | Get workout details, sets, and volume summary | Yes |
| `POST` | `/workouts` | Record a workout session with nested sets | Yes |
| `PATCH` | `/workouts/:id` | Update workout session & sets transactionally | Yes |
| `DELETE` | `/workouts/:id` | Delete workout session (cascade delete sets) | Yes |

---

## 🔮 Roadmap & Future Phases

- **Phase 2**: Health, Wellbeing & Goals
  - Daily check-ins (`DailyCheckIn`: sleep, soreness, fatigue, mood, stress).
  - Health observations (`HealthObservation`: body weight, waist, body fat %, resting HR, steps).
  - Cardio activity logging (`CardioActivity`: running, cycling, pace, elevation, HR).
  - Goal tracking (`Goal`: strength, weight, frequency).
- **Phase 3**: Analytics & Calculation Engine
  - 1RM estimations (Brzycki / Epley formulas).
  - Volume progression & muscle group heatmaps.
  - Recovery vs volume correlation trends.
- **Phase 4**: Data Portability & Backup
  - Canonical JSON export and import with conflict resolution.
  - CSV exports for spreadsheets.
  - Full restore verification.
