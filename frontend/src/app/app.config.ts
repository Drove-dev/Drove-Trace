import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/interceptors/token-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { ErrorHandlerService } from './core/errorhandler';
import { AuthStore } from './store/auth/auth.store';
import { UIStore } from './store/ui/ui.store';
import { AppInitializer } from './core/init/app-initializer';
import { DashboardStore } from './store/dashboard/dashboard.store';
import { StorageSync } from './core/services/index';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider } from 'lucide-angular';
import { APP_ICONS } from './core/icons/icons';
import { UsersStore } from './store/users/users.store';
import { ProjectsStore } from './store/projects/projects.store';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([tokenInterceptor, errorInterceptor])),

    // Error handler & toasts
    MessageService,
    ErrorHandlerService,

    // Stores
    AuthStore,
    UIStore,
    DashboardStore,
    UsersStore,
    ProjectsStore,

    // Services
    StorageSync ,  // ← Angular run the instance at startup

    // App initializer
    provideAppInitializer(() => {
        inject(StorageSync); // ← forces instantiation before everything else
        const init = inject(AppInitializer); // ← Angular will run the `run()` method at startup
        return init.run();
    }),

    // Icons
    importProvidersFrom(LucideAngularModule),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider(APP_ICONS)
    },
    providePrimeNG({
      theme: {
          preset: Aura
      }
  })
  ]
};
