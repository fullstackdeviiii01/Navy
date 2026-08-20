"use client";

import { useState, useEffect } from "react";
import { couponsApi } from "../../../../lib/api/coupons";
import CouponManagementHeader from "../../components/coupons/CouponManagementHeader";
import CouponsTable from "../../components/coupons/CouponsTable";
import CouponModal from "../../components/coupons/CouponModal";
import Loader from "../../../components/shared/Loader";

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

export default function CouponsPage() {
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
      const data = await couponsApi.getAll();
      setCoupons(data.coupons);
    } catch (error) {
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
      setSuccess("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      setError("Failed to delete coupon");
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    setSuccess(editingCoupon ? "Coupon updated!" : "Coupon created!");
    fetchCoupons();
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <CouponManagementHeader onCreate={handleCreate} />

      {/* Notifications */}
      {(error || success) && (
        <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 max-w-xs sm:max-w-md">
          {error && (
            <div
              className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-xs sm:text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {success && (
            <div
              className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
              role="alert"
            >
              <p className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                {success}
              </p>
            </div>
          )}
        </div>
      )}

      <CouponsTable
        coupons={coupons}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CouponModal
        coupon={editingCoupon}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </div>
  );
}