// ============================================
// 4. app/admin/products/[id]/page.tsx
// ============================================
import ProductDetailPage from "../../../(admin)/pages/products/ProductDetailPage";
import { use } from "react";

export default function ProductDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductDetailPage productId={id} />;
}