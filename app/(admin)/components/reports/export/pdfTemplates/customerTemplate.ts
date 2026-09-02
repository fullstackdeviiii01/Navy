// app/(admin)/components/reports/export/pdfTemplates/customerTemplate.ts
import { getRangeLabel } from "../pdfStyles";

export function generateCustomerHTML(data: any, dateRange: string, logoUrl?: string): string {
  const report = data?.data || data || {};
  const topCustomers = report.topCustomers || [];
  const totalCustomers = report.totalCustomers || report.activeCustomers || 0;
  const newCustomers = report.newCustomers || 0;
  const activeCustomers = report.activeCustomers || 0;
  const avgOrdersPerCust = report.averageOrdersPerCustomer || 0;
  const avgRevPerCust = report.averageSpent || report.averageRevenuePerCustomer || 0;

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Talal Wooden Lamps Logo" style="height: 48px; max-width: 140px; object-fit: contain;" />` : ""}
        <div>
          <h1 class="brand-title">TALAL WOODEN LAMPS</h1>
          <p class="brand-subtitle">Customer Acquisition & Spending Telemetry</p>
        </div>
      </div>
      <div class="report-meta-box">
        <div class="report-type-badge">PATRON ANALYTICS</div>
        <div class="report-date">Period: ${getRangeLabel(dateRange)}</div>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card">
        <div class="stat-label">Total Customers</div>
        <div class="stat-value">${totalCustomers.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">New Customers Joined</div>
        <div class="stat-value">${newCustomers.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Buyers</div>
        <div class="stat-value">${activeCustomers.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Spend / Customer</div>
        <div class="stat-value">Rs. ${Math.round(avgRevPerCust).toLocaleString()}</div>
      </div>
    </div>

    <div class="section-title">
      <span>Top Spending Customers</span>
      <span class="count-tag">${topCustomers.length} Patrons Detailed</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45px;">Rank</th>
          <th>Customer Name</th>
          <th>Email Address</th>
          <th class="text-right" style="width: 90px;">Orders</th>
          <th class="text-right" style="width: 140px;">Total Spent</th>
        </tr>
      </thead>
      <tbody>
        ${
          topCustomers.length > 0
            ? topCustomers
                .map(
                  (c: any, index: number) => `
              <tr>
                <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #8E7051;">#0${index + 1}</td>
                <td style="font-weight: 600; color: #241910;">${c.name || "Customer"}</td>
                <td style="color: #6B7280; font-family: monospace; font-size: 11px;">${c.email || "Guest"}</td>
                <td class="text-right" style="font-weight: 600;">${c.orders || 0}</td>
                <td class="text-right" style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #241910;">Rs. ${Math.round(c.totalSpent || c.revenue || 0).toLocaleString()}</td>
              </tr>
            `
                )
                .join("")
            : `<tr><td colspan="5" style="text-align: center; color: #7A736C; padding: 24px;">No customer order records found for this period.</td></tr>`
        }
      </tbody>
    </table>
  `;
}