import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../../services/clientes.service';
import { ViajesService } from '../../../services/viajes.service';
import { Cliente } from '../../../models/cliente.model';
import { Viaje } from '../../../models/viaje.model';
import jsPDF from 'jspdf';

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

  // ✅ Selección múltiple
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

  // ✅ PDF / Imprimir
  generatePDF(returnDoc = false): jsPDF | void {
    const selectedClientes = this.getSelectedClientes();
    if (selectedClientes.length === 0) {
      alert('Por favor selecciona al menos un cliente');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 6;
    const tableWidth = pageWidth - margin * 2;
    let yPosition = margin;

    const colPercents = [2, 20, 10, 4, 12, 12, 20, 20];
    const colWidths = colPercents.map((p) => (p / 100) * tableWidth);

    // Encabezados
    doc.setFontSize(9).setFont('helvetica', 'bold');
    const headers = [
      '#',
      'Nombre cliente',
      'Destino',
      'Paq.',
      'Teléfono',
      'CI',
      'Familiar',
      'Anotaciones',
    ];

    let xPosition = margin;
    headers.forEach((header, index) => {
      const cellWidth = colWidths[index];
      const cellCenter = xPosition + cellWidth / 2;
      doc.text(header, cellCenter, yPosition, { align: 'center' });
      xPosition += cellWidth;
    });

    yPosition += 6;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 3;

    // Filas
    doc.setFont('helvetica', 'normal').setFontSize(8);
    selectedClientes.forEach((cliente) => {
      if (yPosition > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        yPosition = margin;
      }

      const rowData = [
        cliente.number?.toString() || '',
        cliente.name || '',
        cliente.destination || '',
        cliente.packages?.toString() || '',
        cliente.phone?.toString() || '-',
        cliente.identity_card?.toString() || '-',
        cliente.family_name || '-',
        cliente.description || '-',
      ];

      xPosition = margin;
      rowData.forEach((data, index) => {
        const cellWidth = colWidths[index];
        const cellCenter = xPosition + cellWidth / 2;
        const textLines: string[] = doc.splitTextToSize(data, cellWidth - 2);
        textLines.forEach((line: string, i: number) => {
          doc.text(line, cellCenter, yPosition + i * 3.5, { align: 'center' });
        });
        xPosition += cellWidth;
      });

      yPosition += 8;
    });

    if (returnDoc) return doc;

    const fileName = `clientes_viaje_${this.viaje?.id || 'sin_viaje'}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    doc.save(fileName);
  }

  printPDF() {
    const doc = this.generatePDF(true) as jsPDF;
    if (!doc) return;

    doc.autoPrint();

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
      });
    }
  }
}
