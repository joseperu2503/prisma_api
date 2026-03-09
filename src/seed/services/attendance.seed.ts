import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceDay } from 'src/attendance/entities/attendance-day.entity';
import { AttendanceLog } from 'src/attendance/entities/attendance-log.entity';
import { Person } from 'src/person/entities/person.entity';
import { DataSource, Repository } from 'typeorm';

// 3 students used for attendance seed
const STUDENT_DOCUMENTS = ['72345678', '74567890', '76789012'];

// academic years to seed: [startDate, days count]
const YEARS: Array<{ start: Date; end: Date }> = [
  { start: new Date('2024-03-01'), end: new Date('2024-12-20') },
  { start: new Date('2025-03-01'), end: new Date('2025-12-19') },
  { start: new Date('2026-03-01'), end: new Date('2026-12-18') },
];

const DAYS_PER_YEAR = 20;
const CHECK_IN_HOUR = 8;
const CHECK_OUT_HOUR = 15;

/** Returns DAYS_PER_YEAR school days (Mon-Fri) evenly spread within [start, end] */
function pickSchoolDays(start: Date, end: Date, count: number): Date[] {
  const all: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      all.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (all.length <= count) return all;

  // pick evenly distributed indices
  const step = all.length / count;
  const result: Date[] = [];
  for (let i = 0; i < count; i++) {
    result.push(all[Math.floor(i * step)]);
  }
  return result;
}

@Injectable()
export class AttendanceSeed {
  constructor(
    @InjectRepository(AttendanceDay)
    private readonly attendanceDayRepository: Repository<AttendanceDay>,

    private readonly dataSource: DataSource,
  ) {}

  async run() {
    for (const document of STUDENT_DOCUMENTS) {
      const person = await this.dataSource.getRepository(Person).findOneBy({
        documentTypeId: 'dni',
        documentNumber: document,
      });

      if (!person) continue;

      for (const year of YEARS) {
        const days = pickSchoolDays(year.start, year.end, DAYS_PER_YEAR);

        for (const day of days) {
          await this.registerDay(person.id, day);
        }
      }
    }
  }

  /** Replicates AttendanceService.registerAttendance logic but with a custom date */
  private async registerDay(personId: string, date: Date) {
    await this.dataSource.transaction(async (manager) => {
      // find or create AttendanceDay
      let attendanceDay = await manager.findOne(AttendanceDay, {
        where: { personId, date },
      });

      if (!attendanceDay) {
        attendanceDay = manager.create(AttendanceDay, { personId, date });
        attendanceDay = await manager.save(attendanceDay);
      }

      // check_in at 08:00
      const existCheckIn = await manager.findOne(AttendanceLog, {
        where: { attendanceDayId: attendanceDay.id, typeId: 'check_in' },
      });
      if (!existCheckIn) {
        const checkInTime = new Date(date);
        checkInTime.setHours(CHECK_IN_HOUR, 0, 0, 0);
        const log = manager.create(AttendanceLog, {
          attendanceDayId: attendanceDay.id,
          typeId: 'check_in',
          markedAt: checkInTime,
        });
        await manager.save(log);
      }

      // check_out at 15:00
      const existCheckOut = await manager.findOne(AttendanceLog, {
        where: { attendanceDayId: attendanceDay.id, typeId: 'check_out' },
      });
      if (!existCheckOut) {
        const checkOutTime = new Date(date);
        checkOutTime.setHours(CHECK_OUT_HOUR, 0, 0, 0);
        const log = manager.create(AttendanceLog, {
          attendanceDayId: attendanceDay.id,
          typeId: 'check_out',
          markedAt: checkOutTime,
        });
        await manager.save(log);
      }
    });
  }
}
