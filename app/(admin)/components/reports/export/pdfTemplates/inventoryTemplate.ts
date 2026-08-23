// ============================================
// app/(admin)/components/reports/export/pdfTemplates/inventoryTemplate.ts
// ============================================
export function generateInventoryHTML(data: any): string {
  const report = data.data;

  return `
    <div class="header">
      <h1>Inventory Status Report</h1>
      <div class="subtitle">Current Snapshot | Generated ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Products</div>
        <div class="stat-value">${report.totalProducts}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Low Stock Items</div>
        <div class="stat-value" style="color: #f59e0b;">${report.lowStockCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Out of Stock</div>
        <div class="stat-value" style="color: #ef4444;">${report.outOfStockCount}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Inventory Value</div>
        <div class="stat-value">$${report.totalInventoryValue.toLocaleString()}</div>
      </div>
    </div>

    ${
      report.outOfStockProducts.length > 0
        ? `
    <div class="section-title" style="color: #ef4444;">Out of Stock Products</div>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th style="text-align: right;">Stock</th>
        </tr>
      </thead>
      <tbody>
        ${report.outOfStockProducts
          .map(
            (product: any) => `
          <tr>
            <td>${product.name}</td>
            <td style="text-align: right; color: #ef4444; font-weight: 600;">${product.inventory.stock_quantity}</td>
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
      report.lowStockProducts.length > 0
        ? `
    <div class="section-title" style="color: #f59e0b;">Low Stock Products</div>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th style="text-align: right;">Current Stock</th>
          <th style="text-align: right;">Threshold</th>
        </tr>
      </thead>
      <tbody>
        ${report.lowStockProducts
          .map(
            (product: any) => `
          <tr>
            <td>${product.name}</td>
            <td style="text-align: right; color: #f59e0b; font-weight: 600;">${product.inventory.stock_quantity}</td>
            <td style="text-align: right;">${product.inventory.low_stock_threshold}</td>
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