// ============================================
// 6. app/admin/products/[id]/variants/page.tsx
// ============================================
"use client";

import { use, useEffect, useState } from "react";
import { productsApi } from "../../../../../lib/api/products";
import ProductVariantsPage from "../../../../(admin)/pages/products/ProductVariantsPage";

export default function VariantsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await productsApi.getById(id);
      setProductName(data.product.name);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  return <ProductVariantsPage productId={id} productName={productName} />;
}