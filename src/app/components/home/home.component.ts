import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { ViajesService } from '../../services/viajes.service';
import { Cliente } from '../../models/cliente.model';
import { Viaje } from '../../models/viaje.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  searchName = '';
  searchIdentity = '';
  searchResults: Cliente[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private clientesService: ClientesService,
    private viajesService: ViajesService
  ) {}

  async searchPackages() {
    if (!this.searchName.trim() && !this.searchIdentity.trim()) {
      this.errorMessage =
        'Por favor, ingrese al menos el nombre o el carnet de identidad';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = [];

    try {
      let results: Cliente[] = [];

      // Buscar por nombre si está proporcionado
      if (this.searchName.trim()) {
        const nameResults = await this.clientesService.searchClientesByName(
          this.searchName.trim()
        );
        results = [...results, ...nameResults];
      }

      // Buscar por carnet si está proporcionado
      if (this.searchIdentity.trim()) {
        const identityResults =
          await this.clientesService.searchClientesByIdentity(
            this.searchIdentity.trim()
          );
        results = [...results, ...identityResults];
      }

      // Eliminar duplicados basándose en el ID
      const uniqueResults = results.filter(
        (cliente, index, self) =>
          index === self.findIndex((c) => c.id === cliente.id)
      );

      this.searchResults = uniqueResults;
    } catch (error) {
      this.errorMessage = 'Error al buscar paquetes. Intente nuevamente.';
      console.error('Error searching packages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getStatusText(delivered: boolean): string {
    return delivered ? 'Entregado' : 'Pendiente';
  }

  getStatusClass(delivered: boolean): string {
    return delivered ? 'text-success' : 'text-warning';
  }
}
