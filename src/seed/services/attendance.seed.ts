import { Injectable } from '@nestjs/common';
import { AttendanceService } from 'src/attendance/services/attendance.service';

const STUDENT_DOCUMENTS = ['72345678', '74567890', '76789012'];

const YEARS: Array<{ start: Date; end: Date }> = [
  { start: new Date('2024-03-01'), end: new Date('2024-12-20') },
  { start: new Date('2025-03-01'), end: new Date('2025-12-19') },
  { start: new Date('2026-03-01'), end: new Date('2026-12-18') },
];

const DAYS_PER_YEAR = 20;

function pickSchoolDays(start: Date, end: Date, count: number): Date[] {
  const all: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) all.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  if (all.length <= count) return all;
  const step = all.length / count;
  return Array.from({ length: count }, (_, i) => all[Math.floor(i * step)]);
}

@Injectable()
export class AttendanceSeed {
  constructor(private readonly attendanceService: AttendanceService) {}

  async run() {
    for (const documentNumber of STUDENT_DOCUMENTS) {
      for (const year of YEARS) {
        const days = pickSchoolDays(year.start, year.end, DAYS_PER_YEAR);

        for (const day of days) {
          const dateStr = day.toISOString().split('T')[0];

          await this.attendanceService.registerAttendance({
            documentTypeId: 'dni',
            documentNumber,
            type: 'check_in',
            date: dateStr,
          });

          await this.attendanceService.registerAttendance({
            documentTypeId: 'dni',
            documentNumber,
            type: 'check_out',
            date: dateStr,
          });
        }
      }
    }
  }
}
