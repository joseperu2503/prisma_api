import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceType } from 'src/attendance/entities/attendance-type.entity';
import { Repository } from 'typeorm';

Injectable();
export class AttendanceTypeSeed {
  constructor(
    @InjectRepository(AttendanceType)
    private readonly attendanceTypeRepository: Repository<AttendanceType>,
  ) {}

  attendanceTypes = [
    {
      id: 'check_in',
      name: 'Check In',
    },
    {
      id: 'check_out',
      name: 'Check Out',
    },
  ];

  async run() {
    for (const attendanceType of this.attendanceTypes) {
      await this.create(attendanceType);
    }
  }

  async create(params: AttendanceType) {
    const { id, name } = params;

    // Verificar si el registro ya existe
    const isExist = await this.attendanceTypeRepository.findOne({
      where: { id },
    });

    if (isExist) {
      // Actualizar el registro existente
      isExist.name = name;

      return this.attendanceTypeRepository.save(isExist);
    } else {
      // Crear un nuevo registro
      const newAttendanceType = this.attendanceTypeRepository.create(params);
      return this.attendanceTypeRepository.save(newAttendanceType);
    }
  }
}
