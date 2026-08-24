// app/(admin)/components/reports/export/pdfTemplates/customerTemplate.ts
import { getRangeLabel } from "../pdfStyles";

export function generateCustomerHTML(data: any, dateRange: string, logoUrl?: string): string {
  const report = data?.data || data || {};
  const topCustomers = report.topCustomers || [];
  const newCustomers = report.newCustomers || 0;
  const activeCustomers = report.activeCustomers || 0;
  const avgOrdersPerCust = report.averageOrdersPerCustomer || 0;
  const avgRevPerCust = report.averageRevenuePerCustomer || 0;

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Talal Wooden Lamps Logo" style="height: 48px; width: 48px; object-fit: contain; border-radius: 4px;" />` : ""}
        <div>
          <h1 class="brand-title">Talal Wooden Lamps</h1>
          <p class="brand-subtitle">Patron & Client Acquisition Intelligence</p>
        </div>
      </div>
      <div class="report-meta-box">
        <span class="report-type-badge">${getRangeLabel(dateRange)}</span>
        <p class="report-date">${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">New Registered Patrons</div>
        <div class="stat-value">${newCustomers.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Ordering Patrons</div>
        <div class="stat-value">${activeCustomers.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Orders / Patron</div>
        <div class="stat-value">${Number(avgOrdersPerCust).toFixed(1)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Spend / Patron</div>
        <div class="stat-value">Rs. ${Math.round(avgRevPerCust).toLocaleString()}</div>
      </div>
    </div>

    <div class="section-title">
      <span>Top Atelier Patrons by Lifetime Spend</span>
      <span class="count-tag">${topCustomers.length} Top Patrons</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45px;">Rank</th>
          <th>Patron Name</th>
          <th>Contact Email</th>
          <th class="text-right" style="width: 80px;">Orders</th>
          <th class="text-right" style="width: 140px;">Total Expenditure</th>
        </tr>
      </thead>
      <tbody>
        ${
          topCustomers.length > 0
            ? topCustomers
                .map(
                  (customer: any, index: number) => `
              <tr>
                <td style="font-weight: 600; color: #8E7051;">#${index + 1}</td>
                <td style="font-weight: 600;">${customer.name || "Guest Patron"}</td>
                <td style="color: #6B7280; font-size: 10.5px;">${customer.email || "N/A"}</td>
                <td class="text-right font-mono">${(customer.orders || 0).toLocaleString()}</td>
                <td class="text-right font-mono" style="font-weight: 600; color: #241910;">Rs. ${Math.round(customer.revenue || 0).toLocaleString()}</td>
              </tr>
            `
                )
                .join("")
            : `
              <tr>
                <td colspan="5" class="text-center" style="color: #8C847B; padding: 24px;">No patron activity recorded in this period.</td>
              </tr>
            `
        }
      </tbody>
    </table>
  `;
}