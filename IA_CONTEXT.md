# 🧠 AI DEVELOPMENT CONTEXT: ERROR MONITOR FRONTEND

## 1. 🏗️ ARQUITECTURA CORE (Clean Architecture - Angular Standalone)

Este proyecto sigue una arquitectura de capas estrictamente separadas. **PROHIBIDO** mezclar lógica de negocio en componentes de presentación.

- **`src/app/core/`**: Singletons globales. Guards, Interceptors y, sobre todo, **Services** (comunicación directa con API).
- **`src/app/store/`**: Única fuente de verdad. Manejo de estado reactivo mediante **Angular Signals** y **rxResource**.
- **`src/app/features/`**: Smart Components (Páginas con Lazy Loading). Invocan al Store.
- **`src/app/shared/`**: Dumb Components (UI Reutilizable). Solo reciben @Input (signals preferiblemente) y emiten @Output.

## 2. 🛠️ STACK TECNOLÓGICO (Versiones Críticas)

_Si la versión de la documentación oficial difiere de estas, prioriza estas:_

- **Framework:** Angular v21.0.0 (Standalone Components ONLY).
- **State Management:** Angular Signals (`signal`, `computed`) + `rxResource` (rxjs-interop). **NO usar NgRx**.
- **UI Framework:** PrimeNG v21.1.2 + @primeuix/themes v2.0.3.
- **Styles:** TailwindCSS v4.1.12 (Modern Engine).
- **Icons:** Lucide Angular.
- **Testing:** Vitest v4.0.8 (No Karma/Jasmine).
- **TypeScript:** v5.9.2 (Strict Mode ON).

## 3. 🚦 PATRONES DE ESTADO Y FLUJO DE DATOS

Para cualquier nueva funcionalidad, el flujo DEBE ser:

1. **Service (`core/`)**: Define el método HTTP (Observable).
2. **Store (`store/`)**:
   - Define un `StoreAction` (IDLE, LOADING_PAGE, SEARCHING, etc.).
   - Usa `rxResource` para envolver la llamada al Service.
   - Expone Signals para que la UI reaccione.
3. **Smart Component (`features/`)**: Inyecta el Store y lee las Signals.
4. **Dumb Component (`shared/`)**: Recibe los datos planos y emite eventos de usuario.

## 4. 📝 CONVENCIONES DE CÓDIGO & CALIDAD

- **Signals Over Observables:** Usa `toSignal` o `rxResource` para transformar flujos asíncronos en estados reactivos para la UI.
- **Typing:** Prohibido el uso de `any`. Si un tipo es `WritableSignal<T>`, no intentes asignarlo directamente a `T`.
- **Formularios:** Usa `ReactiveFormsModule`. Verifica siempre la existencia de propiedades como `valid` o `errors` mediante safe navigation o chequeos previos.
- **Naming:** - Componentes: `kebab-case.component.ts`
  - Stores: `domain.store.ts`
  - Interfaces: `domain.model.ts`

## 5. ⚠️ EVITAR ERRORES COMUNES (Lecciones Aprendidas)

- **Data Binding:** No asumas que un componente hijo detectará cambios si no usas Signals o `ChangeDetectionStrategy.OnPush`.
- **Inconsistencia de Tipos:** Asegúrate de que las interfaces en `core/models` coincidan exactamente con la respuesta del Backend.
- **Tailwind v4:** Usa las nuevas directivas de la v4; no mezcles configuraciones antiguas de la v3 si causan conflictos de compilación.

## 6. 🚀 INSTRUCCIÓN PARA LA IA

> "Actúa como un Senior Angular Developer experto en Signals. Antes de generar código, verifica la capa donde debe residir (Core, Store, Feature o Shared). Usa siempre Standalone Components y prioriza `rxResource` para la gestión de datos asíncronos. Si vas a modificar un componente en `shared/`, asegúrate de no romper su contrato de tipos."
