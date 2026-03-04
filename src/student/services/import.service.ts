// import.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { CreateStudentDto } from '../dto/create-student.dto';
import { StudentService } from './student.service';

@Injectable()
export class ImportService {
  constructor(private studentService: StudentService) {}

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

    for (let i = 0; i < worksheet.lastRow.number; i++) {
      //   const row = worksheet.getRow(i);
      //   console.log(row.values);

      if (i !== 0) {
        const row = worksheet.getRow(i);

        const student = new CreateStudentDto();

        student.names = row.getCell(2).text;
        student.paternalLastName = row.getCell(3).text;
        student.maternalLastName = row.getCell(4).text;
        student.documentTypeId = 'dni';
        student.documentNumber = row.getCell(1).text;
        student.password = '123456';

        await this.studentService.create(student);
      }
    }

    return {
      message: 'Importación completada',
    };
  }
}
