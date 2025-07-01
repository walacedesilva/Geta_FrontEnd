import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,NgIf],
  template: `
<div class="flex flex-col items-center justify-center min-h-screen bg-dark-purple">
  <div class="w-full max-w-md p-8 space-y-8 bg-primary-purple rounded-xl shadow-lg">

    <div class="text-center">
        <h1 class="text-4xl font-bold text-accent-green">double to double</h1>
        <p class="mt-2 text-white">Bem-vindo de volta!</p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <div>
        <label for="email" class="text-sm font-medium text-gray-200">Email</label>
        <input id="email" type="email" formControlName="email"
               class="w-full px-4 py-2 mt-2 text-white bg-light-purple-card border border-transparent rounded-lg focus:ring-accent-green focus:border-accent-green"
               placeholder="seu@email.com">
      </div>

      <div>
        <label for="password" class="text-sm font-medium text-gray-200">Senha</label>
        <input id="password" type="password" formControlName="password"
               class="w-full px-4 py-2 mt-2 text-white bg-light-purple-card border border-transparent rounded-lg focus:ring-accent-green focus:border-accent-green"
               placeholder="Sua senha">
      </div>

      <button type="submit" [disabled]="loginForm.invalid"
              class="w-full py-3 font-semibold text-white bg-accent-orange rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange disabled:opacity-50">
        Entrar
      </button>
    </form>

    <div class="text-center">
      <p class="text-sm text-gray-300">
        Não tem uma conta?
        <a routerLink="/auth/register" class="font-medium text-accent-green hover:underline">Cadastre-se</a>
      </p>
    </div>

  </div>
</div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }
  onSubmit() {
    if (this.loginForm.invalid) return;
    this.errorMessage = null;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => this.errorMessage = err?.error?.message || err?.error || 'Falha no login. Verifique as suas credenciais.'
    });
  }
}
