import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Corrigido: Importa o componente correto
import { config } from './app/app.config.server';

// Corrigido: Usa AppComponent para o bootstrap
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
