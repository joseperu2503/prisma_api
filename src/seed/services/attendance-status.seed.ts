import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceStatus } from 'src/attendance/entities/attendance-status.entity';
import { AttendanceStatusId } from 'src/attendance/enums/attenance-status-id.enum';
import { Repository } from 'typeorm';

@Injectable()
export class AttendanceStatusSeed {
  constructor(
    @InjectRepository(AttendanceStatus)
    private readonly attendanceStatusRepository: Repository<AttendanceStatus>,
  ) {}

  attendanceStatuses = [
    {
      id: AttendanceStatusId.ON_TIME,
      name: 'A Tiempo',
    },
    {
      id: AttendanceStatusId.LATE,
      name: 'Tardanza',
    },
    {
      id: AttendanceStatusId.EARLY_EXIT,
      name: 'Salida temprana',
    },
  ];

  async run() {
    for (const status of this.attendanceStatuses) {
      await this.create(status);
    }
  }

  async create(params: { id: AttendanceStatusId; name: string }) {
    const { id, name } = params;

    // Verificar si el registro ya existe
    const isExist = await this.attendanceStatusRepository.findOne({
      where: { id },
    });

    if (isExist) {
      // Actualizar el registro existente
      isExist.name = name;

      return this.attendanceStatusRepository.save(isExist);
    } else {
      // Crear un nuevo registro
      const newStatus = this.attendanceStatusRepository.create(params);
      return this.attendanceStatusRepository.save(newStatus);
    }
  }
}
