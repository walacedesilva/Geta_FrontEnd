import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="w-full max-w-sm mx-auto">
      <!-- Logótipo (SVG adicionado para corresponder ao design) -->
      <div class="flex justify-center mb-8">
        <svg class="w-24 h-24 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0ZM72.5 55H60V72.5C60 74.1567 58.6567 75.5 57 75.5H43C41.3433 75.5 40 74.1567 40 72.5V55H27.5C25.8433 55 24.5 53.6567 24.5 52V38C24.5 36.3433 25.8433 35 27.5 35H40V27.5C40 25.8433 41.3433 24.5 43 24.5H57C58.6567 24.5 60 25.8433 60 27.5V35H72.5C74.1567 35 75.5 36.3433 75.5 38V52C75.5 53.6567 74.1567 55 72.5 55Z" fill="#A78BFA"/>
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-secondary-400 hover:text-secondary-300 transition-colors">Bem-vindo de volta!</h2>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <!-- Campo de Email -->
        <div class="mb-4">
          <input type="email" placeholder="Email" formControlName="email"
                 class="w-full px-5 py-3 text-gray-700 bg-gray-200 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary-400">
        </div>

        <!-- Campo de Senha -->
        <div class="mb-6">
          <input type="password" placeholder="Senha" formControlName="password"
                 class="w-full px-5 py-3 text-gray-700 bg-gray-200 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary-400">
        </div>

        <!-- Mensagem de Erro -->
        <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          {{ errorMessage }}
        </div>

        <!-- Botão de Entrar com Gradiente -->
        <button type="submit" [disabled]="loginForm.invalid"
                class="w-full flex items-center justify-center bg-gradient-to-r from-secondary-500 to-primary-500 text-white py-3 rounded-full font-semibold hover:from-secondary-600 hover:to-primary-600 disabled:from-gray-500 disabled:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl">
          <span>ENTRAR</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        <!-- Link para Registo -->
        <div class="text-center mt-8">
          <a routerLink="../register" class="text-sm text-primary-300 hover:text-white hover:underline">Não tem uma conta? Registe-se</a>
        </div>
      </form>
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
