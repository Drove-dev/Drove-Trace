<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgMTAwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjIyMCIgaGVpZ2h0PSIxMDAiIGZpbGw9Im5vbmUiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwgMTApIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjhmYWZjIiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwb2x5bGluZSBwb2ludHM9IjEyLDQwIDIzLDQwIDI5LDIyIDM2LDU3IDQzLDMwIDQ5LDUwIDU1LDQwIDY4LDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmOGZhZmMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzLjUiIGZpbGw9IiNERDAwMzEiLz48L2c+PHRleHQgeD0iMTAyIiB5PSI1OCIgZm9udC1mYW1pbHk9ImFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmb250LXdlaWdodD0iODAwIiBmaWxsPSIjZjhmYWZjIiBsZXR0ZXItc3BhY2luZz0iLTEiPkVycjx0c3BhbiBmaWxsPSIjREQwMDMxIj5seTwvdHNwYW4+PC90ZXh0Pjwvc3ZnPg==">
    
    <img alt="Errly Logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMjAgMTAwIiB3aWR0aD0iMjIwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjIyMCIgaGVpZ2h0PSIxMDAiIGZpbGw9Im5vbmUiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMCwgMTApIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMGYxNzJhIiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwb2x5bGluZSBwb2ludHM9IjEyLDQwIDIzLDQwIDI5LDIyIDM2LDU3IDQzLDMwIDQ5LDUwIDU1LDQwIDY4LDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwZjE3MmEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzLjUiIGZpbGw9IiNERDAwMzEiLz48L2c+PHRleHQgeD0iMTAyIiB5PSI1OCIgZm9udC1mYW1pbHk9ImFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmb250LXdlaWdodD0iODAwIiBmaWxsPSIjMGYxNzJhIiBsZXR0ZXItc3BhY2luZz0iLTEiPkVycjx0c3BhbiBmaWxsPSIjREQwMDMxIj5seTwvdHNwYW4+PC90ZXh0Pjwvc3ZnPg==" width="220">
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
