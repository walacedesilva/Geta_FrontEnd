import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './models/user.model';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html' // O HTML está abaixo
})
export class AppComponent {
  user$: Observable<User | null>;
  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }
  logout(): void {
    this.authService.logout();
  }
}
