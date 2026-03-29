export class DebtMatrixColumnDto {
  installmentId: string;
  classFeeId: string;
  conceptName: string;
  label: string;
  periodDate: string | null;
  dueDate: string | null;
  defaultAmount: number;
}

export class DebtMatrixCellDto {
  debtId: string | null;
  amount: number;
  statusId: string | null;
  statusName: string | null;
}

export class DebtMatrixRowDto {
  personId: string;
  studentId: string;
  studentName: string;
  cells: Record<string, DebtMatrixCellDto>;
}

export class DebtMatrixDto {
  columns: DebtMatrixColumnDto[];
  rows: DebtMatrixRowDto[];
}
