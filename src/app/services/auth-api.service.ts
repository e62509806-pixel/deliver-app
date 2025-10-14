import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment/environment';

export interface AuthUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export interface AuthSession {
  accessToken: string | null;
  user: AuthUser | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly storageKey = 'app-auth-token';

  constructor(private http: HttpClient) {}

  // Generic, backend-agnostic sign in
  async signIn(email: string, password: string): Promise<AuthSession> {
    if ((environment as any).authProvider === 'generic' && (environment as any).authBaseUrl) {
      const base = (environment as any).authBaseUrl.replace(/\/+$/, '');
      const url = `${base}/login`;
      const session = await firstValueFrom(this.http.post<AuthSession>(url, { email, password }));
      this.persistToken(session.accessToken);
      return session;
    }

    // Default: Supabase REST Auth
    const supabaseUrl = environment.supabaseUrl.replace(/\/+$/, '');
    const url = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    const headers = new HttpHeaders({
      apikey: environment.supabaseKey,
      'Content-Type': 'application/json',
    });

    const resp = await firstValueFrom(
      this.http.post<any>(url, { email, password }, { headers })
    );

    const accessToken: string | null = resp?.access_token ?? null;
    const user: AuthUser | null = resp?.user ? { id: resp.user.id, email: resp.user.email, ...resp.user } : null;

    this.persistToken(accessToken);
    return { accessToken, user };
  }

  async signOut(): Promise<void> {
    const token = this.getToken();

    if ((environment as any).authProvider === 'generic' && (environment as any).authBaseUrl) {
      const base = (environment as any).authBaseUrl.replace(/\/+$/, '');
      const url = `${base}/logout`;
      if (token) {
        await firstValueFrom(
          this.http.post(url, {}, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
        );
      }
      this.clearToken();
      return;
    }

    // Supabase REST logout
    if (token) {
      const supabaseUrl = environment.supabaseUrl.replace(/\/+$/, '');
      const url = `${supabaseUrl}/auth/v1/logout`;
      const headers = new HttpHeaders({
        apikey: environment.supabaseKey,
        Authorization: `Bearer ${token}`,
      });
      try {
        await firstValueFrom(this.http.post(url, {}, { headers }));
      } catch (_) {
        // ignore logout errors
      }
    }
    this.clearToken();
  }

  async getSession(): Promise<AuthSession> {
    const token = this.getToken();
    if (!token) return { accessToken: null, user: null };

    if ((environment as any).authProvider === 'generic' && (environment as any).authBaseUrl) {
      const base = (environment as any).authBaseUrl.replace(/\/+$/, '');
      const url = `${base}/session`;
      const user = await firstValueFrom(
        this.http.get<AuthUser>(url, { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) })
      );
      return { accessToken: token, user };
    }

    // Supabase REST get user
    const supabaseUrl = environment.supabaseUrl.replace(/\/+$/, '');
    const url = `${supabaseUrl}/auth/v1/user`;
    const headers = new HttpHeaders({
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${token}`,
    });
    try {
      const resp = await firstValueFrom(this.http.get<any>(url, { headers }));
      const user: AuthUser | null = resp?.id ? { id: resp.id, email: resp.email, ...resp } : null;
      return { accessToken: token, user };
    } catch (_) {
      this.clearToken();
      return { accessToken: null, user: null };
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null;
    }
  }

  private persistToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem(this.storageKey, token);
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch (_) {
      // ignore storage errors
    }
  }

  private clearToken() {
    this.persistToken(null);
  }
}


