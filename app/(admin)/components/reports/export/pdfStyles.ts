// ============================================
// app/(admin)/components/reports/export/pdfStyles.ts
// ============================================
export const commonPDFStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; }
    .header { margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
    .header h1 { color: #1f2937; font-size: 28px; margin-bottom: 8px; }
    .header .subtitle { color: #6b7280; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .stat-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
    .stat-change { font-size: 12px; margin-top: 4px; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    tr:hover { background: #f9fafb; }
    .section-title { font-size: 18px; font-weight: 600; margin: 30px 0 15px; color: #1f2937; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
`;

export function getRangeLabel(range: string): string {
  const labels: any = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "1y": "Last Year",
    custom: "Custom Date Range",
  };
  return labels[range] || "Custom Period";
}