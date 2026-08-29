// app/(admin)/promotions/components/CouponRulesModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Tag, Check, Calendar, DollarSign, Percent, Layers, Package, SlidersHorizontal } from "lucide-react";
import { couponsApi } from "../../../../lib/api/coupons";
import { categoriesApi } from "../../../../lib/api/categories";
import { productsApi } from "../../../../lib/api/products";

interface CouponRulesModalProps {
  coupon: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function CouponRulesModal({
  coupon,
  isOpen,
  onClose,
  onSave,
}: CouponRulesModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    min_order_amount: 0,
    max_discount: null as number | null,
    valid_from: "",
    valid_until: "",
    usage_limit: null as number | null,
    per_user_limit: 1,
    is_active: true,
    show_on_products: true,
    applicable_to: {
      type: "all" as "all" | "categories" | "products" | "custom",
      category_ids: [] as string[],
      product_ids: [] as string[],
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchLookups();
    }
  }, [isOpen]);

  const fetchLookups = async () => {
    setLoadingLookups(true);
    try {
      const [catData, prodData] = await Promise.all([
        categoriesApi.getAll(false),
        productsApi.getAll({ limit: 1000 }),
      ]);
      setCategories(catData.categories || []);
      setProducts(prodData.products || []);
    } catch (err) {
      console.error("Failed to load promotion lookups:", err);
    } finally {
      setLoadingLookups(false);
    }
  };

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
        is_active: coupon.is_active ?? true,
        show_on_products: coupon.show_on_products ?? true,
        applicable_to: {
          type:
            coupon.applicable_to?.type === "custom" ||
            (coupon.applicable_to?.category_ids?.length && coupon.applicable_to?.product_ids?.length)
              ? "custom"
              : coupon.applicable_to?.type || "all",
          category_ids:
            coupon.applicable_to?.category_ids?.map((id: any) =>
              typeof id === "object" ? id._id?.toString() : id?.toString()
            ) || [],
          product_ids:
            coupon.applicable_to?.product_ids?.map((id: any) =>
              typeof id === "object" ? id._id?.toString() : id?.toString()
            ) || [],
        },
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 10,
        min_order_amount: 0,
        max_discount: null,
        valid_from: today,
        valid_until: thirtyDaysLater,
        usage_limit: null,
        per_user_limit: 1,
        is_active: true,
        show_on_products: true,
        applicable_to: {
          type: "all",
          category_ids: [],
          product_ids: [],
        },
      });
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleCategoryToggle = (catId: string) => {
    const current = formData.applicable_to.category_ids;
    const exists = current.includes(catId);
    const updated = exists ? current.filter((id) => id !== catId) : [...current, catId];

    setFormData({
      ...formData,
      applicable_to: {
        ...formData.applicable_to,
        category_ids: updated,
      },
    });
  };

  const handleProductToggle = (prodId: string) => {
    const current = formData.applicable_to.product_ids;
    const exists = current.includes(prodId);
    const updated = exists ? current.filter((id) => id !== prodId) : [...current, prodId];

    setFormData({
      ...formData,
      applicable_to: {
        ...formData.applicable_to,
        product_ids: updated,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (
      formData.applicable_to.type === "categories" &&
      formData.applicable_to.category_ids.length === 0
    ) {
      setError("Please select at least one category for this promotion.");
      setSaving(false);
      return;
    }

    if (
      formData.applicable_to.type === "products" &&
      formData.applicable_to.product_ids.length === 0
    ) {
      setError("Please select at least one product for this promotion.");
      setSaving(false);
      return;
    }

    if (
      formData.applicable_to.type === "custom" &&
      formData.applicable_to.category_ids.length === 0 &&
      formData.applicable_to.product_ids.length === 0
    ) {
      setError("Please select at least one category or piece for combined promotion.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        applicable_to: {
          type: formData.applicable_to.type,
          category_ids:
            formData.applicable_to.type === "categories" || formData.applicable_to.type === "custom"
              ? formData.applicable_to.category_ids
              : [],
          product_ids:
            formData.applicable_to.type === "products" || formData.applicable_to.type === "custom"
              ? formData.applicable_to.product_ids
              : [],
        },
      };

      if (coupon) {
        await couponsApi.update(coupon._id, payload);
      } else {
        await couponsApi.create(payload);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || "Failed to save promotion voucher.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-xl max-h-[90vh] rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {coupon ? "Edit Promotion Voucher" : "Create New Promotion Voucher"}
              </h3>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
                Configure discount rates, minimum cart limits, and product eligibility.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-200 text-xs">
              {error}
            </div>
          )}

          {/* Code & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Voucher Code *
              </label>
              <input
                type="text"
                placeholder="e.g. LUXE2026"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm uppercase font-bold border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Campaign Description
              </label>
              <input
                type="text"
                placeholder="e.g. Special Holiday Discount"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
              />
            </div>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/30">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Discount Type
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value as "percentage" | "fixed",
                  })
                }
                className="w-full px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              >
                <option value="percentage">Percentage (%) Reduction</option>
                <option value="fixed">Fixed Flat Amount (Rs.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Discount Value *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_value: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Minimum Cart Total (Rs.)
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    min_order_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            {formData.discount_type === "percentage" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  Maximum Discount Cap (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Unlimited if left empty"
                  value={formData.max_discount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_discount: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
                />
              </div>
            )}
          </div>

          {/* Applicable Scope Section */}
          <div className="p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/40 dark:bg-theme-bg-dark/20 space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Applicable Catalog Scope *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      applicable_to: { ...formData.applicable_to, type: "all" },
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    formData.applicable_to.type === "all"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900"
                      : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-card-light"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>All Pieces</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      applicable_to: { ...formData.applicable_to, type: "categories" },
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    formData.applicable_to.type === "categories"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900"
                      : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-card-light"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Categories</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      applicable_to: { ...formData.applicable_to, type: "products" },
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    formData.applicable_to.type === "products"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900"
                      : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-card-light"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Specific Pieces</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      applicable_to: { ...formData.applicable_to, type: "custom" },
                    })
                  }
                  className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    formData.applicable_to.type === "custom"
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900"
                      : "border-theme-border-light dark:border-theme-border-dark hover:bg-theme-card-light"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Combined Scope</span>
                </button>
              </div>
            </div>

            {/* Categories Selector */}
            {(formData.applicable_to.type === "categories" || formData.applicable_to.type === "custom") && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-theme-text-muted-light block uppercase tracking-wider">
                  Select Categories ({formData.applicable_to.category_ids.length} selected)
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark">
                  {categories.map((cat) => {
                    const isSelected = formData.applicable_to.category_ids.includes(
                      cat._id?.toString()
                    );
                    return (
                      <label
                        key={cat._id}
                        onClick={() => handleCategoryToggle(cat._id?.toString())}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-400"
                            : "border-theme-border-light/50 hover:bg-theme-bg-light"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-neutral-900 focus:ring-neutral-500"
                        />
                        <span className="truncate text-xs font-medium">{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products Selector */}
            {(formData.applicable_to.type === "products" || formData.applicable_to.type === "custom") && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-theme-text-muted-light block uppercase tracking-wider">
                    Select Pieces ({formData.applicable_to.product_ids.length} selected)
                  </span>
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="px-2 py-1 text-[11px] border border-theme-border-light rounded bg-theme-surface-light dark:bg-theme-surface-dark"
                  />
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark">
                  {filteredProducts.map((prod) => {
                    const isSelected = formData.applicable_to.product_ids.includes(
                      prod._id?.toString()
                    );
                    return (
                      <label
                        key={prod._id}
                        onClick={() => handleProductToggle(prod._id?.toString())}
                        className={`flex items-center justify-between gap-2 p-2 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-neutral-100 dark:bg-neutral-800 border-neutral-400"
                            : "border-theme-border-light/50 hover:bg-theme-bg-light"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-neutral-900 focus:ring-neutral-500"
                          />
                          <span className="truncate text-xs font-medium">{prod.name}</span>
                        </div>
                        <span className="text-[10px] text-theme-text-muted-light shrink-0">
                          Rs. {prod.pricing?.price?.toLocaleString() || prod.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Validity Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Valid From Date *
              </label>
              <input
                type="date"
                value={formData.valid_from}
                onChange={(e) =>
                  setFormData({ ...formData, valid_from: e.target.value })
                }
                required
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Valid Until Date *
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
                required
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Total Redemptions Limit
              </label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited if left empty"
                value={formData.usage_limit ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Uses Allowed Per Customer
              </label>
              <input
                type="number"
                min="1"
                value={formData.per_user_limit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    per_user_limit: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded text-neutral-900 focus:ring-neutral-500"
              />
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Campaign Active
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_on_products}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    show_on_products: e.target.checked,
                  })
                }
                className="rounded text-neutral-900 focus:ring-neutral-500"
              />
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Display on Product Page Banner
              </span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Voucher"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
