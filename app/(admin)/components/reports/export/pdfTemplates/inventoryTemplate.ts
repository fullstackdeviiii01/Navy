// app/(admin)/components/reports/export/pdfTemplates/inventoryTemplate.ts
export function generateInventoryHTML(data: any, logoUrl?: string): string {
  const report = data?.data || data || {};
  const totalProducts = report.totalProducts || 0;
  const lowStockCount = report.lowStockCount || 0;
  const outOfStockCount = report.outOfStockCount || 0;
  const totalInventoryValue = report.totalInventoryValue || 0;
  const outOfStockProducts = report.outOfStockProducts || [];
  const lowStockProducts = report.lowStockProducts || [];

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Talal Wooden Lamps Logo" style="height: 48px; width: 48px; object-fit: contain; border-radius: 4px;" />` : ""}
        <div>
          <h1 class="brand-title">Talal Wooden Lamps</h1>
          <p class="brand-subtitle">Inventory & Stock Report</p>
        </div>
      </div>
      <div class="report-meta-box">
        <span class="report-type-badge">Real-Time Stock Audit</span>
        <p class="report-date">${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Products</div>
        <div class="stat-value">${totalProducts.toLocaleString()}</div>
      </div>
      <div class="stat-card" style="border-left-color: ${lowStockCount > 0 ? "#B45309" : "#8E7051"};">
        <div class="stat-label">Low Stock Items</div>
        <div class="stat-value" style="color: ${lowStockCount > 0 ? "#B45309" : "#241910"};">${lowStockCount.toLocaleString()}</div>
      </div>
      <div class="stat-card" style="border-left-color: ${outOfStockCount > 0 ? "#B91C1C" : "#8E7051"};">
        <div class="stat-label">Out of Stock Items</div>
        <div class="stat-value" style="color: ${outOfStockCount > 0 ? "#B91C1C" : "#241910"};">${outOfStockCount.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Inventory Value</div>
        <div class="stat-value">Rs. ${Math.round(totalInventoryValue).toLocaleString()}</div>
      </div>
    </div>

    ${
      outOfStockProducts.length > 0
        ? `
      <div class="section-title">
        <span style="color: #991B1B;">Out of Stock Products</span>
        <span class="count-tag" style="color: #991B1B;">${outOfStockProducts.length} Items</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th class="text-right" style="width: 120px;">Current Stock</th>
            <th class="text-right" style="width: 140px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${outOfStockProducts
            .map(
              (p: any) => `
            <tr>
              <td style="font-weight: 600; color: #241910;">${p.name || "Product"}</td>
              <td class="text-right" style="font-weight: 700; color: #B91C1C;">0 units</td>
              <td class="text-right"><span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #FEE2E2; color: #991B1B; font-size: 10px; font-weight: 700;">OUT OF STOCK</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `
        : ""
    }

    ${
      lowStockProducts.length > 0
        ? `
      <div class="section-title" style="margin-top: 24px;">
        <span style="color: #92400E;">Low Stock Products (Needs Restocking)</span>
        <span class="count-tag" style="color: #92400E;">${lowStockProducts.length} Items</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th class="text-right" style="width: 120px;">Current Stock</th>
            <th class="text-right" style="width: 140px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${lowStockProducts
            .map(
              (p: any) => `
            <tr>
              <td style="font-weight: 600; color: #241910;">${p.name || "Product"}</td>
              <td class="text-right" style="font-weight: 700; color: #B45309;">${p.stock || p.quantity || 0} units</td>
              <td class="text-right"><span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: #FEF3C7; color: #92400E; font-size: 10px; font-weight: 700;">LOW STOCK</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `
        : ""
    }
  `;
}