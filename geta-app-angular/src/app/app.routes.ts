import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // Importar o AuthGuard funcional

export const routes: Routes = [
  {
    // Rota para a secção de autenticação (Login/Registo)
    // Utiliza 'loadChildren' para carregar as rotas filhas de forma preguiçosa (lazy loading).
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    // Rota para a página principal (Feed)
    // Utiliza 'loadComponent' para carregar o componente standalone de forma preguiçosa.
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard] // Protege a rota, exigindo autenticação.
  },
  {
    // Rota para a página de perfil do utilizador
    // O ':id' é um parâmetro dinâmico que irá conter o ID do utilizador.
    path: 'profile/:id',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard] // Rota também protegida.
  },
  {
    // (NOVO) Rota para a futura página de chat
    path: 'chat',
    loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
    {
    // (NOVO) Rota para o chat privado, que aceita o ID do outro utilizador como parâmetro
    path: 'chat/:userId',
    loadComponent: () => import('./features/chat/private-chat.component').then(m => m.PrivateChatComponent),
    canActivate: [authGuard]
  },
  {
    // Rota padrão: redireciona o caminho vazio para '/home'.
    // Isso garante uma rota padrão para os usuários que acessam a URL raiz do aplicativo.
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    // Rota wildcard: para qualquer URL não correspondida, redireciona para '/home'.
    path: '**',
    redirectTo: '/home'
  }
];
