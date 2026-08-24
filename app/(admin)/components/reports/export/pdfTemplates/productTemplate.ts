// app/(admin)/components/reports/export/pdfTemplates/productTemplate.ts
import { getRangeLabel } from "../pdfStyles";

export function generateProductHTML(data: any, dateRange: string, logoUrl?: string): string {
  const report = data?.data || data || {};
  const products = report.products || [];
  const totalProducts = report.totalProducts || products.length || 0;
  const totalUnitsSold = report.totalUnitsSold || 0;
  const totalRevenue = report.totalRevenue || 0;
  const avgRevPerProduct = totalProducts > 0 ? totalRevenue / totalProducts : 0;

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Talal Wooden Lamps Logo" style="height: 48px; width: 48px; object-fit: contain; border-radius: 4px;" />` : ""}
        <div>
          <h1 class="brand-title">Talal Wooden Lamps</h1>
          <p class="brand-subtitle">Product Sales & Performance Report</p>
        </div>
      </div>
      <div class="report-meta-box">
        <span class="report-type-badge">${getRangeLabel(dateRange)}</span>
        <p class="report-date">${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Products Sold</div>
        <div class="stat-value">${totalProducts.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Units Sold</div>
        <div class="stat-value">${totalUnitsSold.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Product Revenue</div>
        <div class="stat-value">Rs. ${Math.round(totalRevenue).toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Revenue / Product</div>
        <div class="stat-value">Rs. ${Math.round(avgRevPerProduct).toLocaleString()}</div>
      </div>
    </div>

    <div class="section-title">
      <span>Product Sales Breakdown</span>
      <span class="count-tag">${products.length} Products Detailed</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45px;">Rank</th>
          <th>Product Name</th>
          <th class="text-right" style="width: 90px;">Units Sold</th>
          <th class="text-right" style="width: 90px;">Orders</th>
          <th class="text-right" style="width: 130px;">Total Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${
          products.length > 0
            ? products
                .map(
                  (product: any, index: number) => `
              <tr>
                <td style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #8E7051;">#0${index + 1}</td>
                <td>
                  <div style="font-weight: 600; color: #241910;">${product.name || product.product_name || "Product"}</div>
                  ${product.sku ? `<div style="font-size: 10px; color: #6B7280; font-family: monospace;">SKU: ${product.sku}</div>` : ""}
                </td>
                <td class="text-right" style="font-weight: 600;">${product.unitsSold || product.quantity || 0}</td>
                <td class="text-right" style="color: #6B7280;">${product.orderCount || product.orders || 0}</td>
                <td class="text-right" style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #241910;">Rs. ${Math.round(product.totalRevenue || product.revenue || 0).toLocaleString()}</td>
              </tr>
            `
                )
                .join("")
            : `<tr><td colspan="5" style="text-align: center; color: #7A736C; padding: 24px;">No product movement recorded for this period.</td></tr>`
        }
      </tbody>
    </table>
  `;
}