// app/(admin)/components/reports/export/exportUtils.ts
import { commonPDFStyles } from "./pdfStyles";
import { generateSalesHTML } from "./pdfTemplates/salesTemplate";
import { generateProductHTML } from "./pdfTemplates/productTemplate";
import { generateCustomerHTML } from "./pdfTemplates/customerTemplate";
import { generateInventoryHTML } from "./pdfTemplates/inventoryTemplate";

let cachedLogo: string | null = null;

export async function exportToPDF(
  reportType: string,
  data: any,
  dateRange: string = "30d",
  customLogoUrl?: string
) {
  let logoUrl = customLogoUrl || cachedLogo;

  if (!logoUrl && typeof window !== "undefined") {
    try {
      const res = await fetch("/api/site-settings?type=company");
      if (res.ok) {
        const json = await res.json();
        logoUrl = json?.company_info?.company_logo || null;
        if (logoUrl) cachedLogo = logoUrl;
      }
    } catch (e) {
      console.warn("Could not fetch company logo for PDF export:", e);
    }
  }

  if (!logoUrl) {
    logoUrl = "/company/company_logo_1787545112127_e99pp05qeb7.webp";
  }

  const htmlContent = createPDFDocument(reportType, data, dateRange, logoUrl);
  const fileName = `Talal-Lamps-${reportType}-report-${new Date().toISOString().split("T")[0]}.pdf`;
  downloadPDF(htmlContent, fileName);
}

function createPDFDocument(
  reportType: string,
  data: any,
  dateRange: string,
  logoUrl?: string
): string {
  let bodyContent = "";

  switch (reportType) {
    case "sales":
      bodyContent = generateSalesHTML(data, dateRange, logoUrl);
      break;
    case "products":
      bodyContent = generateProductHTML(data, dateRange, logoUrl);
      break;
    case "customers":
      bodyContent = generateCustomerHTML(data, dateRange, logoUrl);
      break;
    case "inventory":
      bodyContent = generateInventoryHTML(data, logoUrl);
      break;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Talal Wooden Lamps - Atelier Report</title>
        ${commonPDFStyles}
      </head>
      <body>
        ${bodyContent}
        <div class="report-footer">
          <span>TALAL WOODEN LAMPS · CONFIDENTIAL ATELIER INTELLIGENCE</span>
          <span>Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </body>
    </html>
  `;
}

function downloadPDF(htmlContent: string, fileName: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export the PDF document.");
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 600);
  };
}