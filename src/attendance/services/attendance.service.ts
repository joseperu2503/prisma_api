import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/student/entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { RegisterStudentAttendanceRequestDto } from '../dto/register-student-request.dto';
import { StudentAttendanceDay } from '../entities/student-attendance-day.entity';
import { StudentAttendanceDayLog } from '../entities/student-attendance-log.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(StudentAttendanceDayLog)
    private readonly studentAttendanceDayLogRepository: Repository<StudentAttendanceDayLog>,

    private readonly dataSource: DataSource,
  ) {}

  async registerStudent(params: RegisterStudentAttendanceRequestDto) {
    return await this.dataSource.transaction(async (manager) => {
      try {
        const student = await manager.findOne(Student, {
          where: { id: params.studentId },
        });

        if (!student) {
          throw new NotFoundException('Estudiante no encontrado');
        }

        const today = new Date();

        let studentAttendanceDay = await manager.findOne(StudentAttendanceDay, {
          where: { studentId: student.id, date: today },
        });

        if (!studentAttendanceDay) {
          studentAttendanceDay = manager.create(StudentAttendanceDay, {
            studentId: student.id,
            date: today,
          });
        }

        await manager.save(studentAttendanceDay);

        //verificar si ya hay algun log del mismo type el mismo dia

        const existLog = await manager.findOne(StudentAttendanceDayLog, {
          where: {
            attendanceDayId: studentAttendanceDay.id,
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

        const studentAttendanceDayLog = manager.create(
          StudentAttendanceDayLog,
          {
            attendanceDayId: studentAttendanceDay.id,
            typeId: params.type,
            markedAt: today,
          },
        );

        await manager.save(studentAttendanceDayLog);

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

    return this.studentAttendanceDayLogRepository.find({
      order: {
        markedAt: 'DESC',
      },
      take: 20,
      relations: {
        attendanceDay: {
          student: {
            person: true,
          },
        },
        type: true,
      },
      select: {
        id: true,
        attendanceDay: {
          id: true,
          date: true,
          student: {
            id: true,
            person: {
              names: true,
              paternal_last_name: true,
              maternal_last_name: true,
            },
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
