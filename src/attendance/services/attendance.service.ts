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
import { AttendanceLogsDto } from '../dto/attendance-logs.dto';
import { BaseRankingDto } from '../dto/attendance-rankings.dto';
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
                startDate: LessThanOrEqual(DateUtils.formatDate(date)),
                endDate: MoreThanOrEqual(DateUtils.formatDate(date)),
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

  async getStudentAttendances(
    academicYearId: string,
    date: string,
    classId?: string,
  ) {
    const params: any[] = [academicYearId, date];
    let idx = 3;

    const classFilter = classId ? `AND e.class_id = $${idx++}` : '';
    if (classId) params.push(classId);

    const rows = await this.dataSource.query(
      `
      SELECT
        e.student_id                        AS "studentId",
        p.names                             AS names,
        p.paternal_last_name                AS "paternalLastName",
        p.maternal_last_name                AS "maternalLastName",
        p.document_number                   AS "documentNumber",
        p.document_type_id                  AS "documentTypeId",
        c.id                                AS "classId",
        c.name                              AS "className",
        -- entry log
        entry_l.status_id                   AS "entryStatusId",
        entry_s.name                        AS "entryStatusName",
        entry_l.marked_at                   AS "entryMarkedAt",
        -- exit log
        exit_l.status_id                    AS "exitStatusId",
        exit_s.name                         AS "exitStatusName",
        exit_l.marked_at                    AS "exitMarkedAt"
      FROM enrollments e
      JOIN students s       ON s.id = e.student_id
      JOIN people p         ON p.id = s.person_id
      JOIN classes c        ON c.id = e.class_id
      LEFT JOIN attendances a
        ON a.person_id = p.id AND a.date = $2
      LEFT JOIN attendance_logs entry_l
        ON entry_l.attendance_id = a.id AND entry_l.type_id = 'entry'
      LEFT JOIN attendance_statuses entry_s
        ON entry_s.id = entry_l.status_id
      LEFT JOIN attendance_logs exit_l
        ON exit_l.attendance_id = a.id AND exit_l.type_id = 'exit'
      LEFT JOIN attendance_statuses exit_s
        ON exit_s.id = exit_l.status_id
      WHERE e.academic_year_id = $1
        AND e.is_active = true
        ${classFilter}
      ORDER BY p.paternal_last_name ASC, p.names ASC
      `,
      params,
    );

    return rows.map((r: any) => ({
      studentId: r.studentId,
      person: {
        names: r.names,
        paternalLastName: r.paternalLastName,
        maternalLastName: r.maternalLastName,
        documentNumber: r.documentNumber,
        documentTypeId: r.documentTypeId,
      },
      classId: r.classId,
      className: r.className,
      entry: r.entryMarkedAt
        ? {
            statusId: r.entryStatusId,
            statusName: r.entryStatusName,
            markedAt: r.entryMarkedAt,
          }
        : null,
      exit: r.exitMarkedAt
        ? {
            statusId: r.exitStatusId,
            statusName: r.exitStatusName,
            markedAt: r.exitMarkedAt,
          }
        : null,
    }));
  }

  /**
   * Ranking de puntualidad.
   *
   * Criterios de ordenamiento:
   *   1. `punctualityRate` DESC  — porcentaje de días asistidos a tiempo
   *      sobre el total de días requeridos de la clase:
   *      `(onTimeCount / totalDays) * 100`
   *   2. `earlyMinutes` DESC  — promedio de minutos de anticipación por día a tiempo
   *      (cuántos minutos antes del límite de entrada llegó en promedio),
   *      usado como desempate cuando dos alumnos tienen el mismo rate.
   *
   * Solo incluye alumnos con matrícula activa en el año académico dado.
   * `totalDays` se calcula como los días distintos en que al menos un alumno
   * de la clase registró entrada (días "activos" de la clase).
   */
  async getPunctualityRanking(dto: BaseRankingDto) {
    const { academicYearId, classId, from, to } = dto;
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const params: any[] = [academicYearId];
    let idx = 2;

    const classFilter = classId ? `AND e.class_id = $${idx++}` : '';
    if (classId) params.push(classId);

    const fromIdx = from ? idx++ : null;
    if (from) params.push(from);
    const toIdx = to ? idx++ : null;
    if (to) params.push(to);

    // Two alias variants for the same $n params
    const fromFilterCte = fromIdx ? `AND a2.date >= $${fromIdx}` : '';
    const toFilterCte = toIdx ? `AND a2.date <= $${toIdx}` : '';
    const fromFilter = fromIdx ? `AND a.date >= $${fromIdx}` : '';
    const toFilter = toIdx ? `AND a.date <= $${toIdx}` : '';

    params.push(limit, offset);
    const limitIdx = idx++;
    const offsetIdx = idx++;

    const rows = await this.dataSource.query(
      `
      WITH active_days AS (
        -- Days where at least one student of the class registered an entry
        SELECT e2.class_id, a2.date
        FROM enrollments e2
        JOIN students s2       ON s2.id = e2.student_id
        JOIN attendances a2    ON a2.person_id = s2.person_id
        JOIN attendance_logs l2
          ON l2.attendance_id = a2.id
          AND l2.type_id = 'entry'
        WHERE e2.academic_year_id = $1
          AND e2.is_active = true
          ${fromFilterCte}
          ${toFilterCte}
        GROUP BY e2.class_id, a2.date
      ),
      required_days AS (
        -- Count of active days per class
        SELECT class_id, COUNT(*)::int AS total_days
        FROM active_days
        GROUP BY class_id
      )
      SELECT
        e.student_id                          AS "studentId",
        p.names                               AS names,
        p.paternal_last_name                  AS "paternalLastName",
        p.maternal_last_name                  AS "maternalLastName",
        c.name                                AS "className",
        COUNT(*) FILTER (
          WHERE l.status_id = 'on_time'
        )::int                                AS "onTimeCount",
        COALESCE(rd.total_days, 0)            AS "totalDays",
        CASE WHEN COALESCE(rd.total_days, 0) > 0
          THEN ROUND(
            COUNT(*) FILTER (WHERE l.status_id = 'on_time')::numeric
            / rd.total_days * 100,
            2
          )
          ELSE 0
        END                                   AS "punctualityRate",
        COALESCE(
          AVG(
            CASE WHEN l.status_id = 'on_time' THEN
              GREATEST(
                EXTRACT(EPOCH FROM (
                  sch.entry_end::time - (l.marked_at AT TIME ZONE 'America/Lima')::time
                )) / 60,
                0
              )
            END
          ),
          0
        )                                     AS "earlyMinutes",
        TO_CHAR(
          (AVG(
            CASE WHEN l.status_id = 'on_time' THEN
              EXTRACT(EPOCH FROM (l.marked_at AT TIME ZONE 'America/Lima')::time)
            END
          ) || ' seconds')::interval,
          'HH12:MI AM'
        )                                     AS "avgEntryTime",
        COUNT(*) OVER ()::int                 AS total
      FROM enrollments e
      JOIN students s         ON s.id = e.student_id
      JOIN people p           ON p.id = s.person_id
      JOIN classes c          ON c.id = e.class_id
      LEFT JOIN required_days rd ON rd.class_id = e.class_id
      LEFT JOIN attendances a ON a.person_id = p.id
        ${fromFilter}
        ${toFilter}
      LEFT JOIN attendance_logs l
        ON l.attendance_id = a.id
        AND l.type_id = 'entry'
      LEFT JOIN attendance_schedules sch
        ON sch.id = a.attendance_schedule_id
      WHERE e.academic_year_id = $1
        AND e.is_active = true
        ${classFilter}
      GROUP BY e.student_id, p.id, c.name, rd.total_days
      ORDER BY "punctualityRate" DESC, "earlyMinutes" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      params,
    );

    const total: number = rows[0]?.total ?? 0;
    const data = rows.map((r: any) => ({
      studentId: r.studentId,
      person: {
        names: r.names,
        paternalLastName: r.paternalLastName,
        maternalLastName: r.maternalLastName,
      },
      className: r.className,
      onTimeCount: r.onTimeCount,
      totalDays: r.totalDays,
      punctualityRate: parseFloat(r.punctualityRate),
      earlyMinutes: parseFloat(r.earlyMinutes),
      avgEntryTime: r.avgEntryTime ?? null,
    }));

    return { data, total, page, limit };
  }

  /**
   * Ranking de tardanzas.
   *
   * Criterios de ordenamiento:
   *   1. `tardinessRate` DESC  — porcentaje de días con tardanza
   *      sobre el total de días requeridos de la clase:
   *      `(tardinessCount / totalDays) * 100`
   *   2. `lateMinutes` DESC  — promedio de minutos de tardanza por día tarde
   *      (cuántos minutos después del límite de entrada llegó en promedio),
   *      usado como desempate cuando dos alumnos tienen el mismo rate.
   *
   * Solo aparecen alumnos con al menos 1 tardanza (`HAVING tardinessCount > 0`).
   * `totalDays` se calcula igual que en puntualidad: días activos de la clase.
   */
  async getTardinessRanking(dto: BaseRankingDto) {
    const { academicYearId, classId, from, to } = dto;
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const params: any[] = [academicYearId];
    let idx = 2;

    const classFilter = classId ? `AND e.class_id = $${idx++}` : '';
    if (classId) params.push(classId);

    const fromIdx = from ? idx++ : null;
    if (from) params.push(from);
    const toIdx = to ? idx++ : null;
    if (to) params.push(to);

    const fromFilterCte = fromIdx ? `AND a2.date >= $${fromIdx}` : '';
    const toFilterCte = toIdx ? `AND a2.date <= $${toIdx}` : '';
    const fromFilter = fromIdx ? `AND a.date >= $${fromIdx}` : '';
    const toFilter = toIdx ? `AND a.date <= $${toIdx}` : '';

    params.push(limit, offset);
    const limitIdx = idx++;
    const offsetIdx = idx++;

    const rows = await this.dataSource.query(
      `
      WITH active_days AS (
        SELECT e2.class_id, a2.date
        FROM enrollments e2
        JOIN students s2       ON s2.id = e2.student_id
        JOIN attendances a2    ON a2.person_id = s2.person_id
        JOIN attendance_logs l2
          ON l2.attendance_id = a2.id
          AND l2.type_id = 'entry'
        WHERE e2.academic_year_id = $1
          AND e2.is_active = true
          ${fromFilterCte}
          ${toFilterCte}
        GROUP BY e2.class_id, a2.date
      ),
      required_days AS (
        SELECT class_id, COUNT(*)::int AS total_days
        FROM active_days
        GROUP BY class_id
      )
      SELECT
        e.student_id                          AS "studentId",
        p.names                               AS names,
        p.paternal_last_name                  AS "paternalLastName",
        p.maternal_last_name                  AS "maternalLastName",
        c.name                                AS "className",
        COUNT(*) FILTER (
          WHERE l.status_id = 'late'
        )::int                                AS "tardinessCount",
        COALESCE(rd.total_days, 0)            AS "totalDays",
        CASE WHEN COALESCE(rd.total_days, 0) > 0
          THEN ROUND(
            COUNT(*) FILTER (WHERE l.status_id = 'late')::numeric
            / rd.total_days * 100,
            2
          )
          ELSE 0
        END                                   AS "tardinessRate",
        COALESCE(
          AVG(
            CASE WHEN l.status_id = 'late' THEN
              GREATEST(
                EXTRACT(EPOCH FROM (
                  (l.marked_at AT TIME ZONE 'America/Lima')::time - sch.entry_end::time
                )) / 60,
                0
              )
            END
          ),
          0
        )                                     AS "lateMinutes",
        TO_CHAR(
          (AVG(
            CASE WHEN l.status_id = 'late' THEN
              EXTRACT(EPOCH FROM (l.marked_at AT TIME ZONE 'America/Lima')::time)
            END
          ) || ' seconds')::interval,
          'HH12:MI AM'
        )                                     AS "avgEntryTime",
        COUNT(*) OVER ()::int                 AS total
      FROM enrollments e
      JOIN students s         ON s.id = e.student_id
      JOIN people p           ON p.id = s.person_id
      JOIN classes c          ON c.id = e.class_id
      LEFT JOIN required_days rd ON rd.class_id = e.class_id
      LEFT JOIN attendances a ON a.person_id = p.id
        ${fromFilter}
        ${toFilter}
      LEFT JOIN attendance_logs l
        ON l.attendance_id = a.id
        AND l.type_id = 'entry'
      LEFT JOIN attendance_schedules sch
        ON sch.id = a.attendance_schedule_id
      WHERE e.academic_year_id = $1
        AND e.is_active = true
        ${classFilter}
      GROUP BY e.student_id, p.id, c.name, rd.total_days
      HAVING COUNT(*) FILTER (WHERE l.status_id = 'late') > 0
      ORDER BY "tardinessRate" DESC, "lateMinutes" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      params,
    );

    const total: number = rows[0]?.total ?? 0;
    const data = rows.map((r: any) => ({
      studentId: r.studentId,
      person: {
        names: r.names,
        paternalLastName: r.paternalLastName,
        maternalLastName: r.maternalLastName,
      },
      className: r.className,
      tardinessCount: r.tardinessCount,
      totalDays: r.totalDays,
      tardinessRate: parseFloat(r.tardinessRate),
      lateMinutes: parseFloat(r.lateMinutes),
      avgEntryTime: r.avgEntryTime ?? null,
    }));

    return { data, total, page, limit };
  }

  /**
   * Ranking de ausencias.
   *
   * Criterios de ordenamiento:
   *   1. `absenceRate` DESC  — porcentaje de días ausente
   *      sobre el total de días requeridos de la clase:
   *      `(absenceCount / totalDays) * 100`
   *   2. `absenceCount` DESC  — cantidad absoluta de ausencias,
   *      usado como desempate cuando dos alumnos tienen el mismo rate.
   *
   * Una ausencia se contabiliza por cada día activo de la clase en que el alumno
   * no registró ningún log de entrada. Solo aparecen alumnos con al menos 1 ausencia.
   * `totalDays` se calcula igual que en puntualidad: días activos de la clase.
   */
  async getAbsencesRanking(dto: BaseRankingDto) {
    const { academicYearId, classId, from, to } = dto;
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    const params: any[] = [academicYearId];
    let idx = 2;

    const classFilter = classId ? `AND e.class_id = $${idx++}` : '';
    if (classId) params.push(classId);

    const fromIdx = from ? idx++ : null;
    if (from) params.push(from);
    const toIdx = to ? idx++ : null;
    if (to) params.push(to);

    const fromFilterCte = fromIdx ? `AND a2.date >= $${fromIdx}` : '';
    const toFilterCte = toIdx ? `AND a2.date <= $${toIdx}` : '';

    params.push(limit, offset);
    const limitIdx = idx++;
    const offsetIdx = idx++;

    const rows = await this.dataSource.query(
      `
      WITH active_days AS (
        SELECT e2.class_id, a2.date
        FROM enrollments e2
        JOIN students s2       ON s2.id = e2.student_id
        JOIN attendances a2    ON a2.person_id = s2.person_id
        JOIN attendance_logs l2
          ON l2.attendance_id = a2.id
          AND l2.type_id = 'entry'
        WHERE e2.academic_year_id = $1
          AND e2.is_active = true
          ${fromFilterCte}
          ${toFilterCte}
        GROUP BY e2.class_id, a2.date
      ),
      required_days AS (
        SELECT class_id, COUNT(*)::int AS total_days
        FROM active_days
        GROUP BY class_id
      ),
      attended_days AS (
        -- Days each student actually registered an entry log
        SELECT e2.student_id, a2.date
        FROM enrollments e2
        JOIN students s2    ON s2.id = e2.student_id
        JOIN attendances a2 ON a2.person_id = s2.person_id
        JOIN attendance_logs l2
          ON l2.attendance_id = a2.id
          AND l2.type_id = 'entry'
        WHERE e2.academic_year_id = $1
          AND e2.is_active = true
          ${fromFilterCte}
          ${toFilterCte}
        GROUP BY e2.student_id, a2.date
      ),
      absence_counts AS (
        -- Active days the student did NOT attend
        SELECT e.student_id, COUNT(*)::int AS absence_count
        FROM enrollments e
        JOIN required_days rd ON rd.class_id = e.class_id
        JOIN active_days ad   ON ad.class_id = e.class_id
        LEFT JOIN attended_days atd
          ON atd.student_id = e.student_id
          AND atd.date = ad.date
        WHERE e.academic_year_id = $1
          AND e.is_active = true
          AND atd.student_id IS NULL  -- no attendance on that active day
        GROUP BY e.student_id
      )
      SELECT
        e.student_id                          AS "studentId",
        p.names                               AS names,
        p.paternal_last_name                  AS "paternalLastName",
        p.maternal_last_name                  AS "maternalLastName",
        c.name                                AS "className",
        COALESCE(ac.absence_count, 0)         AS "absenceCount",
        COALESCE(rd.total_days, 0)            AS "totalDays",
        CASE WHEN COALESCE(rd.total_days, 0) > 0
          THEN ROUND(
            COALESCE(ac.absence_count, 0)::numeric
            / rd.total_days * 100,
            2
          )
          ELSE 0
        END                                   AS "absenceRate",
        COUNT(*) OVER ()::int                 AS total
      FROM enrollments e
      JOIN students s         ON s.id = e.student_id
      JOIN people p           ON p.id = s.person_id
      JOIN classes c          ON c.id = e.class_id
      LEFT JOIN required_days rd ON rd.class_id = e.class_id
      LEFT JOIN absence_counts ac ON ac.student_id = e.student_id
      WHERE e.academic_year_id = $1
        AND e.is_active = true
        ${classFilter}
        AND COALESCE(ac.absence_count, 0) > 0
      ORDER BY "absenceRate" DESC, "absenceCount" DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      params,
    );

    const total: number = rows[0]?.total ?? 0;
    const data = rows.map((r: any) => ({
      studentId: r.studentId,
      person: {
        names: r.names,
        paternalLastName: r.paternalLastName,
        maternalLastName: r.maternalLastName,
      },
      className: r.className,
      absenceCount: r.absenceCount,
      totalDays: r.totalDays,
      absenceRate: parseFloat(r.absenceRate),
    }));

    return { data, total, page, limit };
  }

  async getAttendanceLogs(dto: AttendanceLogsDto) {
    const {
      classId,
      studentId,
      academicYearId,
      date,
      pagination: { page, limit },
    } = dto;

    const enrollmentRepo = this.dataSource.getRepository(Enrollment);
    const whereClause: any = { isActive: true };
    if (classId) whereClause.classId = classId;
    if (studentId) whereClause.studentId = studentId;
    if (academicYearId) whereClause.academicYearId = academicYearId;

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
      registeredBy: {
        names: log.createdBy.person.names,
        paternalLastName: log.createdBy.person.paternalLastName,
        maternalLastName: log.createdBy.person.maternalLastName,
      },
    }));

    return { data, total, pagination: { page, limit } };
  }
}
