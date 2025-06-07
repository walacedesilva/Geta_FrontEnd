import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): boolean | UrlTree {
    if (this.authService.token) {
      return true;
    }
    return this.router.createUrlTree(['/login']);
  }
}
}
