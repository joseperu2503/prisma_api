import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { In, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async generateQrPdf(documentNumbers: string[]): Promise<Buffer> {
    const people = await this.personRepository.find({
      where: { documentNumber: In(documentNumbers) },
      relations: ['employees', 'students'],
    });

    if (!people.length) {
      throw new NotFoundException(
        'No se encontraron personas con los documentos proporcionados',
      );
    }

    const doc: PDFKit.PDFDocument = new PDFDocument({ size: 'A4', margin: 20 });
    const buffers: any[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));

    const result = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
    });

    const cardWidth = 250;
    const cardHeight = 250;
    const padding = 20;

    const cardsPerRow = 2;
    const cardsPerPage = 6;

    for (let i = 0; i < people.length; i++) {
      const person = people[i];

      // nueva página cada 6 tarjetas
      if (i > 0 && i % cardsPerPage === 0) {
        doc.addPage();
      }

      const indexInPage = i % cardsPerPage;

      const row = Math.floor(indexInPage / cardsPerRow);
      const col = indexInPage % cardsPerRow;

      const x = 20 + col * (cardWidth + padding);
      const y = 20 + row * (cardHeight + padding);

      // Determine Role
      let role = 'VISITANTE';
      let headerColor = '#A5B4FC'; // Vibrant Muted Lavender for Visitor
      let badgeColor = '#6366F1';
      let titleColor = '#FFFFFF';

      if (person.employees && person.employees.length > 0) {
        role = 'COLABORADOR';
        headerColor = '#3730A3'; // Vibrant Deep Indigo (Authority/Superiority)
        badgeColor = '#1E3A8A';
        titleColor = '#FFFFFF';
      } else if (person.students && person.students.length > 0) {
        role = 'ESTUDIANTE';
        headerColor = '#0EA5E9'; // Vibrant Sky Blue (Junior/Energy)
        badgeColor = '#0891B2';
        titleColor = '#FFFFFF';
      }

      /** CARD BACKGROUND **/
      doc.roundedRect(x, y, cardWidth, cardHeight, 10).fill('#F8FAFC');

      /** CARD BORDER **/
      doc
        .roundedRect(x, y, cardWidth, cardHeight, 10)
        .lineWidth(1)
        .strokeColor('#E2E8F0')
        .stroke();

      /** HEADER STRIPE **/
      doc
        .path(
          `M ${x + 10} ${y} L ${x + cardWidth - 10} ${y} Q ${x + cardWidth} ${y} ${x + cardWidth} ${y + 10} L ${x + cardWidth} ${y + 40} L ${x} ${y + 40} L ${x} ${y + 10} Q ${x} ${y} ${x + 10} ${y} Z`,
        )
        .fill(headerColor);

      /** TITLE **/
      doc
        .fillColor(titleColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Credencial', x, y + 15, {
          width: cardWidth,
          align: 'center',
        });

      /** QR **/
      const qrBuffer = await QRCode.toBuffer(person.documentNumber, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 90,
      });

      const qrX = x + (cardWidth - 90) / 2;
      const qrY = y + 55; // Ajustado para dar espacio al rol

      doc.rect(qrX - 5, qrY - 5, 100, 100).fill('#FFFFFF');

      doc.image(qrBuffer, qrX, qrY, { width: 90 });

      // Role Badge
      doc
        .fillColor(badgeColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(role, x, y + 155, {
          width: cardWidth,
          align: 'center',
        });

      // Names
      doc
        .fillColor('#0F172A')
        .fontSize(15)
        .font('Helvetica-Bold')
        .text(person.names, x + 10, y + 185, {
          width: cardWidth - 20,
          align: 'center',
        });

      // Surnames
      const surnames = `${person.paternalLastName} ${person.maternalLastName}`;
      doc
        .fillColor('#0F172A')
        .fontSize(15)
        .font('Helvetica-Bold')
        .text(surnames, x + 10, y + 206, {
          width: cardWidth - 20,
          align: 'center',
        });

      // Document
      doc
        .fillColor('#475569')
        .fontSize(10)
        .font('Helvetica')
        .text(`DNI: ${person.documentNumber}`, x + 10, y + 230, {
          width: cardWidth - 20,
          align: 'center',
        });
    }

    doc.end();

    return result;
  }
}
