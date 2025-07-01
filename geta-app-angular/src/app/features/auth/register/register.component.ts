import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
    imports: [ReactiveFormsModule,NgIf],
  standalone: true,
  template: `
<div class="flex flex-col items-center justify-center min-h-screen bg-dark-purple">
  <div class="w-full max-w-md p-8 space-y-8 bg-primary-purple rounded-xl shadow-lg">

    <div class="text-center">
        <h1 class="text-4xl font-bold text-accent-green">double to double</h1>
        <p class="mt-2 text-white">Crie sua conta</p>
    </div>

    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">

      <div>
        <label for="name" class="text-sm font-medium text-gray-200">Nome</label>
        <input id="name" type="text" formControlName="name"
               class="w-full px-4 py-2 mt-2 text-white bg-light-purple-card border border-transparent rounded-lg focus:ring-accent-green focus:border-accent-green"
               placeholder="Seu nome completo">
      </div>

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
               placeholder="Crie uma senha forte">
      </div>

       <div>
        <label for="confirmPassword" class="text-sm font-medium text-gray-200">Confirme a Senha</label>
        <input id="confirmPassword" type="password" formControlName="confirmPassword"
               class="w-full px-4 py-2 mt-2 text-white bg-light-purple-card border border-transparent rounded-lg focus:ring-accent-green focus:border-accent-green"
               placeholder="Confirme sua senha">
      </div>

      <button type="submit" [disabled]="registerForm.invalid"
              class="w-full py-3 font-semibold text-white bg-accent-orange rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-orange disabled:opacity-50">
        Cadastrar
      </button>
    </form>

    <div class="text-center">
      <p class="text-sm text-gray-300">
        Já possui uma conta?
        <a routerLink="/auth/login" class="font-medium text-accent-green hover:underline">Faça login</a>
      </p>
    </div>

  </div>
</div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.errorMessage = null;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => this.errorMessage = err?.error?.message || err?.error || 'Ocorreu um erro ao tentar registar.'
    });
  }
}
