# Errly Backend API

This directory contains the backend service for the Errly platform, built as a **Modular Monolith**.

🏠 **Global Context**: For project vision, Docker orchestration, and full-stack deployment instructions, refer to the **Root README**.

📐 **Architecture Decisions**: Detailed ADRs are documented in `backend-architecture.md`.

<p align="left">
<img src="https://img.shields.io/badge/NestJS-v11-red" alt="NestJS" />
<img src="https://img.shields.io/badge/Node.js-v22-green" alt="Node.js" />
<img src="https://img.shields.io/badge/PostgreSQL-v14.3-336791" alt="PostgreSQL" />
<img src="https://img.shields.io/badge/tests-104%20passed-brightgreen" alt="Tests" />
</p>

## 🛠️ Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Runtime | Node.js | v22 (Alpine) |
| Framework | NestJS | v11 |
| Database | PostgreSQL | v14.3 |
| ORM | TypeORM | v0.3.28 |
| Authentication | Passport + JWT | passport v0.7.0 |
| Password Hashing | bcrypt | v6.0.0 |
| Validation | class-validator | v0.14.3 |
| Test Runner | Jest | v29.5.0 |

## 🏗️ Architecture Overview

Errly follows a strict modular monolith architecture to enforce domain boundaries without the operational overhead of microservices.

### Layer Separation

```text
┌─────────────────────────────────────────────────────────┐
│                        Controllers                      │
│         HTTP routing · DTO validation · Responses       │
├─────────────────────────────────────────────────────────┤
│                         Services                        │
│     Business logic · Grouping · Permission checks       │
├─────────────────────────────────────────────────────────┤
│                       Repositories                      │
│           TypeORM · PostgreSQL · Active Record          │
└─────────────────────────────────────────────────────────┘
```

### Module Structure

```text
src/
├── modules/
│   ├── auth/              # JWT strategy, login, session
│   ├── users/             # User identity and credentials
│   ├── teams/             # Organizational groups
│   ├── team-members/      # Pivot: User ↔ Team ↔ Role
│   ├── roles/             # Role definitions (admin, developer, viewer)
│   ├── projects/          # Apps to monitor
│   ├── sdk-keys/          # Per-project ingestion credentials
│   ├── error-events/      # Individual error records
│   ├── error-groups/      # Aggregated error groups by fingerprint
│   └── dashboard/         # Stats and metrics
├── common/
│   ├── dtos/              # Shared DTOs (pagination, wrappers)
│   ├── guards/            # Global JWT guard
│   └── helpers/           # Pagination helpers
└── main.ts
```

### Data Flow: Error Ingestion

```text
Client SDK
    │
    │  POST /error-events  (public endpoint)
    ▼
SDK Key Validation ──► 400 if invalid
    │
    ▼
Save ErrorEvent
    │
    ▼
Fingerprint lookup in ErrorGroups
    │
    ├── Exists? ──► Increment occurrences + update lastSeen
    │
    └── New?    ──► Create ErrorGroup (firstSeen = now, occurrences = 1)
```

### Entity Relationships

```text
User ──< TeamMember >── Team
                │
               Role

Team ──< Project ──< SdkKey

SdkKey ──< ErrorEvent
Project ──< ErrorGroup
```

## ⚙️ Local Development

If you are developing the backend locally (outside of the root Docker Compose orchestrator), follow these steps:

1. **Database**  
Ensure you have a PostgreSQL instance running. You can spin up just the DB from the root directory:
```bash
cd ..
docker compose up db -d
cd backend
```

2. **Environment Variables**  
Copy the template to create your local `.env`:
```bash
cp .env.template .env
```
Ensure `DB_HOST` points to `localhost` (not `db`) when running via `npm run start:dev`.

3. **Install & Run**
```bash
npm install

# Watch mode for active development
npm run start:dev
```
The API will be available at http://localhost:3000.

## 📖 API Documentation

All endpoints are documented with expected request/response schemas. Authentication endpoints are marked as public — all others require a valid Bearer token.

Swagger UI is automatically generated and available at:  
👉 http://localhost:3000/api

## 🧪 Testing

The testing philosophy is: test behavior, not implementation. All tests use Jest mocks for repositories and external dependencies.

```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e
```

**Current status**: 104 tests passing across 11 suites.
