import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private api: ApiService) {}

  async getClientesByViaje(viajeId: number): Promise<Cliente[]> {
    return await this.api.getList<Cliente>('clientes', {
      filters: { viaje_id: viajeId },
      orderBy: { column: 'number', ascending: true },
    });
  }

  async getAllClientes(): Promise<Cliente[]> {
    return await this.api.getList<Cliente>('clientes', {
      orderBy: [
        { column: 'viaje_id', ascending: false },
        { column: 'number', ascending: true },
      ],
    });
  }

  async getCliente(id: number): Promise<Cliente | null> {
    return await this.api.getSingle<Cliente>('clientes', {
      filters: { id },
      single: true,
    });
  }

  async createCliente(cliente: ClienteCreate): Promise<Cliente> {
    return await this.api.insert<Cliente>('clientes', [cliente]);
  }

  async updateCliente(id: number, cliente: ClienteUpdate): Promise<Cliente> {
    return await this.api.update<Cliente>('clientes', { id }, cliente);
  }

  async deleteCliente(id: number): Promise<void> {
    await this.api.delete('clientes', { id });
  }

  async toggleDelivered(id: number, delivered: boolean): Promise<Cliente> {
    return await this.api.update<Cliente>('clientes', { id }, { delivered });
  }

  async searchClientesByName(searchTerm: string): Promise<Cliente[]> {
    return await this.api.getList<Cliente>('clientes', {
      ilike: { name: searchTerm },
      orderBy: { column: 'name', ascending: true },
      limit: 20,
    });
  }

  async searchClientesByNameByIdentity(
    name: string,
    identityCard: string
  ): Promise<Cliente[]> {
    return await this.api.getList<Cliente>('clientes', {
      ilike: { name },
      filters: { identity_card: identityCard },
      orderBy: { column: 'name', ascending: true },
      limit: 20,
    });
  }
}
