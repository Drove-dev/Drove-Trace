
<div style="text-align:center;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100" width="220" height="100">
  <!-- Icon -->
  <g transform="translate(10, 10)">
    <circle cx="40" cy="40" r="36" fill="none" stroke="#fff" stroke-width="2.5"/>
    <polyline points="12,40 23,40 29,22 36,57 43,30 49,50 55,40 68,40"
      fill="none" stroke="#fff" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="40" cy="40" r="3.5" fill="#DD0031"/>
  </g>
  <!-- Errly text -->
  <g transform="translate(102, 28)">
    <text x="0" y="28" font-family="'Segoe UI', system-ui, sans-serif" font-size="30" font-weight="800" fill="#fff" letter-spacing="-1">Err</text>
    <text x="41" y="28" font-family="'Segoe UI', system-ui, sans-serif" font-size="30" font-weight="800" fill="#DD0031" letter-spacing="-1">ly</text>
  </g>
  </svg>

</div>

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
