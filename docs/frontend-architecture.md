# Errly Frontend Architecture Decision Record

This document details the architectural principles and technical stack chosen for the Errly frontend. As a Staff Engineer, these decisions were made to prioritize **maintainability**, **developer velocity**, and **modern reactive patterns** while avoiding unnecessary complexity.

---

## 1. Architectural Pattern: Clean Architecture

The application follows a strict **Clean Architecture** implementation adapted for modern Angular. This ensures that business logic is decoupled from the UI framework and the state management layer.

### Layer Separation

The `src/app/` directory is divided into four primary, isolated layers:

- **Core (`/core`)**: The foundational layer. Contains framework-level logic, interceptors, guards, and stateless API services. This layer is responsible for the "how" of data fetching and security.
- **Store (`/store`)**: The Single Source of Truth. This layer manages the application's reactive state. It transforms raw data from the Core layer into meaningful, reactive Signal-based states.
- **Features (`/features`)**: The "Smart Components" layer. These are lazy-loaded pages that orchestrate the Store and Core layers. They are responsible for layout and high-level user interactions.
- **Shared (`/shared`)**: The "Dumb Components" layer. Contains reusable UI elements that are strictly driven by `@Input` and `@Output`. They have no knowledge of the application state or external services.

> [!IMPORTANT]
> Mixing business logic (e.g., API calls, complex calculations) inside Feature or Shared components is strictly prohibited to prevent "Fat Components" and ensure testability.

---

## 2. State Management: The Signals Revolution

We have intentionally avoided traditional Redux-style libraries (like NgRx or Akita) in favor of **Angular Signals**.

### Rationale

- **Reduced Boilerplate**: Signals eliminate the need for Actions, Reducers, and Selectors for most use cases.
- **Granular Reactivity**: Angular's new change detection engine can update only the specific parts of the DOM that depend on a changed signal, significantly improving performance.
- **rxResource Integration**: We utilize `rxResource` from `@angular/core/rxjs-interop` to bridge the gap between RxJS-based API calls and the Signal-based UI. This allows us to treat asynchronous data as a reactive resource with built-in `isLoading`, `value`, and `error` states.

---

## 3. UI Layer: PrimeNG v21 + Tailwind CSS v4

The UI is built using a hybrid approach that leverages the strengths of both a component library and a utility-first CSS framework.

### Technical Decisions

- **PrimeNG v21**: Chosen for its robust, accessible, and highly customizable UI components. We use it for complex elements like Tables, Modals, and Form Inputs.
- **Tailwind CSS v4**: Acts as the layout and micro-styling engine. It provides the flexibility needed to create a unique, premium "Dark Mode" aesthetic without the constraints of a rigid CSS framework.
- **Modern Look**: The design prioritizes a deep, native dark mode, smooth transitions, and high-quality typography (Inter/Lucide).

---

## 4. Modern Testing with Vitest

We have fully replaced the legacy Karma/Jasmine setup with **Vitest**.

### Why Vitest?

- **Speed**: Vitest is significantly faster, especially in watch mode, improving the developer feedback loop.
- **Consistency**: It uses the same configuration as our Vite-based build pipeline (via `@angular/build`), ensuring that tests run in an environment that closely matches production.
- **Developer Experience**: Modern features like snapshot testing and improved error reporting make writing and maintaining tests easier.

---

## 5. Development Strategy: Standalone & Type Safety

- **100% Standalone**: NgModules are strictly prohibited. This simplifies the dependency graph and allows for more efficient tree-shaking and faster build times.
- **TypeScript Strict Mode**: The use of `any` is a blocking error. We enforce strict typing across all layers, ensuring that the frontend models match the backend DTOs exactly.
- **Modular Monorepo**: Although structured as a monorepo, the frontend is self-contained within the `/frontend` directory, allowing it to evolve independently while benefiting from the shared Docker orchestrator.

---

## 6. Intintentional Omissions

- **NgRx Store**: Deemed too complex for an MVP. Signals provide more than enough power for the current scale.
- **Micro-frontends**: Not needed. The modular structure of standalone components and lazy-loaded routes provides sufficient isolation.
- **Custom CSS Modules**: Tailwind handles all styling needs, reducing the need for maintainable CSS files.

---

For licensing information see [LICENSE](../LICENSE.md).  
For authorship see [AUTHORS](../AUTHORS.md).

---

_Last updated: March 2026 — v0.0.1-beta_
