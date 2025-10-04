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
import autoTable, { UserOptions } from 'jspdf-autotable';

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

    const headers = [
      ' ',
      'Nombre Cliente Envía',
      'Destino',
      'Pqts',
      'Teléfono',
      'Carnet de ID',
      'Familiar',
      'Anotaciones',
    ];

    const body = selectedClientes.map((cliente) => [
      '',
      ` ${cliente.number?.toString() || ''}. ${cliente.name}` || '',
      cliente.destination || '',
      cliente.packages?.toString() || '',
      cliente.phone ? `+ ${cliente.phone}` : '',
      cliente.identity_card?.toString() || '',
      ` ${cliente.family_name}` || '',
      cliente.address
        ? `${cliente.address} | ${cliente.description || ''}`
        : cliente.description || '',
    ]);

    // --- NUEVO: ancho de columnas por porcentaje ---
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 2;
    const tableWidth = pageWidth - margin * 2;
    const colPercents = [3, 20, 7, 5, 12, 12, 19, 22];
    const colWidths: any = {};
    colPercents.forEach((p, i) => {
      colWidths[i] = { cellWidth: (p / 100) * tableWidth };
    });
    // ----------------------------------------------

    autoTable(doc, {
      head: [headers],
      body,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255], // fondo blanco
        lineWidth: 0.3, // grosor de borde
        lineColor: [0, 0, 0], // color del borde
      },
      columnStyles: {
        ...colWidths,
        1: { ...colWidths[1], halign: 'left' },
        6: { ...colWidths[6], halign: 'left' },
      },
      margin: { top: 5, left: margin, right: margin },
      tableWidth: 'auto',
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

      doc.setFontSize(14).setFont('helvetica', 'bold');

      const addTextWithWrap = (
        text: string,
        x: number,
        y: number,
        maxWidth: number
      ) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, index: number) => {
          doc.text(line, x, y + index * 6);
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
      yPos += destinatarioHeight + 7;

      const telefono = cliente.phone ? `+${cliente.phone}` : 'No disponible';
      const telefonoText = `Teléfono: ${telefono}`;
      const telefonoHeight = addTextWithWrap(
        telefonoText,
        currentX + textMargin,
        yPos,
        maxTextWidth
      );
      yPos += telefonoHeight + 7;

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
      yPos += ciHeight + 7;

      const locationText =
        cliente.is_address && cliente.address
          ? `Dirección: ${cliente.address}`
          : `Municipio: ${cliente.destination}`;
      const locationHeight = addTextWithWrap(
        locationText,
        currentX + textMargin,
        yPos,
        maxTextWidth
      );
      yPos += locationHeight + 10;

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

    const colPercents = [3, 20, 6, 3, 12, 12, 20, 24];

    const headers = [
      ' ',
      'Nombre Cliente Envía',
      'Destino',
      'Pqts',
      'Teléfono',
      'Carnet de ID',
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
                    new TextRun({
                      text: header,
                      bold: true,
                      font: 'Arial',
                      size: 16,
                    }),
                  ],
                }),
              ],
            })
        ),
      }),
    ];

    selectedClientes.forEach((cliente) => {
      const rowData = [
        '',
        ` ${cliente.number?.toString() || ''}. ${cliente.name}` || '',
        cliente.destination || '',
        cliente.packages?.toString() || '',
        cliente.phone ? `+ ${cliente.phone}` : '',
        cliente.identity_card?.toString() || '',
        ` ${cliente.family_name}` || '',
        cliente.address
          ? `${cliente.address} | ${cliente.description || ''}`
          : cliente.description || '',
      ];

      tableRows.push(
        new TableRow({
          children: rowData.map(
            (data, i) =>
              new TableCell({
                width: { size: colPercents[i], type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment:
                      i !== 1 && i !== 6
                        ? AlignmentType.CENTER
                        : AlignmentType.LEFT,
                    children: [
                      new TextRun({ text: data, font: 'Arial', size: 16 }),
                    ],
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

    // Cargar logo
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
      if (!cliente)
        return new TableCell({ children: [new Paragraph({ text: '' })] });

      const destinatario = cliente.family_name || cliente.name || '';
      const telefono = cliente.phone ? `+ ${cliente.phone}` : 'No disponible';
      const ci = cliente.identity_card?.toString() || 'No disponible';
      const location =
        cliente.is_address && cliente.address
          ? cliente.address
          : cliente.destination || '';
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
            spacing: { after: 150 },
          })
        );
      }

      const addWrappedLine = (
        text: string,
        maxChars = 40,
        isLastLineOfBlock = true
      ) => {
        const regex = new RegExp(`(.{1,${maxChars}})(\\s|$)`, 'g');
        const lines = text.match(regex) || [text];

        lines.forEach((line, index) => {
          children.push(
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: line,
                  font: 'Arial',
                  size: 28,
                  bold: true,
                }),
              ],
              spacing: {
                after:
                  index === lines.length - 1 && isLastLineOfBlock ? 300 : 200,
              },
            })
          );
        });
      };

      addWrappedLine(`Destinatario: ${destinatario}`);
      addWrappedLine(`Teléfono: ${telefono}`);
      addWrappedLine(`CI: ${ci}`);
      addWrappedLine(
        cliente.is_address && cliente.address
          ? `Dirección: ${location}`
          : `Municipio: ${location}`
      );
      addWrappedLine(`Enviado por: ${enviado}`);

      return new TableCell({
        children,
        margins: { top: 200, bottom: 200, left: 100, right: 100 },
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
              margin: { top: 400, bottom: 200, left: 200, right: 200 },
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
