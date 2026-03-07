import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Role } from 'src/auth/entities/role.entity';
import { In, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getRoles(documentNumber: string) {
    const roles = await this.roleRepository.find({
      where: {
        personRoles: {
          person: {
            documentNumber: documentNumber,
          },
        },
      },
    });

    return roles;
  }

  async generateQrPdf(documentNumbers: string[]): Promise<Buffer> {
    const people = await this.personRepository.find({
      where: { documentNumber: In(documentNumbers) },
      relations: ['personRoles', 'personRoles.role'],
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

      const roles = person.personRoles.map((pr) => pr.role);
      console.log({ roles });

      if (roles.length === 0) {
        continue;
      }

      // Prioritize roles marked as isEmployee, then by specific codes
      const prioritizedRoleCodes = ['ADMIN', 'STUDENT'];
      const role = roles.sort((a, b) => {
        if (a.isEmployee && !b.isEmployee) return -1;
        if (!a.isEmployee && b.isEmployee) return 1;

        const indexA = prioritizedRoleCodes.indexOf(a.code);
        const indexB = prioritizedRoleCodes.indexOf(b.code);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      })[0];

      // nueva página cada 6 tarjetas
      if (i > 0 && i % cardsPerPage === 0) {
        doc.addPage();
      }

      const indexInPage = i % cardsPerPage;

      const row = Math.floor(indexInPage / cardsPerRow);
      const col = indexInPage % cardsPerRow;

      const x = 20 + col * (cardWidth + padding);
      const y = 20 + row * (cardHeight + padding);

      // Determine Role styling
      let headerColor = '#A5B4FC'; // Vibrant Muted Lavender for Visitor
      let badgeColor = '#6366F1';
      let titleColor = '#FFFFFF';

      if (role.code === 'ADMIN') {
        headerColor = '#1E1B4B'; // Midnight Blue (Supreme Authority)
        badgeColor = '#312E81';
      } else if (role.code === 'STUDENT') {
        headerColor = '#0EA5E9'; // Vibrant Sky Blue (Junior/Energy)
        badgeColor = '#0891B2';
      } else if (role.isEmployee) {
        // All employee roles get a professional Indigo theme
        headerColor = '#3730A3';
        badgeColor = '#1E3A8A';

        // Specific highlight for Teachers
        if (role.code === 'TEACHER') {
          headerColor = '#4338CA';
        }
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
        .text('CREDENCIAL', x, y + 15, {
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
      const badgeWidth = 140;
      const badgeHeight = 22;
      const badgeX = x + (cardWidth - badgeWidth) / 2;
      const badgeY = y + 152;

      doc
        .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 5)
        .fill(badgeColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(role.name.toUpperCase(), badgeX, badgeY + 6, {
          width: badgeWidth,
          align: 'center',
        });

      // Names
      doc
        .fillColor('#0F172A')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(person.names.toUpperCase(), x + 10, y + 185, {
          width: cardWidth - 20,
          align: 'center',
        });

      // Surnames
      const surnames = `${person.paternalLastName} ${person.maternalLastName}`;
      doc
        .fillColor('#0F172A')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(surnames.toUpperCase(), x + 10, y + 206, {
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
