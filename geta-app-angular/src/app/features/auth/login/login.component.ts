import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="w-full max-w-md">
      <div class="bg-white p-8 rounded-2xl shadow-xl">
        <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <input type="email" placeholder="Email" formControlName="email" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-6">
            <input type="password" placeholder="Senha" formControlName="password" class="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div *ngIf="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            {{ errorMessage }}
          </div>
          <button type="submit" [disabled]="loginForm.invalid" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors">Entrar</button>
          <div class="text-center mt-6">
            <a routerLink="../register" class="text-sm text-blue-600 hover:underline">Não tem uma conta? Registre-se</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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
