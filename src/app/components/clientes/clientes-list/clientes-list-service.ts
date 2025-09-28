import { Injectable } from '@angular/core';
import { Cliente } from '../../../models/cliente.model';
import { Viaje } from '../../../models/viaje.model';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class ClientesListService {
  constructor() {}

  generateListadoPDF(
    selectedClientes: Cliente[],
    viaje: Viaje | null,
    returnDoc = false
  ): jsPDF | void {
    if (selectedClientes.length === 0) {
      alert('Por favor selecciona al menos un cliente');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 6;
    const tableWidth = pageWidth - margin * 2;
    let yPosition = margin + 2;

    const colPercents = [3, 20, 10, 3, 12, 12, 20, 20];
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

    yPosition += 3; // Espacio entre encabezados y línea
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6; // Aumentar espacio entre línea y contenido

    doc.setFont('helvetica', 'normal').setFontSize(8);
    selectedClientes.forEach((cliente) => {
      if (yPosition > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        yPosition = margin;
      }

      // Añadir check si el cliente está entregado
      const numeroConCheck = cliente.delivered
        ? `* ${cliente.number?.toString() || ''}`
        : cliente.number?.toString() || '';

      const rowData = [
        numeroConCheck,
        cliente.name || '',
        cliente.destination || '',
        cliente.packages?.toString() || '',
        `+ ${cliente.phone?.toString()}` || '-',
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

    const fileName = `clientes_viaje_${viaje?.id || 'sin_viaje'}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    doc.save(fileName);
  }

  printListadoPDF(selectedClientes: Cliente[], viaje: Viaje | null) {
    const doc = this.generateListadoPDF(selectedClientes, viaje, true) as jsPDF;
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

  generateEtiquetasPDF(
    selectedClientes: Cliente[],
    viaje: Viaje | null,
    returnDoc = false
  ): jsPDF | void {
    if (selectedClientes.length === 0) {
      alert('Por favor selecciona al menos un cliente');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 5;
    const labelWidth = (pageWidth - margin * 2) / 2;
    const labelHeight = 90;
    const labelSpacing = 0;

    let currentX = margin;
    let currentY = margin;
    let labelCount = 0;

    selectedClientes.forEach((cliente) => {
      if (currentY + labelHeight > pageHeight - margin) {
        doc.addPage();
        currentX = margin;
        currentY = margin;
      }

      doc.rect(currentX, currentY, labelWidth, labelHeight);

      try {
        const logoWidth = 18;
        const logoHeight = 18;
        const logoX = currentX + (labelWidth - logoWidth) / 2;
        const logoY = currentY + 2;

        doc.addImage('/logo.png', 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.log('Logo no encontrado, continuando sin logo');
      }

      let yPos = currentY + 24;
      const lineHeight = 14;

      doc.setFontSize(14).setFont('helvetica', 'bold');

      const addTextWithWrap = (
        text: string,
        x: number,
        y: number,
        maxWidth: number
      ) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, index: number) => {
          doc.text(line, x, y + index * 4);
        });
        return lines.length * 4;
      };

      const textMargin = 4;
      const maxTextWidth = labelWidth - textMargin * 2;

      const destinatario = cliente.family_name || cliente.name;
      const destinatarioText = `Destinatario: ${destinatario}`;
      const destinatarioHeight = addTextWithWrap(
        destinatarioText,
        currentX + textMargin,
        yPos,
        maxTextWidth
      );
      yPos += destinatarioHeight + 10;

      const telefono = cliente.phone ? `+ ${cliente.phone}` : 'No disponible';
      const telefonoText = `Teléfono: ${telefono}`;
      const telefonoHeight = addTextWithWrap(
        telefonoText,
        currentX + textMargin,
        yPos,
        maxTextWidth
      );
      yPos += telefonoHeight + 10;

      const ci = cliente.identity_card
        ? cliente.identity_card.toString()
        : 'No disponible';
      const ciText = `CI: ${ci}`;
      const ciHeight = addTextWithWrap(
        ciText,
        currentX + textMargin,
        yPos,
        maxTextWidth
      );
      yPos += ciHeight + 10;

      const municipioText = `Municipio: ${cliente.destination}`;
      const municipioHeight = addTextWithWrap(
        municipioText,
        currentX + textMargin,
        yPos,
        maxTextWidth
      );
      yPos += municipioHeight + 10;

      const enviadoText = `Enviado por: ${cliente.name}`;
      addTextWithWrap(enviadoText, currentX + textMargin, yPos, maxTextWidth);

      labelCount++;
      if (labelCount % 2 === 0) {
        currentX = margin;
        currentY += labelHeight + labelSpacing;
      } else {
        currentX += labelWidth;
      }
    });

    if (returnDoc) return doc;

    const fileName = `etiquetas_viaje_${viaje?.id || 'sin_viaje'}_${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    doc.save(fileName);
  }

  printEtiquetasPDF(selectedClientes: Cliente[], viaje: Viaje | null) {
    const doc = this.generateEtiquetasPDF(
      selectedClientes,
      viaje,
      true
    ) as jsPDF;
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
