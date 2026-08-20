// ============================================
// 5. app/admin/products/[id]/edit/page.tsx
// ============================================
import ProductFormPage from "../../../../(admin)/pages/products/ProductFormPage";
import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductFormPage mode="edit" productId={id} />;
}