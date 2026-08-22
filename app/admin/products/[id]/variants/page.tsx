// app/admin/products/[id]/variants/page.tsx
"use client";

import { use } from "react";
import CatalogVariantMatrixView from "../../../../(admin)/catalog/views/CatalogVariantMatrixView";

export default function VariantsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CatalogVariantMatrixView productId={id} />;
}