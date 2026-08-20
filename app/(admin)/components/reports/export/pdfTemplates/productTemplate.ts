// ============================================
// app/(admin)/components/reports/export/pdfTemplates/productTemplate.ts
// ============================================
import { getRangeLabel } from "../pdfStyles";

export function generateProductHTML(data: any, dateRange: string): string {
  const report = data.data;

  return `
    <div class="header">
      <h1>Product Performance Report</h1>
      <div class="subtitle">Period: ${getRangeLabel(dateRange)} | Generated ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Products Sold</div>
        <div class="stat-value">${report.totalProducts}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Units Sold</div>
        <div class="stat-value">${report.totalUnitsSold.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">$${report.totalRevenue.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Revenue/Product</div>
        <div class="stat-value">$${(report.totalRevenue / report.totalProducts).toFixed(2)}</div>
      </div>
    </div>

    <div class="section-title">Detailed Product Performance</div>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product Name</th>
          <th style="text-align: right;">Units Sold</th>
          <th style="text-align: right;">Orders</th>
          <th style="text-align: right;">Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${report.products
          .slice(0, 30)
          .map(
            (product: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td style="text-align: right;">${product.unitsSold}</td>
            <td style="text-align: right;">${product.orders}</td>
            <td style="text-align: right; font-weight: 600;">$${product.revenue.toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}