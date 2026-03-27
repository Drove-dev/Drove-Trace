# 🧠 AI DEVELOPMENT CONTEXT: ERROR MONITOR FRONTEND

## 1. 🏗️ CORE ARCHITECTURE (Clean Architecture - Angular Standalone)

This project follows a strictly separated layer architecture. **FORBIDDEN** to mix business logic in presentation components.

- **`src/app/core/`**: Global singletons. Guards, Interceptors, and especially **Services** (direct communication with API).
- **`src/app/store/`**: Single source of truth. Reactive state management using **Angular Signals** and **rxResource**.
- **`src/app/features/`**: Smart Components (Pages with Lazy Loading). They invoke the Store.
- **`src/app/shared/`**: Dumb Components (Reusable UI). They only receive @Input (preferably signals) and emit @Output.

## 2. 🛠️ TECHNOLOGY STACK (Critical Versions)

_If the official documentation version differs from these, prioritize these:_

- **Framework:** Angular v21.0.0 (Standalone Components ONLY).
- **State Management:** Angular Signals (`signal`, `computed`) + `rxResource` (rxjs-interop). **DO NOT use NgRx**.
- **UI Framework:** PrimeNG v21.1.2 + @primeuix/themes v2.0.3.
- **Styles:** TailwindCSS v4.1.12 (Modern Engine).
- **Icons:** Lucide Angular.
- **Testing:** Vitest v4.0.8 (No Karma/Jasmine).
- **TypeScript:** v5.9.2 (Strict Mode ON).

## 3. 🚦 STATE PATTERNS AND DATA FLOW

For any new functionality, the flow MUST be:

1. **Service (`core/`)**: Define the HTTP method (Observable).
2. **Store (`store/`)**:
   - Define a `StoreAction` (IDLE, LOADING_PAGE, SEARCHING, etc.).
   - Use `rxResource` to wrap the Service call.
   - Expose Signals for the UI to react.
3. **Smart Component (`features/`)**: Inject the Store and read the Signals.
4. **Dumb Component (`shared/`)**: Receives the raw data and emits user events.

## 4. 📝 CODE CONVENTIONS & QUALITY

- **Signals Over Observables:** Use `toSignal` or `rxResource` to transform asynchronous streams into reactive states for the UI.
- **Typing:** Use of `any` is forbidden. If a type is `WritableSignal<T>`, do not attempt to assign it directly to `T`.
- **Forms:** Use `ReactiveFormsModule`. Always verify the existence of properties like `valid` or `errors` using safe navigation or prior checks.
- **Naming:** - Components: `kebab-case.component.ts`
  - Stores: `domain.store.ts`
  - Interfaces: `domain.model.ts`

## 5. ⚠️ AVOIDING COMMON ERRORS (Lessons Learned)

- **Data Binding:** Do not assume a child component will detect changes if you don't use Signals or `ChangeDetectionStrategy.OnPush`.
- **Type Inconsistency:** Ensure that interfaces in `core/models` exactly match the Backend response.
- **Tailwind v4:** Use the new v4 directives; do not mix old v3 configurations if they cause compilation conflicts.

## 6. 🚀 INSTRUCTION FOR THE IA

> "Act as a Senior Angular Developer expert in Signals. Before generating code, verify the layer where it should reside (Core, Store, Feature or Shared). Always use Standalone Components and prioritize `rxResource` for asynchronous data management. If you are going to modify a component in `shared/`, make sure not to break its type contract."

