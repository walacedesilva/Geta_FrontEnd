import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './models/user.model';
import { AuthService } from './core/services/auth.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [], // Removido o styleUrl incorreto
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf, AsyncPipe] // As importações corretas já estavam aqui
})
export class AppComponent {
  user$: Observable<User | null>;
  private authService = inject(AuthService);

  constructor() {
    this.user$ = this.authService.user$;
  }

  public logout(): void {
    this.authService.logout();
  }
}
