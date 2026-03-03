<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/assets/images/logo/Logo_Horizontal_Dark_Mode.svg">
    <source media="(prefers-color-scheme: light)" srcset="public/assets/images/logo/Logo_Horizontal_Light.svg">
    <img alt="Errly Logo" src="public/assets/images/logo/Logo_Horizontal_Light.svg" width="220">
  </picture>
</p>


# Error Monitor Platform

A real-time error monitoring platform that allows you to register, visualize, and manage application errors from a centralized dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21, Tailwind v4, Lucide Angular |
| State Management | Signals (`signal`, `computed`, `effect`, `resource`) |
| Forms | Signal Forms (`@angular/forms/signals`) |
| Backend | NestJS |
| Database | PostgreSQL |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
error-monitor/
├── frontend/          # Angular application
├── backend/           # NestJS API
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

- Node.js >= 22
- Docker & Docker Compose
- Angular CLI >= 21

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
ng serve
```

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### With Docker

```bash
docker-compose up --build
```

---

## Environment Variables

Environment configuration is handled inside the `src/environments/` folder.

```
frontend/
└── src/
    └── environments/
        ├── environment.ts          # Development
        └── environment.prod.ts     # Production
```

Update the values in those files before running the application. Do **not** commit sensitive credentials to version control.

---

## Features

- [ ] Authentication (login / forgot password)
- [ ] Dashboard with metric cards
- [ ] User management
- [ ] Error reports list
- [ ] Settings
- [ ] Light / Dark theme toggle

---

## CI/CD

> Pending — will be configured with GitHub Actions.

---

## License

MIT
