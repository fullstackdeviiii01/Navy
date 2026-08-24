// app/(admin)/components/reports/export/pdfTemplates/salesTemplate.ts
import { getRangeLabel } from "../pdfStyles";

export function generateSalesHTML(
  data: any,
  dateRange: string,
  logoUrl?: string
): string {
  const summary = data?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  };

  const topProducts = data?.topProducts || [];
  const rangeLabel = getRangeLabel(dateRange);

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 16px;">
        ${
          logoUrl
            ? `<img src="${logoUrl}" alt="Talal Wooden Lamps" style="max-height: 48px; max-width: 140px; object-fit: contain;" />`
            : `<div class="brand-title">TALAL WOODEN LAMPS</div>`
        }
        <div>
          <div class="brand-title">TALAL WOODEN LAMPS</div>
          <div class="brand-subtitle">Executive Sales Performance Report</div>
        </div>
      </div>
      <div class="report-meta-box">
        <div class="report-type-badge">SALES INTELLIGENCE</div>
        <div class="report-date">Period: ${rangeLabel}</div>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">Rs. ${Math.round(summary.totalRevenue || 0).toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Orders Completed</div>
        <div class="stat-value">${(summary.totalOrders || 0).toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Order Value</div>
        <div class="stat-value">Rs. ${Math.round(summary.averageOrderValue || 0).toLocaleString()}</div>
      </div>
    </div>

    <div class="section-title">
      <span>Top Selling Products</span>
      <span class="count-tag">${topProducts.length} Products Tracked</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45px;">Rank</th>
          <th>Product Name</th>
          <th class="text-right" style="width: 100px;">Units Sold</th>
          <th class="text-right" style="width: 130px;">Total Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${
          topProducts.length > 0
            ? topProducts
                .map(
                  (product: any, index: number) => `
              <tr>
                <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #8E7051;">#0${index + 1}</td>
                <td>
                  <div style="font-weight: 600; color: #241910;">${product.name || "Wooden Lamp"}</div>
                </td>
                <td class="text-right" style="font-weight: 600;">${product.quantity || 0}</td>
                <td class="text-right" style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #241910;">Rs. ${Math.round(product.revenue || 0).toLocaleString()}</td>
              </tr>
            `
                )
                .join("")
            : `<tr><td colspan="4" style="text-align: center; color: #7A736C; padding: 24px;">No top product data recorded for this period.</td></tr>`
        }
      </tbody>
    </table>
  `;
}