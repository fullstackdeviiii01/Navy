// app/(admin)/components/reports/export/exportUtils.ts (SIMPLIFIED)
import { commonPDFStyles } from "./pdfStyles";
import { generateSalesHTML } from "./pdfTemplates/salesTemplate";
import { generateProductHTML } from "./pdfTemplates/productTemplate";
import { generateCustomerHTML } from "./pdfTemplates/customerTemplate";
import { generateInventoryHTML } from "./pdfTemplates/inventoryTemplate";

export function exportToPDF(reportType: string, data: any, dateRange: string) {
  const htmlContent = createPDFDocument(reportType, data, dateRange);
  const fileName = `${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`;
  downloadPDF(htmlContent, fileName);
}

function createPDFDocument(reportType: string, data: any, dateRange: string): string {
  let bodyContent = "";

  switch (reportType) {
    case "sales":
      bodyContent = generateSalesHTML(data, dateRange);
      break;
    case "products":
      bodyContent = generateProductHTML(data, dateRange);
      break;
    case "customers":
      bodyContent = generateCustomerHTML(data, dateRange);
      break;
    case "inventory":
      bodyContent = generateInventoryHTML(data);
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        ${commonPDFStyles}
      </head>
      <body>
        ${bodyContent}
        <div class="footer">
          Generated on ${new Date().toLocaleString()} | Confidential Report
        </div>
      </body>
    </html>
  `;
}

function downloadPDF(htmlContent: string, fileName: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download the PDF");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 250);
  };
}