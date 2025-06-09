import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, User, LoginResponse } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Inicializa o BehaviorSubject com o usuário do storage apenas se estiver no navegador
    this.userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.user$ = this.userSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  public get token(): string | null {
    // Acessa o token apenas se estiver no navegador
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  private getUserFromStorage(): User | null {
    // Acessa o storage apenas se estiver no navegador
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('current_user');
      return userJson ? JSON.parse(userJson) : null;
    }
    return null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  register(details: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, details).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    // Remove do storage apenas se estiver no navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('current_user');
    }
    this.userSubject.next(null);
    this.router.navigate(['/auth/']); // Redirecionado para a rota de login
  }

  private handleAuthSuccess(response: LoginResponse): void {
    // Salva no storage apenas se estiver no navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('jwt_token', response.token);
      localStorage.setItem('current_user', JSON.stringify(response.user));
    }
    this.userSubject.next(response.user);
  }
}
