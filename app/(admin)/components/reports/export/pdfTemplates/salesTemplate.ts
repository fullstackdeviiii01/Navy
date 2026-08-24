// app/(admin)/components/reports/export/pdfTemplates/salesTemplate.ts
import { getRangeLabel } from "../pdfStyles";

export function generateSalesHTML(data: any, dateRange: string, logoUrl?: string): string {
  const report = data?.data || data || {};
  const summary = report.summary || {
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    ordersGrowth: 0,
    averageOrderValue: 0,
    previousRevenue: 0,
    previousOrders: 0,
  };

  const topProducts = report.topProducts || [];

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Talal Wooden Lamps Logo" style="height: 48px; width: 48px; object-fit: contain; border-radius: 4px;" />` : ""}
        <div>
          <h1 class="brand-title">Talal Wooden Lamps</h1>
          <p class="brand-subtitle">Executive Sales & Revenue Report</p>
        </div>
      </div>
      <div class="report-meta-box">
        <span class="report-type-badge">${getRangeLabel(dateRange)}</span>
        <p class="report-date">${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">Rs. ${Math.round(summary.totalRevenue || 0).toLocaleString()}</div>
        <div class="stat-change ${summary.revenueGrowth >= 0 ? "positive" : "negative"}">
          ${summary.revenueGrowth >= 0 ? "▲ +" : "▼ "}${Number(summary.revenueGrowth || 0).toFixed(1)}% vs previous period
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Orders Completed</div>
        <div class="stat-value">${(summary.totalOrders || 0).toLocaleString()}</div>
        <div class="stat-change ${summary.ordersGrowth >= 0 ? "positive" : "negative"}">
          ${summary.ordersGrowth >= 0 ? "▲ +" : "▼ "}${Number(summary.ordersGrowth || 0).toFixed(1)}% vs previous period
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Order Value</div>
        <div class="stat-value">Rs. ${Math.round(summary.averageOrderValue || 0).toLocaleString()}</div>
        <div class="stat-change" style="color: #7A736C;">Per completed order</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Prior Period Revenue</div>
        <div class="stat-value">Rs. ${Math.round(summary.previousRevenue || 0).toLocaleString()}</div>
        <div class="stat-change" style="color: #7A736C;">${summary.previousOrders || 0} orders recorded</div>
      </div>
    </div>

    <div class="section-title">
      <span>Top Selling Luminaires</span>
      <span class="count-tag">${topProducts.length} Products Tracked</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45px;">Rank</th>
          <th>Piece / Description</th>
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
                <td style="font-weight: 600; color: #8E7051;">#${index + 1}</td>
                <td style="font-weight: 600;">${product.name || "Custom Luminaire"}</td>
                <td class="text-right font-mono">${(product.quantity || 0).toLocaleString()}</td>
                <td class="text-right font-mono" style="font-weight: 600; color: #241910;">Rs. ${Math.round(product.revenue || 0).toLocaleString()}</td>
              </tr>
            `
                )
                .join("")
            : `
              <tr>
                <td colspan="4" class="text-center" style="color: #8C847B; padding: 24px;">No product sales recorded in this timeframe.</td>
              </tr>
            `
        }
      </tbody>
    </table>
  `;
}