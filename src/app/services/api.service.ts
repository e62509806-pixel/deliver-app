import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environment/environment';
import { AuthApiService } from './auth-api.service';

type OrderDirection = 'asc' | 'desc';

interface OrderByOption {
  column: string;
  ascending?: boolean;
}

interface QueryOptions {
  filters?: Record<string, string | number | boolean>;
  ilike?: Record<string, string>;
  orderBy?: OrderByOption | OrderByOption[];
  limit?: number;
  single?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.supabaseUrl.replace(/\/+$/, '')}/rest/v1`;
  private readonly defaultHeaders = new HttpHeaders({
    apikey: environment.supabaseKey,
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient, private authApi: AuthApiService) {}

  async getList<T>(table: string, options: QueryOptions = {}): Promise<T[]> {
    const { headers, params } = this.buildRequestOptions(options);
    const url = `${this.baseUrl}/${table}`;
    const observable$ = this.http.get<T[]>(url, { headers, params });
    const data = await firstValueFrom(observable$);
    return data || [];
  }

  async getSingle<T>(table: string, options: QueryOptions = {}): Promise<T | null> {
    const { headers, params } = this.buildRequestOptions({ ...options, single: true });
    const url = `${this.baseUrl}/${table}`;
    const observable$ = this.http.get<T>(url, { headers, params });
    try {
      const data = await firstValueFrom(observable$);
      return (data as T) ?? null;
    } catch (error: any) {
      // PostgREST returns 406/300 in some multi-match cases when single requested
      throw error;
    }
  }

  async insert<T>(table: string, payload: unknown): Promise<T> {
    const url = `${this.baseUrl}/${table}`;
    const headers = this.getAuthHeaders().set('Prefer', 'return=representation');
    const observable$ = this.http.post<T>(url, payload, { headers });
    return await firstValueFrom(observable$);
  }

  async update<T>(table: string, match: Record<string, string | number | boolean>, payload: unknown): Promise<T> {
    const url = `${this.baseUrl}/${table}`;
    const { params } = this.buildParams({ filters: match });
    const headers = this.getAuthHeaders().set('Prefer', 'return=representation');
    const observable$ = this.http.patch<T>(url, payload, { headers, params });
    return await firstValueFrom(observable$);
  }

  async delete(table: string, match: Record<string, string | number | boolean>): Promise<void> {
    const url = `${this.baseUrl}/${table}`;
    const { params } = this.buildParams({ filters: match });
    const observable$ = this.http.delete(url, { headers: this.getAuthHeaders(), params });
    await firstValueFrom(observable$);
  }

  private buildRequestOptions(options: QueryOptions) {
    const { params } = this.buildParams(options);
    let headers = this.getAuthHeaders();
    if (options.single) {
      headers = headers.set('Accept', 'application/vnd.pgrst.object+json');
      headers = headers.set('Prefer', 'return=representation');
    }
    return { headers, params };
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authApi.getToken();
    let headers = this.defaultHeaders;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private buildParams(options: QueryOptions): { params: HttpParams } {
    let params = new HttpParams();

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        params = params.set(key, `eq.${value}`);
      });
    }

    if (options.ilike) {
      Object.entries(options.ilike).forEach(([key, value]) => {
        // PostgREST ilike uses wildcards with * around the term when needed
        params = params.set(key, `ilike.*${value}*`);
      });
    }

    if (options.orderBy) {
      const orders = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
      const orderStrings = orders.map((o) => `${o.column}.${(o.ascending ?? true) ? 'asc' : 'desc'}`);
      params = params.set('order', orderStrings.join(','));
    }

    if (typeof options.limit === 'number') {
      params = params.set('limit', String(options.limit));
    }

    return { params };
  }
}


