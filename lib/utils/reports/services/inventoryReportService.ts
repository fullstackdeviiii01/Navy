// lib/utils/reports/services/inventoryReportService.ts
import Product from "../../../../app/models/Product";
import Category from "../../../../app/models/Category";

export async function generateInventoryReport() {
  const products = await (Product as any)
    .find({ status: { $ne: "archived" } })
    .populate("category_id", "name")
    .select("name hasVariants inventory variantInventory variants images pricing category_id sku status")
    .lean();

  const formattedProducts = products.map((p: any) => {
    const isVariant = Boolean(p.hasVariants);
    let stock = 0;
    let threshold = 10;
    let unitPrice = Math.max(0, Number(p.pricing?.price) || 0);

    if (isVariant && Array.isArray(p.variants) && p.variants.length > 0) {
      stock = p.variants.reduce(
        (sum: number, v: any) => sum + Math.max(0, Number(v.stockQuantity) || 0),
        0
      );
      threshold = Math.max(0, Number(p.variantInventory?.lowStockThreshold) || 10);
      if (!unitPrice && p.variants[0]?.price) {
        unitPrice = Math.max(0, Number(p.variants[0].price) || 0);
      }
    } else {
      stock = Math.max(0, Number(p.inventory?.stock_quantity) || 0);
      threshold = Math.max(0, Number(p.inventory?.low_stock_threshold) || 10);
    }

    const categoryName = p.category_id?.name || "Handcrafted Lighting";
    const imageUrl = p.images?.[0]?.url || null;

    return {
      _id: p._id,
      name: p.name,
      sku: p.sku || null,
      category: categoryName,
      price: unitPrice,
      stock,
      threshold,
      isVariant,
      image: imageUrl,
      totalValue: stock * unitPrice,
    };
  });

  const outOfStock = formattedProducts.filter((p) => p.stock === 0);
  const lowStock = formattedProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.threshold
  );
  const inStock = formattedProducts.filter((p) => p.stock > p.threshold);

  const totalStockUnits = formattedProducts.reduce(
    (sum, p) => sum + p.stock,
    0
  );
  const totalValue = formattedProducts.reduce(
    (sum, p) => sum + p.totalValue,
    0
  );

  return {
    totalProducts: formattedProducts.length,
    totalStock: totalStockUnits,
    totalUnits: totalStockUnits,
    totalValue,
    totalInventoryValue: totalValue,
    lowStockCount: lowStock.length,
    outOfStockCount: outOfStock.length,
    inStockCount: inStock.length,
    lowStockProducts: lowStock,
    outOfStockProducts: outOfStock,
    allProducts: formattedProducts,
  };
}
