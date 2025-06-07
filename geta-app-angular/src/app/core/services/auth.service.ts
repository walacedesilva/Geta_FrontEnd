import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, User, LoginResponse } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  public get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('current_user');
    return userJson ? JSON.parse(userJson) : null;
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
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('current_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(response: LoginResponse): void {
    localStorage.setItem('jwt_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }
}
