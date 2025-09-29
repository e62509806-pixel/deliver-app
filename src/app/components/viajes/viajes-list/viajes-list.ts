import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../../services/viajes.service';
import { ClientesService } from '../../../services/clientes.service';
import { Viaje } from '../../../models/viaje.model';
import { Cliente } from '../../../models/cliente.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viajes-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes-list.html',
  styleUrl: './viajes-list.css',
})
export class ViajesList implements OnInit {
  viajes: Viaje[] = [];
  allClientes: Cliente[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private viajesService: ViajesService,
    private clientesService: ClientesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadViajes();
  }

  async loadViajes() {
    this.loading = true;
    this.error = null;
    try {
      this.viajes = await this.viajesService.getViajes();
      this.allClientes = await this.clientesService.getAllClientes();
    } catch (error) {
      this.error = 'Error al cargar los viajes';
      console.error('Error loading viajes:', error);
    } finally {
      this.loading = false;
    }
  }

  async deleteViaje(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
      try {
        await this.viajesService.deleteViaje(id);
        this.loadViajes(); // Recargar la lista
      } catch (error) {
        this.error = 'Error al eliminar el viaje';
        console.error('Error deleting viaje:', error);
      }
    }
  }

  editViaje(id: number) {
    this.router.navigate(['/viajes/edit', id]);
  }

  viewClientes(id: number) {
    this.router.navigate(['/clientes', id]);
  }

  addViaje() {
    this.router.navigate(['/viajes/new']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  // Métodos para estadísticas generales
  getTotalViajes(): number {
    return this.viajes.length;
  }

  getTotalClientes(): number {
    return this.allClientes.length;
  }

  getTotalPaquetes(): number {
    return this.allClientes.reduce(
      (total, cliente) => total + cliente.packages,
      0
    );
  }

  getClientesEntregados(): number {
    return this.allClientes.filter((cliente) => cliente.delivered).length;
  }

  getClientesPendientes(): number {
    return this.allClientes.filter((cliente) => !cliente.delivered).length;
  }

  getPorcentajeEntregado(): number {
    if (this.getTotalClientes() === 0) {
      return 0;
    }
    return Math.round(
      (this.getClientesEntregados() / this.getTotalClientes()) * 100
    );
  }
  
  // Métodos para estadísticas por viaje
  getClientesByViaje(viajeId: number): number {
    return this.allClientes.filter(cliente => cliente.viaje_id === viajeId).length;
  }
  
  getEntregadosByViaje(viajeId: number): number {
    return this.allClientes.filter(cliente => cliente.viaje_id === viajeId && cliente.delivered).length;
  }
  
  getPendientesByViaje(viajeId: number): number {
    return this.allClientes.filter(cliente => cliente.viaje_id === viajeId && !cliente.delivered).length;
  }
  
  getPaquetesByViaje(viajeId: number): number {
    return this.allClientes
      .filter(cliente => cliente.viaje_id === viajeId)
      .reduce((total, cliente) => total + (cliente.packages || 0), 0);
  }
}
