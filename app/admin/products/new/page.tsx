// app/admin/products/new/page.tsx
import CatalogItemEditorView from "../../../(admin)/catalog/views/CatalogItemEditorView";

export default function NewProductPage() {
  return <CatalogItemEditorView mode="add" />;
}