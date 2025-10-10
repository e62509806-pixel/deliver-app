import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private readonly SUPABASE_KEY = 'sb-dzeawanrkskzsorkyrxi-auth-token';

  constructor(private supabase: SupabaseService) {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();

    if (session?.user) {
      this.currentUser.set(session.user);
      this.isAuthenticated.set(true);
    } else {
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    }

    this.supabase.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.resetAuth();
      } else if (session?.user) {
        this.currentUser.set(session.user);
        this.isAuthenticated.set(true);
      }
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      this.currentUser.set(data.user);
      this.isAuthenticated.set(true);
    }

    return data;
  }

  async signOut() {
    try {
      //await this.supabase.client.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }

    // 🔥 Espera un pequeño delay y limpia manualmente
    setTimeout(() => {
      this.forceClearSupabaseSession();
    }, 300);

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
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();
    return session;
  }
}
