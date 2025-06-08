import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Ponto de entrada da aplicação.
 * A aplicação é inicializada com o AppComponent e as configurações definidas em app.config.ts.
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
