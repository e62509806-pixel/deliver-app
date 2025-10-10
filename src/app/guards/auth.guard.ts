import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    // Verificación reactiva rápida
    const isAuthenticatedSignal = this.authService.getIsAuthenticated()();
    if (isAuthenticatedSignal) {
      return true;
    }

    // Verificación de sesión real con Supabase (evita falsos positivos/negativos)
    try {
      const session = await this.authService.getSession();
      if (session?.user) {
        return true;
      }
    } catch {
      // ignoramos errores puntuales, seguiremos al login
    }

    return this.router.createUrlTree(['/login']);
  }
}
