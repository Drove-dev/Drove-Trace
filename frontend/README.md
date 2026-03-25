# Errly Frontend SPA

This directory contains the Single Page Application (SPA) for the Errly platform, built with **Angular v21** following a strict **Clean Architecture** pattern.

🏠 **Global Context**: For project vision, Docker orchestration, and full-stack deployment instructions, refer to the [Root README](../README.md).

🤖 **AI Guidelines**: See [IA_CONTEXT.md](IA_CONTEXT.md) for strict AI code generation rules.

<p align="left">
<img src="https://img.shields.io/badge/Angular-v21.0.0-dd0031" alt="Angular" />
<img src="https://img.shields.io/badge/PrimeNG-v21.1.2-005b9f" alt="PrimeNG" />
<img src="https://img.shields.io/badge/TailwindCSS-v4.1.12-38bdf8" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/Vitest-v4.0.8-729b1b" alt="Vitest" />
</p>

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | Angular (Standalone) | v21.0.0 |
| **State Management** | Signals + rxResource | Native |
| **UI Components** | PrimeNG | v21.1.2 |
| **Styling Engine** | Tailwind CSS | v4.1.12 |
| **Icons** | Lucide Angular | Latest |
| **Test Runner** | Vitest | v4.0.8 |
| **Language** | TypeScript | v5.9.2 Strict |

---

## 🏗️ Architecture & Folder Structure

The frontend strictly enforces Clean Architecture through four isolated layers. Mixing business logic inside presentation components is strictly prohibited.

**src/app/**
- `core/`: 🧠 Global logic: Interceptors, Guards, API Services.
- `store/`: 📦 Single Source of Truth: Reactive State via Signals.
- `features/`: 🧩 Smart Components: Lazy-loaded pages, invokes Store.
- `shared/`: 🎨 Dumb Components: Reusable UI, receives inputs, emits outputs.

---

## 💡 State Management Philosophy: Signals Over Observables

We embrace the modern Angular reactive model:

- **No NgRx**: We avoid the boilerplate of traditional Redux patterns.
- **Signals**: Local and global state is managed using `signal` and `computed`.
- **rxResource**: Asynchronous API calls and data streams are transformed into reactive signals using `rxResource` from `@angular/core/rxjs-interop`.
- **Change Detection**: `ChangeDetectionStrategy.OnPush` is strictly used across all components.

---

## ⚙️ Local Development

If you are developing the frontend locally (outside of the root Docker Compose orchestrator), you must have the backend API running.

### 1. Start the Backend API
From the root directory, start the DB and backend:
```bash
cd ..
docker compose up db backend -d
cd frontend
```

### 2. Environment Setup
The frontend needs to know where the API lives. In development mode, it defaults to the local backend port. Ensure your `src/environments/environment.ts` looks like this:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // NOTE: If using the root orchestrator, use the network's address instead.
};
```

### 3. Install & Run
```bash
npm install

# Start the Angular development server
npm run start
```
The UI will be available at: [http://localhost:4200](http://localhost:4200)

---

## 🧪 Testing

We have fully deprecated Karma and Jasmine in favor of the modern, lightning-fast **Vitest** runner.

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage
```

---

## 📏 Code Conventions & Quality

To maintain a pristine codebase, all contributions must adhere to the following rules:

- **Strict Typing**: The use of `any` is strictly prohibited. Use generic interfaces from `core/models/` that match backend responses exactly.
- **Standalone Only**: No NgModules. Every component, pipe, and directive must be standalone.
- **Naming Conventions**:
  - Components: `feature-name.component.ts`
  - Stores: `domain.store.ts`
  - Models: `domain.model.ts`
- **Forms**: Use `ReactiveFormsModule` exclusively. No template-driven forms.
