// app/(admin)/components/reports/export/pdfTemplates/inventoryTemplate.ts
export function generateInventoryHTML(data: any, logoUrl?: string): string {
  const report = data?.data || data || {};
  const totalProducts = report.totalProducts || 0;
  const totalStock = report.totalStock ?? report.totalUnits ?? 0;
  const lowStockCount = report.lowStockCount || 0;
  const outOfStockCount = report.outOfStockCount || 0;
  const totalInventoryValue = report.totalValue ?? report.totalInventoryValue ?? 0;
  const outOfStockProducts = report.outOfStockProducts || [];
  const lowStockProducts = report.lowStockProducts || [];

  return `
    <div class="report-brand-bar">
      <div style="display: flex; align-items: center; gap: 14px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="Talal Wooden Lamps Logo" style="height: 48px; max-width: 140px; object-fit: contain;" />` : ""}
        <div>
          <h1 class="brand-title">TALAL WOODEN LAMPS</h1>
          <p class="brand-subtitle">Inventory Valuation & Stock Replenishment Audit</p>
        </div>
      </div>
      <div class="report-meta-box">
        <div class="report-type-badge">STOCK VALUATION</div>
        <div class="report-date">${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="stat-card">
        <div class="stat-label">Total Stock Units</div>
        <div class="stat-value">${totalStock.toLocaleString()}</div>
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
      lowStockProducts.length > 0
        ? `
      <div class="section-title" style="margin-top: 24px;">
        <span style="color: #92400E;">Low Stock Products (Needs Replenishment)</span>
        <span class="count-tag" style="color: #92400E; background: #FEF3C7; border: 1px solid #FDE68A;">${lowStockProducts.length} Items</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th class="text-right" style="width: 100px;">Unit Price</th>
            <th class="text-right" style="width: 110px;">Stock Left</th>
            <th class="text-right" style="width: 90px;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${lowStockProducts
            .map(
              (p: any) => `
            <tr>
              <td style="font-weight: 600; color: #241910;">${p.name || "Product"}</td>
              <td style="color: #6B7280;">${p.category || "Handcrafted Lighting"}</td>
              <td class="text-right">Rs. ${Math.round(p.price || 0).toLocaleString()}</td>
              <td class="text-right" style="font-weight: 700; color: #B45309;">${p.stock} units</td>
              <td class="text-right" style="color: #6B7280;">${p.threshold || 10} units</td>
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
      outOfStockProducts.length > 0
        ? `
      <div class="section-title" style="margin-top: 24px;">
        <span style="color: #991B1B;">Out of Stock Products</span>
        <span class="count-tag" style="color: #991B1B; background: #FEE2E2; border: 1px solid #FECACA;">${outOfStockProducts.length} Items</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th class="text-right" style="width: 110px;">Unit Price</th>
            <th class="text-right" style="width: 120px;">Current Stock</th>
            <th class="text-right" style="width: 130px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${outOfStockProducts
            .map(
              (p: any) => `
            <tr>
              <td style="font-weight: 600; color: #241910;">${p.name || "Product"}</td>
              <td style="color: #6B7280;">${p.category || "Handcrafted Lighting"}</td>
              <td class="text-right">Rs. ${Math.round(p.price || 0).toLocaleString()}</td>
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
  `;
}