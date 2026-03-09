// import.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { AcademicYearService } from 'src/academic-year/services/academic-year.service';
import { ClassroomService } from 'src/classroom/services/classroom.service';
import { EnrollmentService } from 'src/enrollment/services/enrollment.service';

@Injectable()
export class ImportService {
  constructor(
    private readonly classroomService: ClassroomService,
    private readonly academicYearService: AcademicYearService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  async processExcel(buffer: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1); // primera hoja
    if (!worksheet) {
      return {
        message: 'No se encontró ninguna hoja de cálculo',
      };
    }
    if (!worksheet.lastRow) {
      return {
        message: 'No se encontró ningún dato en la hoja de cálculo',
      };
    }

    const rowsCount = worksheet.rowCount;

    for (let i = 2; i <= rowsCount; i++) {
      const row = worksheet.getRow(i);

      // Skip empty rows
      if (!row.getCell(1).value) continue;

      const classroomName = row.getCell(5).text;
      const academicYearName = row.getCell(6).text;

      // Validar/Crear Aula
      const classroom = await this.classroomService.findOrCreate(classroomName);

      // Validar/Crear Año Académico
      const academicYear =
        await this.academicYearService.findOrCreate(academicYearName);

      await this.enrollmentService.create({
        academicYearId: academicYear.id,
        classroomId: classroom.id,
        student: {
          person: {
            names: row.getCell(2).text,
            paternalLastName: row.getCell(3).text,
            maternalLastName: row.getCell(4).text,
            documentTypeId: 'dni',
            documentNumber: row.getCell(1).text,
          },
          password: '123456',
        },
      });
    }

    return {
      message: 'Importación completada',
    };
  }
}
