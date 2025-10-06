import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);

  constructor(private supabase: SupabaseService) {
    // Initialize auth state
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Get initial session
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();

    if (session?.user) {
      this.currentUser.set(session.user);
      this.isAuthenticated.set(true);
    }

    // Listen for auth changes
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUser.set(session.user);
        this.isAuthenticated.set(true);
      } else {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      }
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async signOut() {
    try {
      const { error } = await this.supabase.client.auth.signOut();

      if (error) {
        // Si la sesión no existe en el backend, aún así limpiamos localmente
        if (
          (error as any)?.message
            ?.toLowerCase?.()
            .includes('session_not_found') ||
          (error as any)?.name === 'AuthSessionMissingError' ||
          (error as any)?.status === 401
        ) {
          this.forceClearSession();
          return;
        }

        // Para cualquier otro error, aseguramos limpieza local y propagamos
        this.forceClearSession();
        throw error;
      }
    } catch (e) {
      // Si hubo cualquier excepción inesperada, limpiamos localmente y re-lanzamos
      this.forceClearSession();
      throw e;
    } finally {
      // Aseguramos que el estado reactivo refleje cierre de sesión
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }
  }

  private forceClearSession() {
    try {
      // Limpiar posibles claves de Supabase en localStorage (sb-<ref>-auth-token)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          keysToRemove.push(key);
        }
        if (key.toLowerCase() === 'supabase.auth.token') {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignorar errores de acceso a storage (modo privado, etc.)
    }
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  async getSession() {
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();
    return session;
  }
}
