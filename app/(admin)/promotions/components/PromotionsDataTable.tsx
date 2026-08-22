// app/(admin)/promotions/components/PromotionsDataTable.tsx
"use client";

import { Edit, Trash2, Tag, Calendar, Percent, DollarSign } from "lucide-react";

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  per_user_limit: number;
  applicable_to: {
    type: "all" | "categories" | "products";
    category_ids: string[];
    product_ids: string[];
  };
  used_count: number;
  is_active: boolean;
  show_on_products: boolean;
}

interface PromotionsDataTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export default function PromotionsDataTable({
  coupons,
  onEdit,
  onDelete,
}: PromotionsDataTableProps) {
  if (coupons.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center space-y-2">
        <p className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No promotional campaigns created yet
        </p>
        <p className="text-xs text-theme-text-muted-light">
          Click "Create Promotion" above to launch a new discount voucher.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Voucher Code</th>
              <th className="py-3 px-4">Discount Value</th>
              <th className="py-3 px-4">Threshold & Bounds</th>
              <th className="py-3 px-4">Validity Window</th>
              <th className="py-3 px-4">Redemptions</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {coupons.map((c) => {
              const isExpired = new Date(c.valid_until) < new Date();

              return (
                <tr
                  key={c._id}
                  className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
                >
                  {/* Code */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-xs tracking-wider text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                          {c.code}
                        </span>
                        {c.description && (
                          <span className="text-[10px] text-theme-text-muted-light truncate max-w-[160px] block">
                            {c.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Value */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark font-serif">
                      {c.discount_type === "percentage"
                        ? `${c.discount_value}% OFF`
                        : `Rs. ${c.discount_value.toLocaleString()} FLAT`}
                    </span>
                  </td>

                  {/* Threshold */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    <p className="text-[11px]">
                      Min. Order: Rs. {c.min_order_amount?.toLocaleString() || 0}
                    </p>
                    {c.max_discount && (
                      <p className="text-[10px] text-theme-text-muted-light">
                        Max Cap: Rs. {c.max_discount.toLocaleString()}
                      </p>
                    )}
                  </td>

                  {/* Validity */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    <p className="text-[11px]">
                      {new Date(c.valid_from).toLocaleDateString()} –{" "}
                      {new Date(c.valid_until).toLocaleDateString()}
                    </p>
                    {isExpired && (
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        Expired
                      </span>
                    )}
                  </td>

                  {/* Redemptions */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {c.used_count || 0}
                    </span>
                    {c.usage_limit && (
                      <span className="text-[10px] text-theme-text-muted-light">
                        {" "}
                        / {c.usage_limit}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.is_active && !isExpired
                          ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
                      }`}
                    >
                      {c.is_active && !isExpired ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit Voucher Parameters"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c._id)}
                        className="p-1.5 text-theme-text-muted-light hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
