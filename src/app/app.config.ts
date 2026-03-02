import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tokenInterceptor } from './core/interceptors/token-interceptor';
import { AuthStore } from './store/auth/auth.store';
import { UIStore } from './store/ui/ui.store';
import { AppInitializer } from './core/init/app-initializer';
import { DashboardStore } from './store/dashboard/dashboard.store';
import { StorageSyncService } from './core/services/storage-sync';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider } from 'lucide-angular';
import { APP_ICONS } from './core/icons/icons';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([tokenInterceptor])),

    // Stores
    AuthStore,
    UIStore,
    DashboardStore,

    // Services
    StorageSyncService,  // ← Angular run the instance at startup

    // App initializer
    provideAppInitializer(() => {
        inject(StorageSyncService); // ← forces instantiation before everything else
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
  ]
};
