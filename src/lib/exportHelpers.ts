/**
 * Frontend-only export helpers.
 * When the backend arrives, swap `excelExport` for a call to an API route
 * that streams a real workbook, and `printPdf` for a server-rendered PDF
 * if you need pixel-perfect print output.
 */
import * as XLSX from "xlsx";

export function excelExport(filename: string, rows: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** Opens the browser print dialog with only the given HTML inside a hidden print area. */
export function printHtml(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`<html><head><title>${title}</title>
    <style>
      body{font-family:Inter,sans-serif;padding:24px;color:#1B2530;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th,td{border:1px solid #ccc;padding:8px;text-align:left;}
      h2{font-family:Georgia,serif;}
    </style></head><body>
    <h2>${title}</h2>${bodyHtml}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
