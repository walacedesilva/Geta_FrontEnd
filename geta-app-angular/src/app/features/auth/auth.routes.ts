import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

/**
 * Rotas para a funcionalidade de autenticação.
 * Estas rotas são carregadas de forma preguiçosa (lazy-loaded).
 */
export const AUTH_ROUTES: Routes = [
  {
    // O caminho 'auth' é definido no ficheiro de rotas principal (app.routes.ts).
    // O AuthComponent atua como um layout/wrapper para as páginas de login e registo.
    path: '',
    component: AuthComponent,
    children: [
      {
        // Rota para a página de login, acedida em /auth
        path: '',
        component: LoginComponent
      },
      {
        // Rota para a página de registo, acedida em /auth/register
        path: 'register',
        component: RegisterComponent
      }
    ]
  }
];
