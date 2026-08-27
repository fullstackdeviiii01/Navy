// app/(admin)/promotions/views/PromotionsStudioView.tsx
"use client";

import { useState, useEffect } from "react";
import { couponsApi } from "../../../../lib/api/coupons";
import PromotionStatsCards from "../components/PromotionStatsCards";
import PromotionsDataTable from "../components/PromotionsDataTable";
import CouponRulesModal from "../components/CouponRulesModal";
import Loader from "../../../components/shared/Loader";
import { Plus, Tag, AlertCircle, CheckCircle2 } from "lucide-react";

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

export default function PromotionsStudioView() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponsApi.getAll();
      setCoupons(data.coupons || []);
    } catch (err) {
      setError("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponsApi.delete(id);
      setSuccess("Coupon removed successfully.");
      fetchCoupons();
    } catch (err: any) {
      setError(err.message || "Failed to delete coupon");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await couponsApi.update(id, { is_active: !current });
      setSuccess(`Coupon ${!current ? "activated" : "deactivated"}`);
      fetchCoupons();
    } catch (err: any) {
      setError(err.message || "Failed to update coupon status");
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setSuccess(editingCoupon ? "Coupon updated successfully." : "New coupon created successfully.");
    fetchCoupons();
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Coupons & Discounts
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <Tag className="w-3 h-3" />
              Discounts
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Create coupon codes, set discount percentages, and manage promotional offers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Floating Status Feedback */}
      {(error || success) && (
        <div className="fixed top-5 right-5 z-50 max-w-sm animate-in slide-in-from-top-3">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <PromotionStatsCards coupons={coupons} />

      {/* Coupons Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <PromotionsDataTable
          coupons={coupons}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Rules Modal */}
      {showModal && (
        <CouponRulesModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          coupon={editingCoupon}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
