import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../../services/clientes.service';
import { ViajesService } from '../../../services/viajes.service';
import {
  Cliente,
  ClienteCreate,
  ClienteUpdate,
} from '../../../models/cliente.model';
import { Viaje } from '../../../models/viaje.model';

@Component({
  selector: 'app-cliente-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  cliente: ClienteCreate = {
    number: 0,
    name: '',
    identity_card: null,
    destination: '',
    packages: 1,
    family_name: '',
    phone: null,
    description: '',
    delivered: false,
    viaje_id: 0,
  };

  viaje: Viaje | null = null;
  isEdit = false;
  clienteId: number | null = null;
  viajeId: number | null = null;
  loading = false;
  error: string | null = null;

  // Propiedades para búsqueda de clientes
  showClientSearch = false;
  searchTerm = '';
  searchResults: Cliente[] = [];
  searching = false;

  constructor(
    private clientesService: ClientesService,
    private viajesService: ViajesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.clienteId = +params['id'];
        this.loadCliente();
      } else if (params['viajeId']) {
        this.viajeId = +params['viajeId'];
        this.loadViaje();
      }
    });
  }

  async loadViaje() {
    if (!this.viajeId) return;

    try {
      this.viaje = await this.viajesService.getViaje(this.viajeId);
      this.cliente.viaje_id = this.viajeId;
    } catch (error) {
      this.error = 'Error al cargar el viaje';
      console.error('Error loading viaje:', error);
    }
  }

  async loadCliente() {
    if (!this.clienteId) return;

    this.loading = true;
    try {
      const cliente = await this.clientesService.getCliente(this.clienteId);
      if (cliente) {
        this.cliente = {
          number: cliente.number,
          name: cliente.name,
          identity_card: cliente.identity_card || null,
          destination: cliente.destination,
          packages: cliente.packages,
          family_name: cliente.family_name || '',
          phone: cliente.phone || null,
          description: cliente.description || '',
          delivered: cliente.delivered,
          viaje_id: cliente.viaje_id,
        };
        this.viajeId = cliente.viaje_id;
        await this.loadViaje();
      }
    } catch (error) {
      this.error = 'Error al cargar el cliente';
      console.error('Error loading cliente:', error);
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.error = null;

    try {
      if (this.isEdit && this.clienteId) {
        const updateData: ClienteUpdate = {
          number: this.cliente.number,
          name: this.cliente.name,
          identity_card: this.cliente.identity_card || null,
          destination: this.cliente.destination,
          packages: this.cliente.packages,
          family_name: this.cliente.family_name || undefined,
          phone: this.cliente.phone || null,
          description: this.cliente.description || undefined,
          delivered: this.cliente.delivered,
        };
        await this.clientesService.updateCliente(this.clienteId, updateData);
      } else {
        await this.clientesService.createCliente(this.cliente);
      }

      this.router.navigate(['/clientes', this.viajeId]);
    } catch (error) {
      this.error = this.isEdit
        ? 'Error al actualizar el cliente'
        : 'Error al crear el cliente';
      console.error('Error saving cliente:', error);
    } finally {
      this.loading = false;
    }
  }

  validateForm(): boolean {
    if (!this.cliente.number || this.cliente.number <= 0) {
      this.error = 'El número del cliente es obligatorio y debe ser mayor a 0';
      return false;
    }
    if (!this.cliente.name.trim()) {
      this.error = 'El nombre es obligatorio';
      return false;
    }
    if (!this.cliente.destination.trim()) {
      this.error = 'El destino es obligatorio';
      return false;
    }
    if (!this.cliente.packages || this.cliente.packages <= 0) {
      this.error = 'El número de paquetes debe ser mayor a 0';
      return false;
    }
    if (!this.cliente.viaje_id) {
      this.error = 'Debe seleccionar un viaje';
      return false;
    }
    return true;
  }

  cancel() {
    this.router.navigate(['/clientes', this.viajeId]);
  }

  // Métodos para búsqueda de clientes
  toggleClientSearch() {
    this.showClientSearch = !this.showClientSearch;
    if (this.showClientSearch) {
      this.searchTerm = '';
      this.searchResults = [];
    }
  }

  async searchClients() {
    if (this.searchTerm.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.searching = true;
    try {
      this.searchResults = await this.clientesService.searchClientesByName(
        this.searchTerm.trim()
      );
    } catch (error) {
      this.error = 'Error al buscar clientes';
      console.error('Error searching clients:', error);
    } finally {
      this.searching = false;
    }
  }

  selectClient(cliente: Cliente) {
    // Precargar los datos del cliente seleccionado
    this.cliente = {
      number: cliente.number,
      name: cliente.name,
      identity_card: cliente.identity_card,
      destination: cliente.destination,
      packages: cliente.packages,
      family_name: cliente.family_name || '',
      phone: cliente.phone,
      description: cliente.description || '',
      delivered: cliente.delivered,
      viaje_id: this.viajeId || 0,
    };

    // Cerrar el modal de búsqueda
    this.showClientSearch = false;
    this.searchTerm = '';
    this.searchResults = [];
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
  }
}
