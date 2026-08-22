// app/admin/products/[id]/edit/page.tsx
import CatalogItemEditorView from "../../../../(admin)/catalog/views/CatalogItemEditorView";
import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CatalogItemEditorView mode="edit" productId={id} />;
}