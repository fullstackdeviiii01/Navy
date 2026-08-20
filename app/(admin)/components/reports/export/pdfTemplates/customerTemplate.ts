// ============================================
// app/(admin)/components/reports/export/pdfTemplates/customerTemplate.ts
// ============================================
import { getRangeLabel } from "../pdfStyles";

export function generateCustomerHTML(data: any, dateRange: string): string {
  const report = data.data;

  return `
    <div class="header">
      <h1>Customer Analytics Report</h1>
      <div class="subtitle">Period: ${getRangeLabel(dateRange)} | Generated ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">New Customers</div>
        <div class="stat-value">${report.newCustomers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Customers</div>
        <div class="stat-value">${report.activeCustomers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Orders/Customer</div>
        <div class="stat-value">${report.averageOrdersPerCustomer.toFixed(1)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Revenue/Customer</div>
        <div class="stat-value">$${report.averageRevenuePerCustomer.toFixed(2)}</div>
      </div>
    </div>

    <div class="section-title">Top Customers by Revenue</div>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Customer Name</th>
          <th>Email</th>
          <th style="text-align: right;">Orders</th>
          <th style="text-align: right;">Total Spent</th>
        </tr>
      </thead>
      <tbody>
        ${report.topCustomers
          .map(
            (customer: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${customer.name || "N/A"}</td>
            <td>${customer.email}</td>
            <td style="text-align: right;">${customer.orders}</td>
            <td style="text-align: right; font-weight: 600;">$${customer.revenue.toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}