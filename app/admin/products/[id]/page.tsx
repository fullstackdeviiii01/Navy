// app/admin/products/[id]/page.tsx
import CatalogItemOverviewView from "../../../(admin)/catalog/views/CatalogItemOverviewView";
import { use } from "react";

export default function ProductDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CatalogItemOverviewView productId={id} />;
}