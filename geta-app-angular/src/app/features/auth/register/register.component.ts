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
    <div class="w-full max-w-md">
      <div class="bg-white p-8 rounded-2xl shadow-xl">
        <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Criar Conta</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <input type="text" placeholder="Nome de usuário" formControlName="username" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-4">
            <input type="email" placeholder="Email" formControlName="email" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-6">
            <input type="password" placeholder="Senha" formControlName="password" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            {{ errorMessage }}
          </div>
          <button type="submit" [disabled]="registerForm.invalid" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Registrar</button>
          <div class="text-center mt-6">
            <a routerLink="../" class="text-sm text-blue-600 hover:underline">Já tem uma conta? Faça o login</a>
          </div>
        </form>
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
