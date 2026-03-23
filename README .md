# Analytics Dashboard

A full-stack real-time analytics platform I built to learn and demonstrate production-level development with Angular and Spring Boot.

The idea was simple — build something that actually works in production, not just a todo app. So I went with a real-time dashboard that ingests events, shows live KPIs via WebSocket, and has proper JWT auth with role-based access.

**Live demo:** https://your-app.vercel.app  
**API docs:** https://your-api.onrender.com/swagger-ui.html

---

## What it does

- Users log in with JWT authentication
- Dashboard shows live KPIs that update every 5 seconds via WebSocket (no page refresh)
- You can ingest analytics events via the REST API and watch them appear on the dashboard in real time
- Charts show time-series data for different metrics (page views, active users, revenue)
- Reports page lets you export data as CSV
- Admin users can access protected endpoints, regular users can't

---

## Tech stack

**Frontend**
- Angular 17 with standalone components and signals (no NgModules)
- Angular Material for UI components
- Chart.js for charts
- STOMP.js + SockJS for WebSocket connection
- RxJS for reactive state management

**Backend**
- Spring Boot 3 with Java 17
- Spring Security with stateless JWT auth
- Spring WebSocket with STOMP protocol
- Spring Data JPA + Hibernate
- Flyway for database migrations
- Redis for caching KPI queries
- SpringDoc for Swagger UI

**Database & infrastructure**
- PostgreSQL (Supabase free tier in production)
- Redis (Upstash free tier in production)
- Docker + docker-compose for local dev
- GitHub Actions for CI/CD
- Render.com for backend hosting
- Vercel for frontend hosting

---

## Running locally

You need Java 17+, Node 20+, PostgreSQL, and Redis installed.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/analytics-dashboard.git
cd analytics-dashboard
```

**Start the database and Redis**
```bash
brew services start postgresql@17
brew services start redis
createdb analytics_db
```

**Start the backend**
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
# Flyway runs migrations and seeds demo data automatically
```

**Start the frontend**
```bash
cd frontend
npm install --legacy-peer-deps
npm start
# Runs on http://localhost:4200
```

Or just use Docker:
```bash
docker compose up --build
```

---

## Project structure

```
analytics-dashboard/
├── backend/
│   └── src/main/java/com/analytics/
│       ├── config/         Spring Security, WebSocket, Swagger config
│       ├── controller/     REST controllers + WebSocket handlers
│       ├── service/        Business logic
│       ├── repository/     JPA repositories
│       ├── model/          Entities and DTOs
│       └── security/       JWT filter
│
├── frontend/
│   └── src/app/
│       ├── core/           Auth service, WebSocket service, interceptors
│       ├── features/       Dashboard, Analytics, Reports, Login pages
│       └── shared/         Navbar
│
└── .github/workflows/      CI/CD pipeline
```

---

## API endpoints

```
POST /api/v1/auth/register          Create account
POST /api/v1/auth/login             Login, get JWT token
GET  /api/v1/auth/me                Get current user

GET  /api/v1/analytics/kpis                  KPI summary
GET  /api/v1/analytics/metrics/timeseries    Time-series data
GET  /api/v1/analytics/events/breakdown      Events by type
POST /api/v1/analytics/events                Ingest new event
```

WebSocket topics (subscribe after connecting to `/ws`):
```
/topic/kpis          live KPI snapshot every 5s
/topic/events        fires on every new event ingested
/topic/metrics       live metric point every 8s
```

Full interactive docs at `/swagger-ui.html` — you can call every endpoint directly from the browser with JWT auth.

---

## Deployment

The app runs entirely on free tiers:

| Service | What it hosts | Free tier |
|---------|--------------|-----------|
| Render.com | Spring Boot API | 750 hrs/month |
| Vercel | Angular frontend | Unlimited |
| Supabase | PostgreSQL | 500 MB |
| Upstash | Redis | 10k req/day |

The GitHub Actions pipeline runs tests on every push and deploys to Render + Vercel automatically when you merge to main.

One thing to know about Render's free tier — it spins down after 15 minutes of inactivity. I have a cron job on cron-job.org pinging `/actuator/health` every 14 minutes to keep it warm.

---

## Default credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | ROLE_ADMIN |
| demo | Admin@123 | ROLE_USER |

---

## What I learned building this

Setting up Spring WebSocket with STOMP was trickier than I expected — especially getting the JWT handshake working since WebSocket connections don't send headers the same way HTTP requests do. Ended up passing the token in the STOMP connect headers instead.

Flyway was also new to me. Having migrations version-controlled means the database schema evolves alongside the code, which makes deployments much cleaner than relying on Hibernate's `ddl-auto`.

On the Angular side, the new signals API in Angular 17 is genuinely better than `BehaviorSubject` for local component state. The `signal()` + `computed()` pattern is a lot more intuitive once you get used to it.
