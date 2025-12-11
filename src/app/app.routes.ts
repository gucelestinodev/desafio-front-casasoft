import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'painel',
    loadComponent: () =>
      import('./pages/painel/painel.component').then(m => m.PainelComponent),
    canActivate: [() => import('./guards/auth.guard').then(g => g.authGuard)],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
