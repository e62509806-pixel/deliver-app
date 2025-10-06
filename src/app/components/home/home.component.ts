import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { Cliente } from '../../models/cliente.model';

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

  constructor(private clientesService: ClientesService) {}

  async searchPackages() {
    // Validar que ambos campos estén llenos
    if (!this.searchName.trim() || !this.searchIdentity.trim()) {
      this.errorMessage =
        'Por favor, ingrese el nombre y el carnet de identidad.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = [];

    try {
      let results: Cliente[] = [];

      // Buscar por nombre y carnet de identidad
      if (this.searchName.trim() && this.searchIdentity.trim()) {
        results = await this.clientesService.searchClientesByNameByIdentity(
          this.searchName.trim(),
          this.searchIdentity.trim()
        );
      }

      // Eliminar duplicados basándose en el ID
      const uniqueResults = results.filter(
        (cliente, index, self) =>
          index === self.findIndex((c) => c.id === cliente.id)
      );

      this.searchResults = uniqueResults;

      if (this.searchResults.length === 0) {
        this.errorMessage = 'No se encontraron coincidencias exactas.';
      }
    } catch (error) {
      this.errorMessage = 'Error al buscar paquetes. Intente nuevamente.';
      console.error('Error searching packages:', error);
    } finally {
      this.isLoading = false;
    }
  }

  clearSearch() {
    this.searchName = '';
    this.searchIdentity = '';
    this.searchResults = [];
  }

  getStatusText(delivered: boolean): string {
    return delivered ? 'Entregado' : 'Pendiente';
  }

  getStatusClass(delivered: boolean): string {
    return delivered ? 'text-success' : 'text-warning';
  }

  resetErrorMessage() {
    this.errorMessage = '';
  }
}
