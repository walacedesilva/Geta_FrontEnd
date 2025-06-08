import { Routes } from '@angular/router';
import { routes } from './app.routes';

/**
 * Rotas específicas para o ambiente de servidor (SSR).
 *
 * Estas rotas são uma fusão das rotas principais da aplicação
 * com uma rota padrão que aponta para o AppComponent. Isto ajuda
 * o servidor a saber qual componente raiz renderizar para qualquer rota.
 */
export const serverRoutes: Routes = [
  ...routes,
  // Adicionar rotas específicas do servidor aqui, se necessário no futuro.
  // Por agora, as rotas principais são suficientes.
];
