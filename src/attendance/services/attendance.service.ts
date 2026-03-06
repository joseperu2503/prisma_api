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
import { AttendanceDay } from '../entities/attendance-day.entity';
import { AttendanceLog } from '../entities/attendance-log.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,

    private readonly dataSource: DataSource,
  ) {}

  async registerAttendance(params: RegisterAttendanceDto) {
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

        const today = new Date();

        let attendanceDay = await manager.findOne(AttendanceDay, {
          where: { personId: person.id, date: today },
        });

        if (!attendanceDay) {
          attendanceDay = manager.create(AttendanceDay, {
            personId: person.id,
            date: today,
          });
        }

        await manager.save(attendanceDay);

        //verificar si ya hay algun log del mismo type el mismo dia

        const existLog = await manager.findOne(AttendanceLog, {
          where: {
            attendanceDayId: attendanceDay.id,
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
          attendanceDayId: attendanceDay.id,
          typeId: params.type,
          markedAt: today,
        });

        await manager.save(attendanceLog);

        return {
          success: true,
          message: 'Asistencia registrada correctamente',
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

  lastAttendancesDay() {
    //quiero retornar los ultimas 20 asistencias registradas, ordenadas por fecha de registro descendente

    return this.attendanceLogRepository.find({
      order: {
        markedAt: 'DESC',
      },
      take: 20,
      relations: {
        attendanceDay: {
          person: true,
        },
        type: true,
      },
      select: {
        id: true,
        attendanceDay: {
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
