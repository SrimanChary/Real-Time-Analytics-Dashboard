# 📊 Real-Time Analytics Dashboard

> Enterprise-grade analytics platform built with **Angular 17** + **Spring Boot 3** + **WebSocket** + **PostgreSQL** + **Redis**. Fully deployable on free-tier cloud services.

[![Build Status](https://github.com/YOUR_USERNAME/analytics-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/analytics-dashboard/actions)

---

## ✨ Features

| Feature | Tech |
|---|---|
| Real-time KPI updates | STOMP WebSocket + RxJS |
| JWT Authentication | Spring Security + jjwt |
| Role-Based Access | `ROLE_USER` / `ROLE_ADMIN` |
| REST API with Swagger | SpringDoc OpenAPI 3 |
| Time-series charts | Chart.js + ng2-charts |
| Redis caching | Spring Cache + Upstash |
| DB migrations | Flyway |
| CI/CD pipeline | GitHub Actions |
| Containerised | Docker + docker-compose |
| Free deployment | Render + Vercel + Supabase |

---

## 🗂 Project Structure

```
analytics-dashboard/
├── backend/          ← Spring Boot 3 (Java 21)
│   ├── src/main/java/com/analytics/
│   │   ├── config/       SecurityConfig, WebSocketConfig, SwaggerConfig
│   │   ├── controller/   AuthController, AnalyticsController, WebSocketController
│   │   ├── service/      AuthService, AnalyticsService, JwtService
│   │   ├── repository/   UserRepository, EventRepository, MetricsRepository
│   │   ├── model/        User, Event, Metric entities + DTOs
│   │   └── security/     JwtAuthFilter
│   └── src/main/resources/db/migration/V1__init_schema.sql
│
├── frontend/         ← Angular 17 (standalone components)
│   └── src/app/
│       ├── core/     AuthService, AnalyticsService, WebSocketService, guards, interceptors
│       ├── features/ dashboard/, analytics/, reports/, auth/login/
│       └── shared/   NavbarComponent
│
├── .github/workflows/deploy.yml   ← GitHub Actions CI/CD
├── docker-compose.yml             ← Local full-stack
└── README.md
```

---

## 🚀 Quick Start (Local Dev)

### Option A — Docker Compose (recommended, one command)

```bash
git clone https://github.com/YOUR_USERNAME/analytics-dashboard.git
cd analytics-dashboard
docker-compose up --build
```

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:4200 |
| Backend   | http://localhost:8080 |
| Swagger   | http://localhost:8080/swagger-ui.html |

---

### Option B — Run services individually

**Prerequisites:** Java 21, Node 20, PostgreSQL 16, Redis 7

**1. Start the database**
```bash
# Using Docker just for the DB
docker run -d \
  --name analytics-db \
  -e POSTGRES_DB=analytics_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name analytics-redis -p 6379:6379 redis:7-alpine
```

**2. Start Spring Boot backend**
```bash
cd backend
./mvnw spring-boot:run
# API runs on http://localhost:8080
# Flyway migrates + seeds demo data automatically
```

**3. Start Angular frontend**
```bash
cd frontend
npm install --legacy-peer-deps
npm start
# App runs on http://localhost:4200 (proxies /api → :8080)
```

---

## 🔑 Default Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `Admin@123` |
| User  | `demo`   | `Demo@123`  |

Or click **"Fill demo credentials"** on the login page.

---

## 🌐 API Reference

Full interactive docs at **`/swagger-ui.html`** after starting the backend.

### Auth
```http
POST /api/v1/auth/register    Register a new user
POST /api/v1/auth/login       Login → returns JWT token
GET  /api/v1/auth/me          Get current user (requires JWT)
```

### Analytics
```http
GET  /api/v1/analytics/kpis                 KPI summary (7-day default)
GET  /api/v1/analytics/metrics/timeseries   Time-series for a metric key
GET  /api/v1/analytics/events/breakdown     Event counts by type
POST /api/v1/analytics/events               Ingest event + broadcast via WS
```

### WebSocket Topics (STOMP)
```
SUBSCRIBE /topic/kpis          KPI snapshot every 5s
SUBSCRIBE /topic/events        New event on every ingest
SUBSCRIBE /topic/metrics       Live metric point every 8s
SUBSCRIBE /topic/event-count   Event count every 10s
```

---

## ☁️ Free Deployment Guide

### 1. Database — Supabase (free 500 MB)
1. Create project at https://supabase.com
2. Copy **Connection String** (URI format) → use as `DATABASE_URL`

### 2. Cache — Upstash Redis (free 10k req/day)
1. Create database at https://upstash.com
2. Copy **Redis URL** → use as `REDIS_URL`

### 3. Backend — Render.com (free web service)
1. New → Web Service → connect your GitHub repo
2. **Root Directory:** `backend`
3. **Build Command:** `./mvnw clean package -DskipTests`
4. **Start Command:** `java -jar target/*.jar`
5. Add environment variables:

```
DATABASE_URL      = jdbc:postgresql://db.xxx.supabase.co:5432/postgres
DB_USER           = postgres.xxx
DB_PASS           = <supabase-password>
REDIS_URL         = rediss://default:xxx@xxx.upstash.io:6379
JWT_SECRET        = <run: node -e "console.log(require('crypto').randomBytes(64).toString('base64'))">
SPRING_PROFILES_ACTIVE = prod
```

> **Tip:** Add a free cron job at https://cron-job.org to ping `https://your-app.onrender.com/actuator/health` every 14 minutes — keeps the free instance warm.

### 4. Frontend — Vercel (free)
1. Import repo at https://vercel.com
2. **Framework:** Angular
3. **Build Command:** `npm run build:prod`
4. **Output Directory:** `dist/analytics-dashboard/browser`
5. Add environment variable:
   - `NG_APP_API_BASE_URL` = `https://your-api.onrender.com/api`

### 5. GitHub Actions Secrets
Go to repo **Settings → Secrets → Actions** and add:

```
RENDER_API_KEY       (from render.com → Account Settings)
RENDER_SERVICE_ID    (from service URL: srv-xxxxx)
VERCEL_TOKEN         (from vercel.com → Settings → Tokens)
VERCEL_ORG_ID        (from .vercel/project.json)
VERCEL_PROJECT_ID    (from .vercel/project.json)
```

---

## 🧪 Running Tests

```bash
# Backend
cd backend && ./mvnw test

# Frontend
cd frontend && npm test -- --watch=false
```

---

## 🛠 Tech Stack

**Backend**
- Java 21 + Spring Boot 3.2
- Spring Security (JWT stateless)
- Spring WebSocket + STOMP
- Spring Data JPA + Hibernate
- Flyway (DB migrations)
- Spring Cache + Redis
- SpringDoc OpenAPI 3 (Swagger UI)
- Lombok

**Frontend**
- Angular 17 (standalone components, signals)
- Angular Material
- @stomp/stompjs + SockJS
- Chart.js + ng2-charts
- RxJS 7

**Infrastructure**
- PostgreSQL 16
- Redis 7
- Docker + docker-compose
- GitHub Actions CI/CD
- Render (backend) + Vercel (frontend) + Supabase (DB)

---

## 📸 Screenshots

> After running locally, visit http://localhost:4200

- **Login** — split-panel with feature highlights + demo credential fill button
- **Dashboard** — 4 KPI cards + live line chart + doughnut breakdown + event feed
- **Analytics** — Bar chart with metric/range selector + sortable data table
- **Reports** — Event breakdown table + CSV export + live event ingestion

---

## 📄 License

MIT — free to use for portfolios, interviews, and production.
