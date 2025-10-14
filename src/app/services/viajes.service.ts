import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Viaje, ViajeCreate, ViajeUpdate } from '../models/viaje.model';

@Injectable({
  providedIn: 'root',
})
export class ViajesService {
  constructor(private api: ApiService) {}

  async getViajes(): Promise<Viaje[]> {
    return await this.api.getList<Viaje>('viajes', {
      orderBy: { column: 'date', ascending: false },
    });
  }

  async getViaje(id: number): Promise<Viaje | null> {
    return await this.api.getSingle<Viaje>('viajes', {
      filters: { id },
      single: true,
    });
  }

  async createViaje(viaje: ViajeCreate): Promise<Viaje> {
    return await this.api.insert<Viaje>('viajes', [viaje]);
  }

  async updateViaje(id: number, viaje: ViajeUpdate): Promise<Viaje> {
    return await this.api.update<Viaje>('viajes', { id }, viaje);
  }

  async deleteViaje(id: number): Promise<void> {
    await this.api.delete('viajes', { id });
  }
}
