<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo_light.svg">
    <img alt="Errly Logo" src="assets/logo_light.svg" width="220">
  </picture>
</p>

<h3 align="center">Self-hosteable error monitoring for developers who don't need enterprise complexity.</h3>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1--beta-blue" alt="Version" />
  <img src="https://img.shields.io/badge/tests-104%20passed-brightgreen" alt="Tests" />
  <img src="https://img.shields.io/badge/license-MIT-lightgrey" alt="License" />
  <img src="https://img.shields.io/badge/status-early%20access-orange" alt="Status" />
  <img src="https://img.shields.io/badge/NestJS-v11-red" alt="NestJS" />
  <img src="https://img.shields.io/badge/Node.js-v22-green" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-v14.3-336791" alt="PostgreSQL" />
</p>

---

## What is Errly?

Errly is an **open-source, self-hosteable error monitoring platform** built for developers who want real visibility into their application errors — without complex infrastructure, without event quotas, and without depending on an external service to hold their data.

Capture errors from your frontend or backend apps via a lightweight SDK, group them automatically by fingerprint, and track them from a centralized dashboard — all running on your own infrastructure with a single `docker-compose up`.

> **Early Access** — Core functionality works end-to-end. Actively iterating with real feedback. See the [Roadmap](#roadmap) for what's coming next.

---

## Why Errly?

Most error monitoring tools were designed to scale to thousands of users across large organizations. That's great — but it comes with trade-offs that hurt smaller projects:

- **They charge per event.** A single bug in a loop can exhaust a monthly quota in minutes.
- **They're complex to self-host.** Running your own instance often means orchestrating five or more services just to get started.
- **They're noisy.** Feature-heavy dashboards built for enterprise teams get in the way when all you need is to know what broke and where.

Errly takes a different approach. It's designed from the ground up for developers working solo or in small teams who need error visibility from day one — simple to deploy, simple to understand, and fully under your control.

|                         | Typical monitoring tools          | Errly                      |
| ----------------------- | --------------------------------- | -------------------------- |
| Pricing model           | Per event / per seat              | Free to self-host          |
| Self-hosting complexity | High (multiple services required) | Single `docker-compose up` |
| Data ownership          | Third-party servers               | Your own infrastructure    |
| Target audience         | Enterprise teams                  | Developers & small teams   |
| Setup time              | Hours                             | Minutes                    |

---

## Features

- **JWT Authentication** — Secure signup, login, and token-based session management
- **Team & Project Management** — Multi-team, multi-project structure out of the box
- **SDK Key Generation** — Per-project keys to authorize error ingestion from client apps
- **Error Ingestion** — Public endpoint for receiving error events from any SDK
- **Fingerprint Grouping** — Automatic aggregation of identical errors into `ErrorGroups` with occurrence tracking (`firstSeen`, `lastSeen`, `occurrences`)
- **Dashboard Stats** — Global and per-user error statistics
- **Role-based Access** — Admin, Developer, and Viewer roles via `TeamMember` pivot entity
- **Swagger UI** — Auto-generated API documentation at `/api`
- **Rate Limiting** — Global throttling to protect the ingestion endpoint
- **Docker Ready** — Full `docker-compose` setup for zero-friction deployment

---

## Tech Stack

| Layer            | Technology      | Version         |
| ---------------- | --------------- | --------------- |
| Runtime          | Node.js         | v22 (Alpine)    |
| Framework        | NestJS          | v11             |
| Database         | PostgreSQL      | v14.3           |
| ORM              | TypeORM         | v0.3.28         |
| Authentication   | Passport + JWT  | passport v0.7.0 |
| Password hashing | bcrypt          | v6.0.0          |
| Validation       | class-validator | v0.14.3         |
| DB Driver        | pg              | v8.18.0         |
| ID generation    | uuid            | v13.0.0         |
| Containerization | Docker          | v28.5.1         |

---

## Architecture

Errly follows a **modular monolith** architecture with strict layer separation:

```
┌─────────────────────────────────────────────────────────┐
│                        Controllers                       │
│         HTTP routing · DTO validation · Responses        │
├─────────────────────────────────────────────────────────┤
│                         Services                         │
│     Business logic · Grouping · Permission checks        │
├─────────────────────────────────────────────────────────┤
│                       Repositories                       │
│           TypeORM · PostgreSQL · Active Record           │
└─────────────────────────────────────────────────────────┘
```

### Module structure

```
src/
├── modules/
│   ├── auth/              # JWT strategy, login, session
│   ├── users/             # User identity and credentials
│   ├── teams/             # Organizational groups
│   ├── team-members/      # Pivot: User ↔ Team ↔ Role
│   ├── roles/             # Role definitions (admin, developer, viewer)
│   ├── projects/          # Apps to monitor (dev / staging / production)
│   ├── sdk-keys/          # Per-project ingestion credentials
│   ├── error-events/      # Individual error records
│   ├── error-groups/      # Aggregated error groups by fingerprint
│   └── dashboard/         # Stats and metrics
├── common/
│   ├── dtos/              # Shared DTOs (pagination, response wrappers)
│   ├── guards/            # Global JWT guard
│   └── helpers/           # Pagination helper
└── main.ts
```

### Error ingestion flow

```
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

### Entity relationships

```
User ──< TeamMember >── Team
                │
               Role

Team ──< Project ──< SdkKey

SdkKey ──< ErrorEvent
Project ──< ErrorGroup
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker >= 28 & Docker Compose
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/errly-backend.git
cd errly-backend
```

### 2. Configure environment variables

```bash
cp .env.template .env
```

Edit `.env` with your values:

```env
DB_PASSWORD=mysecretpassword
DB_NAME=errly_db
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
PORT=3000
HOST_API=http://localhost:3000/api
JWT_SECRET=your-super-secret-key
```

### 3. Start the database

```bash
docker-compose up -d
```

### 4. Install dependencies and run

```bash
npm install
npm run start:dev
```

The API will be available at `http://localhost:3000`.  
Swagger UI at `http://localhost:3000/api`.

### Run with full Docker (optional)

```bash
docker-compose up --build
```

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api
```

All endpoints are documented with expected request/response schemas. Authentication endpoints are marked as public — all others require a valid Bearer token.

---

## Testing

```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e
```

Current test status:

| Suites | Tests | Status         |
| ------ | ----- | -------------- |
| 11     | 104   | ✅ All passing |

---

## Roadmap

### ✅ Done — Core infrastructure

- JWT authentication (register, login, token refresh)
- Team, project, and SDK key management (full CRUD)
- Error event ingestion via public endpoint
- Automatic fingerprint-based error grouping
- Dashboard stats (global and per-user)
- Docker & Docker Compose setup
- 104 unit tests passing

### ◐ In progress — MVP

- Angular frontend consuming this API
- JavaScript SDK (basic error capture)
- End-to-end flow: register → project → SDK key → error → dashboard

### ○ Post-MVP

- SDK packages for Angular and React
- Email / Slack notifications on new error groups
- Advanced user and role management
- GitHub Actions CI/CD pipeline
- Public demo instance

---

## Contributing

Errly is in early access and actively welcoming feedback and contributions.

### Reporting bugs

Open an issue with:

- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment (Node version, OS, Docker version)

### Submitting changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with a clear message: `git commit -m "feat: add notification support"`
4. Push and open a Pull Request against `main`

Please follow existing code style — ESLint and Prettier are configured and enforced.

---

## Changelog

### v0.0.1-beta _(current)_

- Initial release of core backend
- Full CRUD for users, teams, projects, SDK keys, roles and team members
- Error ingestion and automatic fingerprint-based grouping
- Dashboard stats endpoint (global and per-user)
- JWT authentication with role-based guards
- Swagger / OpenAPI documentation
- Docker Compose setup
- 104 unit tests passing across 11 suites

---

## License

MIT — see [LICENSE](docs/LICENSE.md) for details.

## Authors

See [AUTHORS](docs/AUTHORS.md) for project ownership.

---

<p align="center">
  Built with focus on simplicity. No Kafka required.
</p>
