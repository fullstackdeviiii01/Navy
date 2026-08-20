// ============================================
// 4. app/(admin)/pages/products/ProductVariantsPage.tsx
// ============================================
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaCog } from "react-icons/fa";
import { variantsApi } from "../../../../lib/api/variants";
import VariantConfigurationPanel from "../../components/products/variants/VariantConfigurationPanel";
import Loader from "../../../components/shared/Loader";

interface ProductVariantsPageProps {
  productId: string;
  productName: string;
}

export default function ProductVariantsPage({
  productId,
  productName,
}: ProductVariantsPageProps) {
  const router = useRouter();
  const [hasVariants, setHasVariants] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVariants();
  }, [productId]);

  const checkVariants = async () => {
    try {
      setLoading(true);
      const data = await variantsApi.listVariants(productId);
      setHasVariants(data.data?.variantOptions?.length > 0);
    } catch (error) {
      console.error("Failed to check variants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
    <div className="relative h-64">
      <Loader />
    </div>
  );
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/admin/products/${productId}`)}
          className="text-theme-text-muted-light hover:text-theme-text-primary-light"
        >
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <FaCog className="text-theme-primary" />
            Manage Variants
          </h2>
          <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            {productName}
          </p>
        </div>
      </div>

      {/* Variant Configuration */}
      <VariantConfigurationPanel
        productId={productId}
        hasVariants={hasVariants}
        onToggleVariants={setHasVariants}
      />
    </div>
  );
}