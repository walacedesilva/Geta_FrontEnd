import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};

// Esta linha une a configuração do browser (com Zone.js) com a do servidor
export const config = mergeApplicationConfig(appConfig, serverConfig);
