import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Viaje, ViajeCreate, ViajeUpdate } from '../models/viaje.model';

@Injectable({
  providedIn: 'root',
})
export class ViajesService {
  constructor(private supabase: SupabaseService) {}

  async getViajes(): Promise<Viaje[]> {
    const { data, error } = await this.supabase.client
      .from('viajes')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  }

  async getViaje(id: number): Promise<Viaje | null> {
    const { data, error } = await this.supabase.client
      .from('viajes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async createViaje(viaje: ViajeCreate): Promise<Viaje> {
    const { data, error } = await this.supabase.client
      .from('viajes')
      .insert([viaje])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async updateViaje(id: number, viaje: ViajeUpdate): Promise<Viaje> {
    const { data, error } = await this.supabase.client
      .from('viajes')
      .update(viaje)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  async deleteViaje(id: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('viajes')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
