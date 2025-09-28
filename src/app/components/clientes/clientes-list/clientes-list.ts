import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../../services/clientes.service';
import { ViajesService } from '../../../services/viajes.service';
import { Cliente } from '../../../models/cliente.model';
import { Viaje } from '../../../models/viaje.model';

@Component({
  selector: 'app-clientes-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.css',
})
export class ClientesList implements OnInit {
  clientes: Cliente[] = [];
  viaje: Viaje | null = null;
  viajeId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private clientesService: ClientesService,
    private viajesService: ViajesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.viajeId = +params['id'];
      if (this.viajeId) {
        this.loadViaje();
        this.loadClientes();
      }
    });
  }

  async loadViaje() {
    if (!this.viajeId) return;

    try {
      this.viaje = await this.viajesService.getViaje(this.viajeId);
    } catch (error) {
      this.error = 'Error al cargar el viaje';
      console.error('Error loading viaje:', error);
    }
  }

  async loadClientes() {
    if (!this.viajeId) return;

    this.loading = true;
    this.error = null;
    try {
      this.clientes = await this.clientesService.getClientesByViaje(
        this.viajeId
      );
    } catch (error) {
      this.error = 'Error al cargar los clientes';
      console.error('Error loading clientes:', error);
    } finally {
      this.loading = false;
    }
  }

  async deleteCliente(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await this.clientesService.deleteCliente(id);
        this.loadClientes(); // Recargar la lista
      } catch (error) {
        this.error = 'Error al eliminar el cliente';
        console.error('Error deleting cliente:', error);
      }
    }
  }

  async toggleDelivered(cliente: Cliente) {
    try {
      await this.clientesService.toggleDelivered(
        cliente.id!,
        !cliente.delivered
      );
      cliente.delivered = !cliente.delivered;
    } catch (error) {
      this.error = 'Error al actualizar el estado de entrega';
      console.error('Error toggling delivered:', error);
    }
  }

  editCliente(id: number) {
    this.router.navigate(['/clientes/edit', id]);
  }

  addCliente() {
    this.router.navigate(['/clientes/new', this.viajeId]);
  }

  backToViajes() {
    this.router.navigate(['/viajes']);
  }

  getDeliveredCount(): number {
    return this.clientes.filter((c) => c.delivered).length;
  }

  getTotalPackages(): number {
    return this.clientes.reduce((total, c) => total + c.packages, 0);
  }
}
