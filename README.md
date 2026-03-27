<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo_dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/logo_light.svg">
  <img alt="DROVE TRACE Logo" src="assets/logo_light.svg" width="220">
</picture>
</p>

<h3 align="center">Self-hosted error monitoring platform for developers who don't need enterprise complexity.</h3>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1--beta-blue" alt="Version" />
  <img src="https://img.shields.io/badge/tests-104%20passed-brightgreen" alt="Tests" />
  <img src="https://img.shields.io/badge/Angular-v21-dd0031" alt="Angular" />
  <img src="https://img.shields.io/badge/NestJS-v11-red" alt="NestJS" />
  <img src="https://img.shields.io/badge/Docker-Orchestrated-2496ed" alt="Docker" />
  <img src="https://img.shields.io/badge/PostgreSQL-v14.3-336791" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/license-MIT-lightgrey" alt="License" />
</p>

## 💡 What is DROVE TRACE?

DROVE TRACE is an open-source, self-hosted error monitoring platform. It was born from a clear need: current market tools are incredibly powerful, but often overkill, expensive, and complex to maintain for freelancers, junior developers, or small teams.

DROVE TRACE offers the essentials without the friction:

- 🚫 **No Kafka, Redis, or complex microservices**: Built as a clean, Modular Monolith.
- 🐳 **Optimized Developer Experience (DX)**: The entire ecosystem (UI, API, and Database) spins up with a single Docker command.
- 🔒 **Total Privacy**: Being self-hosted, your applications' data and errors never leave your infrastructure.

### End-to-End Flow
**Register** → **Create Team & Project** → **Generate SDK Key** → **Ingest Error** → **View on Dashboard**

## 🏗️ Architecture & Tech Stack

This repository is a Monorepo that consolidates the frontend and backend, ensuring the product's state advances uniformly and simplifying local deployment.

### Backend (`/backend`)
Built as a Modular Monolith using NestJS. This provides clear domain boundaries while keeping the system simple to run, debug, and deploy.

- **Framework**: NestJS v11 + Node.js v22.
- **Database**: PostgreSQL 14.3 managed with TypeORM.
- **Security**: JWT Authentication with strict role-based Guards.
- **Testing**: Jest. The philosophy is: test behavior, not implementation. Currently boasting 104 passing unit tests across 11 suites.
- **Intentional Omissions**: For this MVP scale, caching (Redis) and message queues (RabbitMQ/Kafka) are intentionally omitted to keep infrastructure complexity at absolute zero. Error ingestion is synchronous.

### Frontend (`/frontend`)
Built with a strict Clean Architecture pattern separating logic into four distinct layers: Core (API/Services), Store (State), Features (Smart Components), and Shared (Dumb Components).

- **Framework**: Angular v21 (Strictly Standalone Components).
- **State Management**: Modern reactive state using Angular Signals and `rxResource`. NgRx is strictly prohibited by design.
- **UI & Styles**: PrimeNG v21 + TailwindCSS v4 with a deep, native Dark Mode design.
- **Testing**: Vitest v4 (Karma/Jasmine are fully deprecated).
- **Typing**: TypeScript Strict Mode. The use of `any` is strictly prohibited.

## 🚀 Installation & Quick Start

DROVE TRACE's priority is a frictionless deployment experience. You don't need to configure Node, Angular, or NestJS on your local machine.

**Prerequisites**: You only need Docker installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/drove-trace.git
   cd drove-trace
   ```

2. **Configure environment variables**:
   Copy the example file to generate your master `.env`.
   ```bash
   cp .env.example .env
   ```
   *(The default credentials in `.env.example` are sufficient for a local development environment).*

3. **Spin up the platform**:
   Run the master orchestrator. Docker will build the images and boot the database, backend, and frontend connected under the same network.
   ```bash
   docker compose up -d --build
   ```

**You're all set!**
- 🖥️ **Dashboard UI**: [http://localhost:4200](http://localhost:4200)
- ⚙️ **REST API**: [http://localhost:3000/api](http://localhost:3000/api)
- 📖 **Swagger Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 📂 Monorepo Structure

```text
/drove_trace
  ├── /docs                  # Architectural Decision Records (ADRs)
  ├── /backend               # NestJS API source code (Modular Monolith)
  ├── /frontend              # Angular v21 SPA source code (Clean Architecture)
  ├── docker-compose.yml     # Master orchestrator for Self-Hosting
  ├── .env.example           # Centralized environment variables
  ├── AUTHORS.md             # Project authorship
  ├── LICENSE                # MIT License
  └── README.md              # Global documentation (You are here)
```

## 📌 Project Status & Features

DROVE TRACE is currently in **Beta (v0.0.1)**.

### Current Capabilities:
- **Full CRUD** for Users, Teams, Projects, SDK Keys, Roles, and Team Members.
- **Error ingestion** and automatic grouping via cryptographic fingerprinting.
- **Real-time statistics dashboard** (Global and per-user).
- **Swagger / OpenAPI** documentation automatically generated.

### Upcoming Roadmap:
- Official SDK packages for Angular and React.
- Webhook alerts integration (Email / Slack) on new error groups.
- GitHub Actions CI/CD pipeline.

## 🛠️ Contributing

DROVE TRACE actively welcomes feedback and contributions.

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feat/your-feature`
3. **Commit using Conventional Commits**: `git commit -m "feat(frontend): add dark mode toggle"`
4. **Push and open a Pull Request against main.**

*Please follow existing code style — ESLint, Prettier, and TypeScript Strict Mode are enforced.*

## 🤝 Authorship & License

Architected and developed by **DROVE.dev**.

✉️ **Contact**: hello@drove.dev

Licensed under the **MIT License** — See [LICENSE](LICENSE) for details. Feel free to use, audit, and contribute.
