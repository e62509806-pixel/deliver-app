import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private api: ApiService) {}

  private normalizeClienteIdentity(c: any): Cliente {
    return {
      ...c,
      identity_card:
        c && c.identity_card !== null && c.identity_card !== undefined
          ? String(c.identity_card)
          : null,
    } as Cliente;
  }

  async getClientesByViaje(viajeId: number): Promise<Cliente[]> {
    const data = await this.api.getList<Cliente>('clientes', {
      filters: { viaje_id: viajeId },
      orderBy: { column: 'number', ascending: true },
    });
    return (data || []).map((c) => this.normalizeClienteIdentity(c));
  }

  async getAllClientes(): Promise<Cliente[]> {
    const data = await this.api.getList<Cliente>('clientes', {
      orderBy: [
        { column: 'viaje_id', ascending: false },
        { column: 'number', ascending: true },
      ],
    });
    return (data || []).map((c) => this.normalizeClienteIdentity(c));
  }

  async getCliente(id: number): Promise<Cliente | null> {
    const item = await this.api.getSingle<Cliente>('clientes', {
      filters: { id },
      single: true,
    });
    return item ? this.normalizeClienteIdentity(item) : null;
  }

  async createCliente(cliente: ClienteCreate): Promise<Cliente> {
    const created = await this.api.insert<Cliente>('clientes', [cliente]);
    return this.normalizeClienteIdentity(created);
  }

  async updateCliente(id: number, cliente: ClienteUpdate): Promise<Cliente> {
    const updated = await this.api.update<Cliente>('clientes', { id }, cliente);
    return this.normalizeClienteIdentity(updated);
  }

  async deleteCliente(id: number): Promise<void> {
    await this.api.delete('clientes', { id });
  }

  async toggleDelivered(id: number, delivered: boolean): Promise<Cliente> {
    return await this.api.update<Cliente>('clientes', { id }, { delivered });
  }

  async searchClientesByName(searchTerm: string): Promise<Cliente[]> {
    const data = await this.api.getList<Cliente>('clientes', {
      ilike: { name: searchTerm },
      orderBy: { column: 'name', ascending: true },
      limit: 20,
    });
    return (data || []).map((c) => this.normalizeClienteIdentity(c));
  }

  async searchClientesByNameByIdentity(
    name: string,
    identityCard: string
  ): Promise<Cliente[]> {
    const data = await this.api.getList<Cliente>('clientes', {
      ilike: { name },
      filters: { identity_card: identityCard },
      orderBy: { column: 'name', ascending: true },
      limit: 20,
    });
    return (data || []).map((c) => this.normalizeClienteIdentity(c));
  }
}
