import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../../services/clientes.service';
import { ViajesService } from '../../../services/viajes.service';
import { Cliente } from '../../../models/cliente.model';
import { Viaje } from '../../../models/viaje.model';
import { ClientesListService } from './clientes-list-service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
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

  // Selección múltiple
  selectedClientes: Set<number> = new Set();
  selectAll = false;

  // Menús desplegables
  showListadoMenu = false;
  showEtiquetasMenu = false;

  selectedAsDelivered = signal<boolean>(false);

  // Edición inline del campo check
  editingCheck: number | null = null;
  tempCheckValue: string = '';
  @ViewChild('checkInput') checkInput!: ElementRef;

  constructor(
    private clientesService: ClientesService,
    private viajesService: ViajesService,
    private route: ActivatedRoute,
    private router: Router,
    private pdfService: ClientesListService
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
      console.error(error);
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
      if (this.clientes.length > 0) {
        const allDelivered = this.clientes.every((c) => c.delivered);
        this.selectedAsDelivered.set(allDelivered);
      } else {
        this.selectedAsDelivered.set(true);
      }
    } catch (error) {
      this.error = 'Error al cargar los clientes';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  async deleteCliente(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await this.clientesService.deleteCliente(id);
        this.loadClientes();
      } catch (error) {
        this.error = 'Error al eliminar el cliente';
        console.error(error);
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
      console.error(error);
    }
  }

  async markSelectedAsDelivered() {
    if (this.selectedClientes.size === 0) return;
    this.selectedAsDelivered.update(
      (selectedAsDelivered) => !selectedAsDelivered
    );
    try {
      const promises = [];
      for (const cliente of this.clientes) {
        if (this.selectedClientes.has(cliente.id!)) {
          promises.push(
            this.clientesService.toggleDelivered(
              cliente.id!,
              this.selectedAsDelivered()
            )
          );
          cliente.delivered = this.selectedAsDelivered();
        }
      }

      await Promise.all(promises);
      this.selectedClientes.clear();
      this.selectAll = false;
    } catch (error) {
      this.error = 'Error al marcar clientes como entregados';
      console.error(error);
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

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedClientes = new Set(this.clientes.map((c) => c.id!));
    } else {
      this.selectedClientes.clear();
    }
  }

  toggleClienteSelection(clienteId: number) {
    if (this.selectedClientes.has(clienteId)) {
      this.selectedClientes.delete(clienteId);
    } else {
      this.selectedClientes.add(clienteId);
    }
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    this.selectAll =
      this.clientes.length > 0 &&
      this.selectedClientes.size === this.clientes.length;
  }

  isClienteSelected(clienteId: number): boolean {
    return this.selectedClientes.has(clienteId);
  }

  getSelectedClientes(): Cliente[] {
    return this.clientes.filter((c) => this.selectedClientes.has(c.id!));
  }

  toggleListadoMenu() {
    this.showListadoMenu = !this.showListadoMenu;
    this.showEtiquetasMenu = false;
  }

  toggleEtiquetasMenu() {
    this.showEtiquetasMenu = !this.showEtiquetasMenu;
    this.showListadoMenu = false;
  }

  closeMenus() {
    this.showListadoMenu = false;
    this.showEtiquetasMenu = false;
  }

  generateListadoPDF(returnDoc = false) {
    const selectedClientes = this.getSelectedClientes();
    return this.pdfService.generateListadoPDF(
      selectedClientes,
      this.viaje,
      returnDoc
    );
  }

  printListadoPDF() {
    const selectedClientes = this.getSelectedClientes();
    this.pdfService.printListadoPDF(selectedClientes, this.viaje);
  }

  generateEtiquetasPDF(returnDoc = false) {
    const selectedClientes = this.getSelectedClientes();
    return this.pdfService.generateEtiquetasPDF(
      selectedClientes,
      this.viaje,
      returnDoc
    );
  }

  printEtiquetasPDF() {
    const selectedClientes = this.getSelectedClientes();
    this.pdfService.printEtiquetasPDF(selectedClientes, this.viaje);
  }

  generateListadoWord() {
    const selectedClientes = this.getSelectedClientes();
    return this.pdfService.generateListadoWord(selectedClientes, this.viaje);
  }

  generateEtiquetasWord() {
    const selectedClientes = this.getSelectedClientes();
    return this.pdfService.generateEtiquetasWord(selectedClientes, this.viaje);
  }

  async toggleAddressStatus(cliente: Cliente) {
    if (!cliente.address) return; // Solo si tiene dirección

    try {
      await this.clientesService.updateCliente(cliente.id!, {
        is_address: !cliente.is_address,
      });
      cliente.is_address = !cliente.is_address;
    } catch (error) {
      this.error = 'Error al actualizar el estado de dirección';
      console.error(error);
    }
  }

  // Métodos para edición inline del campo check
  startEditCheck(cliente: Cliente) {
    this.editingCheck = cliente.id!;
    this.tempCheckValue = cliente.check || '';
    
    // Enfocar el input después de que se renderice
    setTimeout(() => {
      if (this.checkInput) {
        this.checkInput.nativeElement.focus();
        this.checkInput.nativeElement.select();
      }
    }, 0);
  }

  async saveCheckValue(cliente: Cliente) {
    if (this.editingCheck !== cliente.id) return;

    // Validar que sea una sola letra
    const trimmedValue = this.tempCheckValue.trim().toUpperCase();
    
    // Solo permitir una letra (A-Z)
    if (trimmedValue.length > 1 || (trimmedValue.length === 1 && !/^[A-Z]$/.test(trimmedValue))) {
      this.cancelEditCheck();
      return;
    }

    const newValue = trimmedValue || null;

    try {
      await this.clientesService.updateCliente(cliente.id!, {
        check: newValue,
      });
      cliente.check = newValue;
      this.cancelEditCheck();
    } catch (error) {
      this.error = 'Error al actualizar el campo check';
      console.error(error);
      this.cancelEditCheck();
    }
  }

  cancelEditCheck() {
    this.editingCheck = null;
    this.tempCheckValue = '';
  }
}
