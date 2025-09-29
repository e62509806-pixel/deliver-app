import { Injectable } from '@angular/core';
import { Cliente } from '../../../models/cliente.model';
import { Viaje } from '../../../models/viaje.model';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  TextRun,
  BorderStyle,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';
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

    yPosition += 3;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal').setFontSize(8);
    selectedClientes.forEach((cliente) => {
      if (yPosition > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        yPosition = margin;
      }

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

  async generateListadoWord(selectedClientes: Cliente[], viaje: Viaje | null) {
    if (selectedClientes.length === 0) {
      alert('Por favor selecciona al menos un cliente');
      return;
    }

    const colPercents = [3, 20, 10, 3, 12, 12, 20, 20];

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

    const tableRows: TableRow[] = [
      new TableRow({
        children: headers.map(
          (header, i) =>
            new TableCell({
              width: { size: colPercents[i], type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: header, bold: true, size: 16 }),
                  ],
                }),
              ],
            })
        ),
      }),
    ];

    selectedClientes.forEach((cliente) => {
      const numeroConCheck = cliente.delivered
        ? `* ${cliente.number?.toString() || ''}`
        : cliente.number?.toString() || '';

      const rowData = [
        numeroConCheck,
        cliente.name || '',
        cliente.destination || '',
        cliente.packages?.toString() || '',
        cliente.phone ? `+ ${cliente.phone}` : '-',
        cliente.identity_card?.toString() || '-',
        cliente.family_name || '-',
        cliente.description || '-',
      ];

      tableRows.push(
        new TableRow({
          children: rowData.map(
            (data, i) =>
              new TableCell({
                width: { size: colPercents[i], type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: data, size: 16 })],
                  }),
                ],
              })
          ),
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 200,
                bottom: 200,
                left: 200,
                right: 200,
              },
            },
          },
          children: [
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `clientes_viaje_${viaje?.id || 'sin_viaje'}_${
        new Date().toISOString().split('T')[0]
      }.docx`
    );
  }

  async generateEtiquetasWord(
    selectedClientes: Cliente[],
    viaje: Viaje | null
  ) {
    if (selectedClientes.length === 0) {
      alert('Por favor selecciona al menos un cliente');
      return;
    }

    let logoData: Uint8Array | undefined;
    try {
      const res = await fetch('/logo.png');
      if (res.ok) {
        const ab = await res.arrayBuffer();
        logoData = new Uint8Array(ab);
      }
    } catch {
      console.log('Logo no disponible, continuar sin logo');
    }

    const tableRows: TableRow[] = [];

    const makeCell = (cliente?: Cliente) => {
      if (!cliente) {
        return new TableCell({
          children: [new Paragraph({ text: '' })],
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          },
          margins: { top: 50, bottom: 100, left: 250, right: 250 },
        });
      }

      const destinatario = cliente.family_name || cliente.name || '';
      const telefono = cliente.phone ? `+ ${cliente.phone}` : 'No disponible';
      const ci = cliente.identity_card?.toString() || 'No disponible';
      const municipio = cliente.destination || '';
      const enviado = cliente.name || '';

      const children: Paragraph[] = [];

      if (logoData) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: logoData,
                type: 'png',
                transformation: { width: 60, height: 60 },
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      const addLine = (text: string) => {
        children.push(
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text, bold: true, size: 28 })],
            spacing: { after: 300 },
          })
        );
      };

      addLine(`Destinatario: ${destinatario}`);
      addLine(`Teléfono: ${telefono}`);
      addLine(`CI: ${ci}`);
      addLine(`Municipio: ${municipio}`);
      addLine(`Enviado por: ${enviado}`);

      return new TableCell({
        children,
        margins: { top: 500, bottom: 500, left: 250, right: 250 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
        },
        width: { size: 50, type: WidthType.PERCENTAGE },
      });
    };

    for (let i = 0; i < selectedClientes.length; i += 2) {
      const leftCell = makeCell(selectedClientes[i]);
      const rightCell = makeCell(selectedClientes[i + 1]);
      tableRows.push(
        new TableRow({ children: [leftCell, rightCell], cantSplit: true })
      );
    }

    const table = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 200, bottom: 200, left: 200, right: 200 },
            },
          },
          children: [table],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(
      blob,
      `etiquetas_viaje_${viaje?.id || 'sin_viaje'}_${
        new Date().toISOString().split('T')[0]
      }.docx`
    );
  }
}
