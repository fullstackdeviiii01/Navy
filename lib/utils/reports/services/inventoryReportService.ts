// ============================================
// app/api/admin/reports/services/inventoryReportService.ts
// ============================================
import Product from "../../../../app/models/Product";

export async function generateInventoryReport() {
  const products = await (Product as any).find()
    .select("name inventory.sku inventory.stock_quantity inventory.low_stock_threshold images pricing.price")
    .lean();

  const lowStock = products.filter(
    (p: any) => p.inventory.stock_quantity <= p.inventory.low_stock_threshold
  );

  const outOfStock = products.filter((p: any) => p.inventory.stock_quantity === 0);

  const totalValue = products.reduce(
    (sum: number, p: any) => sum + p.inventory.stock_quantity * p.pricing.price,
    0
  );

  return {
    totalProducts: products.length,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    totalInventoryValue: totalValue,
    lowStockProducts: lowStock.slice(0, 20),
    outOfStockProducts: outOfStock.slice(0, 20),
  };
}

