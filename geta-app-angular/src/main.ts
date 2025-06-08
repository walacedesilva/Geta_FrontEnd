import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // (CORREÇÃO) Importar AppComponent em vez de App

/**
 * Ponto de entrada da aplicação.
 * A aplicação é inicializada com o AppComponent e as configurações definidas em app.config.ts.
 */
bootstrapApplication(AppComponent, appConfig) // (CORREÇÃO) Usar AppComponent
  .catch((err) => console.error(err));

