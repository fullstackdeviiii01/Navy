// types/product-variants.ts
export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  _id?: string;
  sku: string;
  attributes: VariantAttribute[];
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  weightUnit?: "kg" | "lb" | "g" | "oz";
  barcode?: string;
  imageUrl?: string;
  isAvailable: boolean;
  position: number;
}

export interface VariantOption {
  name: string;
  displayName: string;
  values: string[];
  position: number;
}

export interface VariantGenerationConfig {
  selectedOptions: string[];
  autoGenerateCombinations: boolean;
}

export interface VariantSelection {
  [attributeName: string]: string;
}