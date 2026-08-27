// app/dashboard/coupons/components/CouponsTable.tsx
"use client";

import { Tag, Edit3, Trash2 } from "lucide-react";

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

interface CouponsTableProps {
  coupons: Coupon[];
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export default function CouponsTable({
  coupons,
  onEdit,
  onDelete,
}: CouponsTableProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Code
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden sm:table-cell">
                Discount
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden lg:table-cell">
                Valid Period
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden md:table-cell">
                Usage
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-2 sm:px-4 lg:px-6 py-4 sm:py-8 lg:py-12 text-center"
                >
                  <Tag
                    size={32}
                    className="mx-auto text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2 sm:mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    No coupons yet. Create your first coupon!
                  </p>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Tag
                        size={12}
                        className="sm:w-4 sm:h-4 text-theme-primary flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate block">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate block sm:hidden">
                            {coupon.description}
                          </p>
                        )}
                        <div className="sm:hidden text-xs mt-1">
                          <span className="font-semibold">
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}%`
                              : `Rs. ${coupon.discount_value}`}
                          </span>
                          {coupon.min_order_amount > 0 && (
                            <span className="ml-2 text-theme-text-muted-light dark:text-theme-text-muted-dark">
                              Min: Rs. ${coupon.min_order_amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 hidden sm:table-cell">
                    <div>
                      <span className="font-semibold text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `Rs. ${coupon.discount_value}`}
                      </span>
                      {coupon.max_discount && (
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Max discount: Rs. ${coupon.max_discount}
                        </p>
                      )}
                      {coupon.min_order_amount > 0 && (
                        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                          Min spend: Rs. ${coupon.min_order_amount}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 hidden lg:table-cell text-xs sm:text-sm">
                    <div className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      <p>{new Date(coupon.valid_from).toLocaleDateString()}</p>
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        to {new Date(coupon.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 hidden md:table-cell">
                    <div className="text-xs sm:text-sm">
                      <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {coupon.used_count}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </p>
                      <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                        Per user: {coupon.per_user_limit}
                      </p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                    <span
                      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        coupon.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {coupon.is_active ? (
                        <>
                          <span className="hidden sm:inline">Active</span>
                          <span className="sm:hidden" aria-label="Active">✓</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Inactive</span>
                          <span className="sm:hidden" aria-label="Inactive">✗</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                      <button
                        onClick={() => onEdit(coupon)}
                        className="text-theme-primary hover:text-theme-primary-hover p-1"
                        title="Edit"
                        aria-label="Edit coupon"
                      >
                        <Edit3 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(coupon._id)}
                        className="text-theme-error hover:text-red-700 p-1"
                        title="Delete"
                        aria-label="Delete coupon"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}