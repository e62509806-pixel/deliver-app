import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViajesService } from '../../../services/viajes.service';
import { Viaje } from '../../../models/viaje.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-viajes-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './viajes-list.html',
  styleUrl: './viajes-list.css',
})
export class ViajesList implements OnInit {
  viajes: Viaje[] = [];
  loading = false;
  error: string | null = null;

  constructor(private viajesService: ViajesService, private router: Router) {}

  ngOnInit() {
    this.loadViajes();
  }

  async loadViajes() {
    this.loading = true;
    this.error = null;
    try {
      this.viajes = await this.viajesService.getViajes();
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
}
