import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from 'src/person/entities/person.entity';
import { DataSource, Repository } from 'typeorm';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { AttendanceLog } from '../entities/attendance-log.entity';
import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,

    private readonly dataSource: DataSource,
  ) {}

  async registerAttendance(params: RegisterAttendanceDto, authUserId: string) {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const person = await manager.findOne(Person, {
          where: {
            documentTypeId: params.documentTypeId,
            documentNumber: params.documentNumber,
          },
        });

        if (!person) {
          throw new NotFoundException(
            'Persona no encontrada con el documento proporcionado',
          );
        }

        const date = params.date ? new Date(params.date) : new Date();

        let attendance = await manager.findOne(Attendance, {
          where: { personId: person.id, date },
        });

        if (!attendance) {
          attendance = manager.create(Attendance, {
            personId: person.id,
            date,
          });
        }

        await manager.save(attendance);

        //verificar si ya hay algun log del mismo type el mismo dia

        const existLog = await manager.findOne(AttendanceLog, {
          where: {
            attendanceId: attendance.id,
            typeId: params.type,
          },
        });

        if (existLog) {
          const message =
            params.type === 'check_in'
              ? 'Entrada ya registrada'
              : 'Salida ya registrada';
          throw new HttpException(
            {
              success: false,
              message,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        const attendanceLog = manager.create(AttendanceLog, {
          attendanceId: attendance.id,
          typeId: params.type,
          markedAt: date,
          createdById: authUserId,
        });

        await manager.save(attendanceLog);

        return {
          success: true,
          message: 'Asistencia registrada correctamente',
          person: {
            names: person.names,
            paternalLastName: person.paternalLastName,
            maternalLastName: person.maternalLastName,
            documentNumber: person.documentNumber,
          },
        };
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new HttpException(
          {
            success: false,
            message: 'Error al registrar la asistencia',
            error: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async getAttendanceByDocument(
    documentNumber: string,
    from?: string,
    to?: string,
  ) {
    const person = await this.dataSource
      .getRepository(Person)
      .findOneBy({ documentNumber });

    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }

    const qb = this.dataSource
      .getRepository(Attendance)
      .createQueryBuilder('ad')
      .leftJoinAndSelect('ad.logs', 'log')
      .leftJoinAndSelect('log.type', 'type')
      .leftJoinAndSelect('log.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.person', 'createdByPerson')
      .where('ad.personId = :personId', { personId: person.id })
      .orderBy('ad.date', 'ASC')
      .addOrderBy('log.markedAt', 'ASC');

    if (from) qb.andWhere('ad.date >= :from', { from });
    if (to) qb.andWhere('ad.date <= :to', { to });

    return qb.getMany();
  }

  lastAttendancesDay() {
    //quiero retornar los ultimas 20 asistencias registradas, ordenadas por fecha de registro descendente

    return this.attendanceLogRepository.find({
      order: {
        markedAt: 'DESC',
      },
      take: 20,
      relations: {
        attendance: {
          person: true,
        },
        type: true,
      },
      select: {
        id: true,
        attendance: {
          id: true,
          date: true,
          person: {
            id: true,
            names: true,
            paternalLastName: true,
            maternalLastName: true,
          },
        },
        markedAt: true,
        type: {
          id: true,
          name: true,
        },
      },
    });
  }
}
