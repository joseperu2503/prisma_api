import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Role } from 'src/auth/entities/role.entity';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { CreatePersonDto } from '../dto/create-person.dto';
import { FindOrCreatePersonDto } from '../dto/find-or-create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { Person } from '../entities/person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly dataSource: DataSource,
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

      if (roles.length === 0) {
        continue;
      }

      const role = roles[0];

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

      if (role.id === RoleId.ADMIN) {
        headerColor = '#1E1B4B'; // Midnight Blue (Supreme Authority)
        badgeColor = '#312E81';
      } else if (role.id === RoleId.STUDENT) {
        headerColor = '#375FFF'; // Vibrant Sky Blue (Junior/Energy)
        badgeColor = '#375FFF';
      } else if (role.id === RoleId.EMPLOYEE) {
        // All employee roles get a professional Indigo theme
        headerColor = '#3730A3';
        badgeColor = '#1E3A8A';
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

  async search(query?: string, page = 1, limit = 10) {
    const qb = this.personRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.names',
        'p.paternalLastName',
        'p.maternalLastName',
        'p.documentNumber',
        'p.documentTypeId',
        'p.email',
        'p.phone',
        'p.address',
      ])
      .orderBy('p.paternalLastName', 'ASC')
      .addOrderBy('p.names', 'ASC');

    if (query) {
      qb.where(
        'LOWER(p.names) LIKE :q OR LOWER(p.paternalLastName) LIKE :q OR LOWER(p.maternalLastName) LIKE :q OR p.documentNumber LIKE :q',
        { q: `%${query.toLowerCase()}%` },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, pagination: { page, limit } };
  }

  async findByDocument(documentTypeId: string, documentNumber: string) {
    return this.personRepository.findOne({
      where: { documentTypeId, documentNumber },
    });
  }

  async createPerson(dto: CreatePersonDto, runner?: QueryRunner) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const { ...newPerson } = dto;

      let person: Person | null = null;

      const existingPerson = await queryRunner.manager.findOne(Person, {
        where: {
          documentTypeId: newPerson.documentTypeId,
          documentNumber: newPerson.documentNumber,
        },
      });

      if (existingPerson) {
        throw new HttpException(
          {
            success: false,
            message: 'Ya existe una persona con ese documento',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      person = queryRunner.manager.create(Person, { ...newPerson });
      person = await queryRunner.manager.save(person);

      return person;
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Ocurrió un error al crear la persona',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
    }
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.personRepository.findOne({ where: { id } });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    return person;
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    const person = await this.findOne(id);

    if (dto.documentTypeId || dto.documentNumber) {
      const documentTypeId = dto.documentTypeId ?? person.documentTypeId;
      const documentNumber = dto.documentNumber ?? person.documentNumber;

      const duplicate = await this.personRepository.findOne({
        where: { documentTypeId, documentNumber, id: Not(id) },
      });

      if (duplicate) {
        throw new HttpException(
          {
            success: false,
            message: 'Ya existe una persona con ese tipo y número de documento',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.assign(person, dto);
    return this.personRepository.save(person);
  }

  async remove(id: string): Promise<void> {
    const person = await this.findOne(id);
    await this.personRepository.remove(person);
  }

  async updateOrCreatePerson(dto: CreatePersonDto, runner?: QueryRunner) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      const { ...newPerson } = dto;

      let person: Person | null = null;

      const existingPerson = await queryRunner.manager.findOne(Person, {
        where: {
          documentTypeId: newPerson.documentTypeId,
          documentNumber: newPerson.documentNumber,
        },
      });

      if (existingPerson) {
        queryRunner.manager.merge(Person, existingPerson, newPerson);
        person = await queryRunner.manager.save(existingPerson);
      } else {
        person = queryRunner.manager.create(Person, { ...newPerson });
        person = await queryRunner.manager.save(person);
      }

      return person;
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the person',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
    }
  }

  async findOrCreate(personDto: FindOrCreatePersonDto, runner?: QueryRunner) {
    const queryRunner = runner ?? this.dataSource.createQueryRunner();
    const isExternalTransaction = !!runner;

    if (!isExternalTransaction) {
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }

    try {
      let person: Person;
      if (personDto.id) {
        const found = await queryRunner.manager.findOne(Person, {
          where: { id: personDto.id },
        });
        if (!found) {
          throw new NotFoundException(`Persona no encontrada`);
        }
        person = found;
      } else if (personDto.new) {
        person = await this.createPerson(personDto.new, queryRunner);
      } else {
        throw new HttpException(
          {
            success: false,
            message: 'Debes proporcionar id o datos de nueva persona',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!isExternalTransaction) {
        await queryRunner.commitTransaction();
      }

      return person;
      
    } catch (error) {
      if (!isExternalTransaction) {
        await queryRunner.rollbackTransaction();
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'An error occurred while creating the person',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      if (!isExternalTransaction) {
        await queryRunner.release();
      }
    }
  }
}
