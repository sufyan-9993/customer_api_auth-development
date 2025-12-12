import * as ExcelJS from 'exceljs';

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export async function generateExcelFile(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, any>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Set columns
  sheet.columns = columns;

  // Bold header
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  // Insert rows
  rows.forEach((r) => sheet.addRow(r));

  // Create buffer
  const excelData = await workbook.xlsx.writeBuffer();
  return Buffer.from(excelData);
}
