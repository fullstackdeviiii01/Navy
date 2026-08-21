// app/models/product/methods.ts
import { ProductSchema } from "./schema";
import { ProductVariant, VariantAttribute, VariantOption } from "./types";

// ============================================================================
// PRE-SAVE HOOK
// ============================================================================

// Auto-sync variant data and update stock status
ProductSchema.pre("save", function (next) {
  const doc = this;

  const run = async () => {
    // Sync variant data if variants are enabled
    if (doc.hasVariants && doc.variants && doc.variants.length > 0) {
      await doc.syncVariantData();
    }

    // Auto-update stock status for simple products
    if (!doc.hasVariants && doc.inventory && doc.inventory.track_inventory) {
      const qty = doc.inventory.stock_quantity;
      const threshold = doc.inventory.low_stock_threshold;

      if (qty <= 0) {
        doc.inventory.stock_status = "out_of_stock";
        doc.inventory.stock_quantity = 0;
      } else if (qty <= threshold) {
        doc.inventory.stock_status = "low_stock";
      } else {
        doc.inventory.stock_status = "in_stock";
      }
    }
  };

  run().then(() => next()).catch((error) => next(error));
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

ProductSchema.methods.syncVariantData = async function () {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return;
  }

  const allVariants = this.variants || [];
  const prices = allVariants
    .map((v: ProductVariant) => v.price)
    .filter((p: number) => typeof p === "number" && !isNaN(p) && p > 0);
  const comparePrices = allVariants
    .map((v: ProductVariant) => v.compareAtPrice)
    .filter((p: any) => typeof p === "number" && !isNaN(p) && p > 0);
  const stocks = allVariants.map((v: ProductVariant) => v.stockQuantity || 0);

  // Calculate pricing aggregates
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    this.variantPricing = {
      minPrice,
      maxPrice,
      priceVaries: new Set(prices).size > 1,
    };

    if (this.pricing) {
      this.pricing.price = minPrice;
      if (comparePrices.length > 0) {
        this.pricing.compare_at_price = Math.max(...comparePrices);
      }
    }
  }

  const totalStock = stocks.reduce((a: number, b: number) => a + b, 0);
  const availableCount = allVariants.filter((v: ProductVariant) => v.isAvailable !== false && (v.stockQuantity || 0) > 0).length;

  this.variantInventory = {
    totalStock,
    availableVariantCount: availableCount,
  };

  // Keep inventory.stock_quantity in sync so all existing UI reads are correct
  if (this.inventory) {
    this.inventory.stock_quantity = totalStock;

    // Update stock status based on aggregated stock
    if (totalStock <= 0) {
      this.inventory.stock_status = "out_of_stock";
    } else if (totalStock <= (this.inventory.low_stock_threshold || 10)) {
      this.inventory.stock_status = "low_stock";
    } else {
      this.inventory.stock_status = "in_stock";
    }
  }
};

ProductSchema.methods.getAvailableVariants = function (): ProductVariant[] {
  return (
    this.variants
      ?.filter((v: ProductVariant) => v.isAvailable && v.stockQuantity > 0)
      .sort(
        (a: ProductVariant, b: ProductVariant) => a.position - b.position,
      ) || []
  );
};

ProductSchema.methods.getVariantByAttributes = function (
  attrs: Record<string, string>,
): ProductVariant | null {
  return (
    this.variants?.find((variant: ProductVariant) => {
      return variant.attributes.every(
        (attr: VariantAttribute) => attrs[attr.name] === attr.value,
      );
    }) || null
  );
};

ProductSchema.methods.getVariantOptions = function (): VariantOption[] {
  return (
    this.variantOptions?.sort(
      (a: VariantOption, b: VariantOption) => a.position - b.position,
    ) || []
  );
};

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

ProductSchema.virtual("discount_percentage").get(function () {
  if (
    this.pricing.compare_at_price &&
    this.pricing.compare_at_price > this.pricing.price
  ) {
    return Math.round(
      ((this.pricing.compare_at_price - this.pricing.price) /
        this.pricing.compare_at_price) *
        100,
    );
  }
  return 0;
});

ProductSchema.virtual("in_stock").get(function () {
  if (this.hasVariants) {
    return this.getAvailableVariants().length > 0;
  }
  return this.inventory.stock_quantity > 0;
});