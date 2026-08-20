// app/dashboard/coupons/components/CouponModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { couponsApi } from "../../../../lib/api/coupons";
import BasicInfoForm from "./CouponFormSections/BasicInfoForm";
import DiscountSettingsForm from "./CouponFormSections/DiscountSettingsForm";
import ValidityPeriodForm from "./CouponFormSections/ValidityPeriodForm";
import UsageLimitsForm from "./CouponFormSections/UsageLimitsForm";
import ApplicableToForm from "./CouponFormSections/ApplicableToForm";
import SettingsForm from "./CouponFormSections/SettingsForm";

interface CouponModalProps {
  coupon: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function CouponModal({
  coupon,
  isOpen,
  onClose,
  onSave,
}: CouponModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
    max_discount: null as number | null,
    valid_from: "",
    valid_until: "",
    usage_limit: null as number | null,
    per_user_limit: 1,
    applicable_to: {
      type: (coupon?.applicable_to?.type || "all") as
        | "all"
        | "categories"
        | "products",
      category_ids:
        coupon?.applicable_to?.category_ids?.map((id: any) =>
          typeof id === "object" ? id._id : id,
        ) || [],
      product_ids:
        coupon?.applicable_to?.product_ids?.map((id: any) =>
          typeof id === "object" ? id._id : id,
        ) || [],
    },
    is_active: true,
    show_on_products: true,
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value || 0,
        min_order_amount: coupon.min_order_amount || 0,
        max_discount: coupon.max_discount || null,
        valid_from: coupon.valid_from
          ? new Date(coupon.valid_from).toISOString().split("T")[0]
          : "",
        valid_until: coupon.valid_until
          ? new Date(coupon.valid_until).toISOString().split("T")[0]
          : "",
        usage_limit: coupon.usage_limit || null,
        per_user_limit: coupon.per_user_limit || 1,
        applicable_to: {
          type: coupon?.applicable_to?.type || "all",
          category_ids:
            coupon?.applicable_to?.category_ids?.map((id: any) =>
              typeof id === "object" ? id._id : id,
            ) || [],
          product_ids:
            coupon?.applicable_to?.product_ids?.map((id: any) =>
              typeof id === "object" ? id._id : id,
            ) || [],
        },
        is_active: coupon.is_active ?? true,
        show_on_products: coupon.show_on_products ?? true,
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_amount: 0,
        max_discount: null,
        valid_from: "",
        valid_until: "",
        usage_limit: null,
        per_user_limit: 1,
        applicable_to: {
          type: "all",
          category_ids: [],
          product_ids: [],
        },
        is_active: true,
        show_on_products: true,
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      };

      if (coupon) {
        await couponsApi.update(coupon._id, payload);
      } else {
        await couponsApi.create(payload);
      }

      onSave();
    } catch (error: any) {
      setError(error.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const modalTitleId = coupon ? "edit-coupon-title" : "create-coupon-title";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-3 lg:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-2xl lg:max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
          <h2 id={modalTitleId} className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {coupon ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
            {error && (
              <div
                className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs sm:text-sm text-red-800 dark:text-red-200"
                role="alert"
              >
                {error}
              </div>
            )}

            <BasicInfoForm
              code={formData.code}
              description={formData.description}
              onCodeChange={(value) =>
                setFormData({ ...formData, code: value })
              }
              onDescriptionChange={(value) =>
                setFormData({ ...formData, description: value })
              }
            />

            <DiscountSettingsForm
              discountType={formData.discount_type}
              discountValue={formData.discount_value}
              minOrderAmount={formData.min_order_amount}
              maxDiscount={formData.max_discount}
              onDiscountTypeChange={(value) =>
                setFormData({ ...formData, discount_type: value })
              }
              onDiscountValueChange={(value) =>
                setFormData({ ...formData, discount_value: value })
              }
              onMinOrderAmountChange={(value) =>
                setFormData({ ...formData, min_order_amount: value })
              }
              onMaxDiscountChange={(value) =>
                setFormData({ ...formData, max_discount: value })
              }
            />

            <ValidityPeriodForm
              validFrom={formData.valid_from}
              validUntil={formData.valid_until}
              onValidFromChange={(value) =>
                setFormData({ ...formData, valid_from: value })
              }
              onValidUntilChange={(value) =>
                setFormData({ ...formData, valid_until: value })
              }
            />

            <UsageLimitsForm
              usageLimit={formData.usage_limit}
              perUserLimit={formData.per_user_limit}
              onUsageLimitChange={(value) =>
                setFormData({ ...formData, usage_limit: value })
              }
              onPerUserLimitChange={(value) =>
                setFormData({ ...formData, per_user_limit: value })
              }
            />

            <ApplicableToForm
              applicableTo={formData.applicable_to}
              onApplicableToChange={(applicableTo) =>
                setFormData({ ...formData, applicable_to: applicableTo })
              }
            />

            <SettingsForm
              isActive={formData.is_active}
              showOnProducts={formData.show_on_products}
              onIsActiveChange={(value) =>
                setFormData({ ...formData, is_active: value })
              }
              onShowOnProductsChange={(value) =>
                setFormData({ ...formData, show_on_products: value })
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 border-t border-theme-border-light dark:border-theme-border-dark flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close coupon modal"
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm rounded-lg hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label="Submit the coupon information"
              disabled={saving}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              {saving
                ? "Saving..."
                : coupon
                  ? "Update Coupon"
                  : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}