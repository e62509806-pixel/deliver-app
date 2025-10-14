import { Injectable, signal } from '@angular/core';
import { AuthApiService, AuthSession, AuthUser } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<AuthUser | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private readonly SUPABASE_KEY = 'sb-dzeawanrkskzsorkyrxi-auth-token';

  constructor(private authApi: AuthApiService) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const session = await this.authApi.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
      this.isAuthenticated.set(true);
      return;
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  async signIn(email: string, password: string) {
    const session: AuthSession = await this.authApi.signIn(email, password);
    if (session.user) {
      this.currentUser.set(session.user);
      this.isAuthenticated.set(true);
    }
    return session;
  }

  async signOut() {
    await this.authApi.signOut();
    this.resetAuth();
  }

  private resetAuth() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  // 🔥 Limpieza forzada de la sesión local
  private forceClearSupabaseSession() {
    try {
      localStorage.removeItem(this.SUPABASE_KEY);
      sessionStorage.removeItem(this.SUPABASE_KEY);

      // Algunos navegadores mantienen copia en locks de Supabase
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Error clearing Supabase local session:', e);
    }
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  async getSession() {
    return await this.authApi.getSession();
  }
}
