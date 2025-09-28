import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cliente, ClienteCreate, ClienteUpdate } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  constructor(private supabase: SupabaseService) {}

  async getClientesByViaje(viajeId: number): Promise<Cliente[]> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .eq('viaje_id', viajeId)
      .order('number', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getAllClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .order('viaje_id', { ascending: false })
      .order('number', { ascending: true });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getCliente(id: number): Promise<Cliente | null> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createCliente(cliente: ClienteCreate): Promise<Cliente> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .insert([cliente])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateCliente(id: number, cliente: ClienteUpdate): Promise<Cliente> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async deleteCliente(id: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  async toggleDelivered(id: number, delivered: boolean): Promise<Cliente> {
    const { data, error } = await this.supabase.client
      .from('clientes')
      .update({ delivered })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }
}
