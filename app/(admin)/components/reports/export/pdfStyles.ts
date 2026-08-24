// app/(admin)/components/reports/export/pdfStyles.ts
export const commonPDFStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4;
      margin: 12mm 15mm;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #FFFFFF;
      color: #241910;
      padding: 24px 28px;
      font-size: 12px;
      line-height: 1.5;
    }

    .report-brand-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #241910;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      color: #241910;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #8E7051;
      margin-top: 2px;
    }

    .report-meta-box {
      text-align: right;
    }

    .report-type-badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      background: #FBF9F5;
      color: #8E7051;
      border: 1px solid #E5DFD7;
      padding: 3px 8px;
      margin-bottom: 4px;
    }

    .report-date {
      font-size: 10px;
      color: #6B7280;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      background: #FBF9F5;
      border: 1px solid #E5DFD7;
      padding: 12px 14px;
      border-left: 3px solid #8E7051;
    }

    .stat-label {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #7A736C;
      margin-bottom: 4px;
    }

    .stat-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      font-weight: 700;
      color: #241910;
      line-height: 1.2;
    }

    .stat-change {
      font-size: 9.5px;
      font-weight: 600;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .positive { color: #15803D; }
    .negative { color: #B91C1C; }

    .section-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 15px;
      font-weight: 700;
      color: #241910;
      margin: 20px 0 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #E5DFD7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title span.count-tag {
      font-family: 'Inter', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #8E7051;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
    }

    th {
      background: #F3EFEA;
      padding: 8px 10px;
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #241910;
      border-bottom: 1.5px solid #241910;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #EAE5DD;
      font-size: 11px;
      color: #2B2825;
    }

    tr:nth-child(even) td {
      background: #FAF8F5;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .badge-status {
      display: inline-block;
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 6px;
      border-radius: 2px;
    }

    .badge-warning {
      background: #FEF3C7;
      color: #92400E;
      border: 1px solid #FCD34D;
    }

    .badge-danger {
      background: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
    }

    .report-footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #E5DFD7;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #8C847B;
    }
  </style>
`;

export function getRangeLabel(range: string): string {
  const labels: Record<string, string> = {
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "1y": "Past 12 Months",
    all: "All Time Record",
    current: "Current Inventory Snapshot",
    custom: "Custom Specified Date Range",
  };
  return labels[range] || "Executive Reporting Period";
}