import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { RoleId } from 'src/auth/enums/role-id.enum';
import { DateUtils } from 'src/common/utils/date.utils';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { StudentGuardian } from 'src/guardian/entities/student-guardian.entity';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { Person } from 'src/person/entities/person.entity';
import { PersonService } from 'src/person/services/person.service';
import { Student } from 'src/student/entities/student.entity';
import {
  Between,
  DataSource,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { QueryAttendanceDayLogsDto } from '../dto/query-attendance-day-logs.dto';
import { QueryAttendanceHistoryDto } from '../dto/query-attendance-history.dto';
import { RegisterAttendanceDto } from '../dto/register-attendance.dto';
import { AttendanceLog } from '../entities/attendance-log.entity';
import { AttendanceSchedule } from '../entities/attendance-schedule.entity';
import { AttendanceStatus } from '../entities/attendance-status.entity';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceStatusId } from '../enums/attenance-status-id.enum';
import { AttendanceTypeId } from '../enums/attenance-type-id.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,

    private readonly dataSource: DataSource,

    private readonly personService: PersonService,

    private readonly notificationsService: NotificationsService,
  ) {}

  async registerAttendance(params: RegisterAttendanceDto, authUserId: string) {
    let notificationPayload: {
      studentPersonId: string;
      studentNames: string;
      typeId: AttendanceTypeId;
      statusId: AttendanceStatusId;
      markedAt: Date;
    } | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
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

        const dayOfWeek = DateUtils.getDayOfWeek();
        // console.log({
        //   date: date,
        //   dateString: new Date().toLocaleDateString(),
        //   getCurrentDate: DateUtils.getCurrentDate(),
        //   getCurrentTime: DateUtils.getCurrentTime(),
        //   getCurrentDateTime: DateUtils.getCurrentDateTime(),
        //   getDayOfWeek: DateUtils.getDayOfWeek(),
        //   dayOfWeek,
        //   date2: new Date(DateUtils.getCurrentDateTime()),
        // });

        const currentTime = DateUtils.getCurrentTime(); // HH:MM:SS

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
            relations: { academicYear: true },
          });

          if (!enrollment) {
            throw new NotFoundException(
              'El estudiante no tiene una matricula vigente',
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
        }

        if (!attendanceSchedule) {
          throw new NotFoundException('No hay horario activo.');
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

        const existLog = await manager.findOne(AttendanceLog, {
          where: {
            attendanceId: attendance.id,
            typeId: params.type,
          },
        });

        const personData = {
          names: person.names,
          paternalLastName: person.paternalLastName,
          maternalLastName: person.maternalLastName,
          documentNumber: person.documentNumber,
        };

        if (existLog) {
          const message =
            params.type === AttendanceTypeId.ENTRY
              ? 'Entrada ya registrada'
              : 'Salida ya registrada';
          throw new HttpException(
            {
              success: false,
              message,
              data: { person: personData },
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // Calculate attendance status based on current time and schedule
        let statusId: AttendanceStatusId;

        if (params.type === AttendanceTypeId.ENTRY) {
          if (currentTime <= attendanceSchedule.entryEnd) {
            statusId = AttendanceStatusId.ON_TIME;
          } else {
            statusId = AttendanceStatusId.LATE;
          }
        } else {
          if (currentTime >= attendanceSchedule.exit) {
            statusId = AttendanceStatusId.ON_TIME;
          } else {
            statusId = AttendanceStatusId.EARLY_EXIT;
          }
        }

        const attendanceStatus = await manager.findOne(AttendanceStatus, {
          where: { id: statusId },
        });

        if (!attendanceStatus) {
          throw new NotFoundException(`Status de asistencia no encontrado`);
        }

        const attendanceLog = manager.create(AttendanceLog, {
          attendanceId: attendance.id,
          typeId: params.type,
          statusId,
          markedAt: date,
          createdById: authUserId,
        });

        await manager.save(attendanceLog);

        notificationPayload = {
          studentPersonId: person.id,
          studentNames: person.names,
          typeId: params.type as AttendanceTypeId,
          statusId,
          markedAt: date,
        };

        return {
          success: true,
          message: 'Asistencia registrada correctamente',
          data: {
            status: {
              id: statusId,
              name: attendanceStatus.name,
            },
            person: personData,
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

    if (notificationPayload) {
      this.notifyGuardians(notificationPayload).catch(() => {});
    }

    return result;
  }

  private async notifyGuardians(payload: {
    studentPersonId: string;
    studentNames: string;
    typeId: AttendanceTypeId;
    statusId: AttendanceStatusId;
    markedAt: Date;
  }): Promise<void> {
    const student = await this.dataSource
      .getRepository(Student)
      .findOneBy({ personId: payload.studentPersonId });

    if (!student) return;

    const studentGuardians = await this.dataSource
      .getRepository(StudentGuardian)
      .find({
        where: { studentId: student.id },
        relations: { guardian: true },
      });

    if (studentGuardians.length === 0) return;

    const guardianPersonIds = studentGuardians.map(
      (sg) => sg.guardian.personId,
    );

    const users = await this.dataSource
      .getRepository(User)
      .find({ where: { personId: In(guardianPersonIds) } });

    if (users.length === 0) return;

    const firstName = payload.studentNames.split(' ')[0];
    const isEntry = payload.typeId === AttendanceTypeId.ENTRY;
    const typeLabel = isEntry ? 'Entrada' : 'Salida';
    const verb = isEntry ? 'llegó' : 'salió';

    let statusLabel: string;
    if (isEntry) {
      statusLabel =
        payload.statusId === AttendanceStatusId.ON_TIME ? 'a tiempo' : 'tarde';
    } else {
      statusLabel =
        payload.statusId === AttendanceStatusId.ON_TIME
          ? 'a tiempo'
          : 'de forma temprana';
    }

    const time = payload.markedAt.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Lima',
    });
    const dateStr = payload.markedAt.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'America/Lima',
    });

    const title = `${typeLabel} registrada · ${time}`;
    const body = `${firstName} ${verb} ${statusLabel} · ${dateStr}`;

    await Promise.all(
      users.map((u) =>
        this.notificationsService.sendToUser({
          userId: u.id,
          title,
          body,
          type: NotificationType.ATTENDANCE,
        }),
      ),
    );
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

  async getAttendanceHistory(dto: QueryAttendanceHistoryDto) {
    const { classId, studentId, academicYearId, month, year, page, limit } =
      dto;

    const enrollmentRepo = this.dataSource.getRepository(Enrollment);
    const attendanceRepo = this.dataSource.getRepository(Attendance);

    const whereClause: any = { academicYearId, isActive: true };
    if (classId) whereClause.classId = classId;
    if (studentId) whereClause.studentId = studentId;

    const [enrollments, total] = await enrollmentRepo.findAndCount({
      where: whereClause,
      relations: { student: { person: true } },
      order: {
        student: {
          person: { paternalLastName: 'ASC', maternalLastName: 'ASC' },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const personIds = enrollments.map((e) => e.student.personId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month

    const attendances =
      personIds.length > 0
        ? await attendanceRepo.find({
            where: {
              personId: In(personIds),
              date: Between(startDate, endDate),
            },
            relations: { logs: true },
          })
        : [];

    // Filter attendances by month/year in memory (date range with TypeORM Between)
    const filteredAttendances = attendances.filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    // Map: personId -> { day -> statusId }
    const attendanceMap = new Map<string, Record<number, string>>();
    for (const a of filteredAttendances) {
      const day = new Date(a.date).getDate();
      const entryLog = a.logs.find((l) => l.typeId === AttendanceTypeId.ENTRY);
      if (!entryLog) continue;
      if (!attendanceMap.has(a.personId)) {
        attendanceMap.set(a.personId, {});
      }
      attendanceMap.get(a.personId)![day] = entryLog.statusId;
    }

    const data = enrollments.map((e) => ({
      studentId: e.studentId,
      person: {
        names: e.student.person.names,
        paternalLastName: e.student.person.paternalLastName,
        maternalLastName: e.student.person.maternalLastName,
      },
      attendance: attendanceMap.get(e.student.personId) ?? {},
    }));

    return { data, total, page, limit };
  }

  async getMyAttendance(personId: string, from?: string, to?: string) {
    const qb = this.dataSource
      .getRepository(Attendance)
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.logs', 'log')
      .leftJoinAndSelect('log.type', 'type')
      .leftJoinAndSelect('log.status', 'status')
      .where('a.personId = :personId', { personId })
      .orderBy('a.date', 'ASC')
      .addOrderBy('log.markedAt', 'ASC');

    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });

    const attendances = await qb.getMany();

    return attendances.map((a) => ({
      date: a.date,
      logs: a.logs.map((log) => ({
        typeId: log.typeId,
        typeName: log.type?.name,
        statusId: log.statusId,
        statusName: log.status?.name,
        markedAt: log.markedAt,
      })),
    }));
  }

  async getStudentAttendance(studentId: string, from?: string, to?: string) {
    const student = await this.dataSource
      .getRepository(Student)
      .findOne({ where: { id: studentId } });

    if (!student) throw new NotFoundException('Estudiante no encontrado');

    return this.getMyAttendance(student.personId, from, to);
  }

  async getStudentsAttendance(
    studentIds: string[],
    from?: string,
    to?: string,
  ) {
    const students = await this.dataSource
      .getRepository(Student)
      .find({ where: { id: In(studentIds) }, relations: { person: true } });

    if (students.length === 0) return [];

    const personIds = students.map((s) => s.personId);
    const personToStudentId = new Map(students.map((s) => [s.personId, s.id]));

    const qb = this.dataSource
      .getRepository(AttendanceLog)
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.attendance', 'a')
      .innerJoinAndSelect('a.person', 'person')
      .leftJoinAndSelect('log.type', 'type')
      .leftJoinAndSelect('log.status', 'status')
      .where('a.personId IN (:...personIds)', { personIds })
      .orderBy('log.markedAt', 'ASC');

    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });

    const logs = await qb.getMany();

    return logs.map((log) => ({
      studentId: personToStudentId.get(log.attendance.personId),
      names: log.attendance.person.names,
      paternalLastName: log.attendance.person.paternalLastName,
      maternalLastName: log.attendance.person.maternalLastName,
      date: log.attendance.date,
      typeId: log.typeId,
      typeName: log.type?.name,
      statusId: log.statusId,
      statusName: log.status?.name,
      markedAt: log.markedAt,
    }));
  }

  async recalculateStatuses(): Promise<{
    total: number;
    updated: number;
    skipped: number;
  }> {
    const logs = await this.attendanceLogRepository.find({
      relations: {
        attendance: { attendanceSchedule: true },
      },
    });

    let updated = 0;
    let skipped = 0;
    const toUpdate: AttendanceLog[] = [];

    for (const log of logs) {
      const schedule = log.attendance?.attendanceSchedule;
      if (!schedule) {
        skipped++;
        continue;
      }

      const markedAtTime = DateUtils.getTimeFromDate(log.markedAt);

      let newStatusId: AttendanceStatusId;

      if (log.typeId === AttendanceTypeId.ENTRY) {
        newStatusId =
          markedAtTime <= schedule.entryEnd
            ? AttendanceStatusId.ON_TIME
            : AttendanceStatusId.LATE;
      } else {
        newStatusId =
          markedAtTime >= schedule.exit
            ? AttendanceStatusId.ON_TIME
            : AttendanceStatusId.EARLY_EXIT;
      }

      if (log.statusId !== newStatusId) {
        log.statusId = newStatusId;
        toUpdate.push(log);
        updated++;
      } else {
        skipped++;
      }
    }

    if (toUpdate.length > 0) {
      await this.attendanceLogRepository.save(toUpdate);
    }

    return { total: logs.length, updated, skipped };
  }

  async getAttendanceDayStudents(
    academicYearId: string,
    date: string,
    classId?: string,
  ) {
    const enrollmentRepo = this.dataSource.getRepository(Enrollment);
    const whereClause: any = { academicYearId, isActive: true };
    if (classId) whereClause.classId = classId;

    const enrollments = await enrollmentRepo.find({
      where: whereClause,
      relations: { student: { person: true }, class: true },
      order: { class: { name: 'ASC' } },
    });

    if (enrollments.length === 0) return [];

    const personIds = enrollments.map((e) => e.student.personId);

    const logs = await this.dataSource
      .getRepository(AttendanceLog)
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.attendance', 'att')
      .leftJoinAndSelect('log.status', 'status')
      .where('att.personId IN (:...personIds)', { personIds })
      .andWhere('att.date = :date', { date })
      .getMany();

    const logsByPerson = new Map<string, AttendanceLog[]>();
    for (const log of logs) {
      const pid = log.attendance.personId;
      if (!logsByPerson.has(pid)) logsByPerson.set(pid, []);
      logsByPerson.get(pid)!.push(log);
    }

    return enrollments.map((e) => {
      const person = e.student.person;
      const studentLogs = logsByPerson.get(person.id) ?? [];
      const entryLog = studentLogs.find(
        (l) => l.typeId === AttendanceTypeId.ENTRY,
      );
      const exitLog = studentLogs.find(
        (l) => l.typeId === AttendanceTypeId.EXIT,
      );
      return {
        studentId: e.studentId,
        person: {
          names: person.names,
          paternalLastName: person.paternalLastName,
          maternalLastName: person.maternalLastName,
          documentNumber: person.documentNumber,
          documentTypeId: person.documentTypeId,
        },

        className: e.class.name,
        classId: e.classId,
        entry: entryLog
          ? {
              statusId: entryLog.statusId,
              statusName: entryLog.status?.name ?? null,
              markedAt: entryLog.markedAt,
            }
          : null,
        exit: exitLog ? { markedAt: exitLog.markedAt } : null,
      };
    });
  }

  async getAttendanceDayLogs(dto: QueryAttendanceDayLogsDto) {
    const { classId, studentId, academicYearId, date, page, limit } = dto;

    const enrollmentRepo = this.dataSource.getRepository(Enrollment);
    const whereClause: any = { academicYearId, isActive: true };
    if (classId) whereClause.classId = classId;
    if (studentId) whereClause.studentId = studentId;

    const enrollments = await enrollmentRepo.find({
      where: whereClause,
      relations: { student: true },
    });

    const personIds = enrollments.map((e) => e.student.personId);
    if (personIds.length === 0) return { data: [], total: 0, page, limit };

    const [logs, total] = await this.dataSource
      .getRepository(AttendanceLog)
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.attendance', 'att')
      .innerJoinAndSelect('att.person', 'person')
      .leftJoinAndSelect('log.type', 'type')
      .leftJoinAndSelect('log.status', 'status')
      .leftJoinAndSelect('log.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.person', 'createdByPerson')
      .where('att.personId IN (:...personIds)', { personIds })
      .andWhere('att.date = :date', { date })
      .orderBy('log.markedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = logs.map((log) => ({
      id: log.id,
      person: {
        names: log.attendance.person.names,
        paternalLastName: log.attendance.person.paternalLastName,
        maternalLastName: log.attendance.person.maternalLastName,
      },
      typeId: log.typeId,
      typeName: log.type?.name,
      statusId: log.statusId,
      statusName: log.status?.name,
      markedAt: log.markedAt,
      date: log.attendance.date,
      registeredBy: log.createdBy?.person
        ? {
            names: log.createdBy.person.names,
            paternalLastName: log.createdBy.person.paternalLastName,
            maternalLastName: log.createdBy.person.maternalLastName,
          }
        : null,
    }));

    return { data, total, page, limit };
  }
}
