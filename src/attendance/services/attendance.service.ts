import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/services/person.service';
import {
  Between,
  DataSource,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { AttendanceLog } from '../entities/attendance-log.entity';
import { AttendanceSchedule } from '../entities/attendance-schedule.entity';
import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,

    private readonly dataSource: DataSource,

    private readonly personService: PersonService,
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

        //buscar roles de la persona
        const roles = await this.personService.getRoles(params.documentNumber);

        if (roles.length === 0) {
          throw new NotFoundException(
            'No se encontraron roles para la persona con el documento proporcionado',
          );
        }

        const role = roles[0];

        if (role.id !== RoleId.STUDENT) {
          throw new NotFoundException(
            'Por el momento solo se admiten asistencias para estudiantes',
          );
        }

        const date = params.date ? new Date(params.date) : new Date();

        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        // Convert to 0 = Monday, 6 = Sunday for database
        const dayOfWeek = (date.getDay() + 6) % 7;

        // console.log({
        //   date: date,
        //   dateString: new Date().toLocaleDateString(),
        //   getCurrentDate: DateUtils.getCurrentDate(),
        //   getCurrentTime: DateUtils.getCurrentTime(),
        //   getCurrentDateTime: DateUtils.getCurrentDateTime(),
        //   getDayOfWeek: DateUtils.getDayOfWeek(),
        //   dayOfWeek,
        // });

        let attendanceSchedule: AttendanceSchedule | null = null;

        if (role.id === RoleId.STUDENT) {
          //buscar la matricula actual del estudiante segun la fecha actual conincida con alguna matricula con fecha de incicio y fin
          const enrollment = await manager.findOne(Enrollment, {
            where: {
              student: {
                personId: person.id,
              },
              academicYear: {
                startDate: LessThanOrEqual(date),
                endDate: MoreThanOrEqual(date),
              },
            },
          });

          if (!enrollment) {
            throw new NotFoundException(
              'El estudiante no tiene una matricula vigente para la fecha actual',
            );
          }

          attendanceSchedule = await manager.findOne(AttendanceSchedule, {
            where: {
              isActive: true,
              dayOfWeek,
              attendanceScheduleGroup: {
                classAcademicYear: {
                  classId: enrollment.classId,
                  academicYearId: enrollment.academicYearId,
                },
              },
            },
          });

          if (!attendanceSchedule) {
            throw new NotFoundException('No se encontró horario.');
          }
        }

        let attendance = await manager.findOne(Attendance, {
          where: {
            personId: person.id,
            date: date,
            attendanceScheduleId: attendanceSchedule?.id,
            roleId: role.id,
          },
        });

        if (!attendance) {
          attendance = manager.create(Attendance, {
            personId: person.id,
            date: date,
            attendanceScheduleId: attendanceSchedule?.id,
            roleId: role.id,
          });
        }

        await manager.save(attendance);

        //verificar si ya hay algun log del mismo type el mismo dia

        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const existLog = await manager.findOne(AttendanceLog, {
          where: {
            markedAt: Between(start, end),
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
