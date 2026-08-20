// ============================================
// app/(admin)/components/reports/export/pdfTemplates/salesTemplate.ts
// ============================================
import { getRangeLabel } from "../pdfStyles";

export function generateSalesHTML(data: any, dateRange: string): string {
  const report = data.data;
  const summary = report.summary;

  return `
    <div class="header">
      <h1>Sales Performance Report</h1>
      <div class="subtitle">Period: ${getRangeLabel(dateRange)} | Generated ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">$${summary.totalRevenue.toLocaleString()}</div>
        <div class="stat-change ${summary.revenueGrowth >= 0 ? "positive" : "negative"}">
          ${summary.revenueGrowth >= 0 ? "+" : ""}${summary.revenueGrowth.toFixed(1)}% vs previous period
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Orders</div>
        <div class="stat-value">${summary.totalOrders.toLocaleString()}</div>
        <div class="stat-change ${summary.ordersGrowth >= 0 ? "positive" : "negative"}">
          ${summary.ordersGrowth >= 0 ? "+" : ""}${summary.ordersGrowth.toFixed(1)}% vs previous period
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Order Value</div>
        <div class="stat-value">$${summary.averageOrderValue.toFixed(2)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Previous Period</div>
        <div class="stat-value">$${summary.previousRevenue.toLocaleString()}</div>
        <div class="stat-label" style="margin-top: 4px;">${summary.previousOrders} orders</div>
      </div>
    </div>

    <div class="section-title">Top Selling Products</div>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Product Name</th>
          <th style="text-align: right;">Units Sold</th>
          <th style="text-align: right;">Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${report.topProducts
          .map(
            (product: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td style="text-align: right;">${product.quantity}</td>
            <td style="text-align: right; font-weight: 600;">$${product.revenue.toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}