// app/(public)/pages/GuestOrderTrackingPage.tsx
"use client";

import { useState } from "react";
import { Search, Package, AlertCircle, ArrowLeft } from "lucide-react";
import { ordersApi } from "../../../lib/api/orders";
import { reviewsApi } from "../../../lib/api/reviews";
import UserOrderDetailView from "../../components/orders/orderdetail/UserOrderDetailView";
import ReviewForm from "../../components/reviews/ReviewForm";
import Loader from "../../components/shared/Loader";

export default function GuestOrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingProduct, setReviewingProduct] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      setError("Please enter both order number and email");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders/guest-lookup?order_number=${encodeURIComponent(
          orderNumber
        )}&email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Order not found");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to find order");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (order) {
      handleSearch(new Event("submit") as any);
    }
  };

  const handleReviewClick = (item: any) => {
    setReviewingProduct({
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      variant_attributes: item.variant_attributes,
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (formData: {
    rating: number;
    title: string;
    comment: string;
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => {
    try {
      await reviewsApi.createReview({
        product_id: reviewingProduct.product_id,
        ...formData,
      });
      setShowReviewModal(false);
      setReviewingProduct(null);
      alert("Review submitted successfully! It will be published after approval.");
      handleRefresh();
    } catch (error: any) {
      throw error;
    }
  };

  const resetSearch = () => {
    setOrder(null);
    setSearched(false);
    setOrderNumber("");
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12 sm:py-16 transition-colors">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="sr-only">Order Tracking</h1>
        
        {/* Search Section */}
        {!order && (
          <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 sm:p-10 shadow-sm max-w-xl mx-auto">
            <div className="text-center mb-8 pb-6 border-b border-theme-border-light dark:border-theme-border-dark">
              <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
                ORDER LOOKUP
              </p>
              <h2 className="text-3xl sm:text-4xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                Track <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">your piece</span>
              </h2>
              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Follow the progress of your handcrafted order from our workshop to your door.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="order-number" className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  Order Number *
                </label>
                <input
                  id="order-number"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="ORD-XXXXX-XXXXX"
                  className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono text-xs sm:text-sm uppercase focus:outline-none focus:border-theme-hover-light"
                  required
                />
              </div>

              <div>
                <label htmlFor="email-address" className="block text-xs uppercase tracking-[0.15em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  Email Address *
                </label>
                <input
                  id="email-address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs" role="alert">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-all disabled:opacity-40"
              >
                {loading ? "SEARCHING..." : "TRACK ORDER"}
              </button>
            </form>
          </div>
        )}

        {/* Order Details */}
        {loading && (
          <div className="relative py-12" role="status" aria-live="polite">
            <Loader />
          </div>
        )}

        {order && !loading && (
          <div>
            <button
              onClick={resetSearch}
              className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Track Another Order</span>
            </button>
            
            <UserOrderDetailView
              order={order}
              onCancel={async () => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  try {
                    await ordersApi.cancelOrder(order._id);
                    handleRefresh();
                  } catch (err: any) {
                    alert(err.message || "Failed to cancel order");
                  }
                }
              }}
              onRefresh={handleRefresh}
              onReviewClick={handleReviewClick}
              isGuestView={true}
            />
          </div>
        )}

        {/* No Results */}
        {!order && !loading && searched && !error && (
          <div className="text-center py-12 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark max-w-xl mx-auto mt-6" role="status">
            <Package className="w-8 h-8 text-theme-hover-light dark:text-theme-hover-dark mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-lg font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
              No Order Found
            </h3>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Please check your order number and email address
            </p>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && reviewingProduct && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="overflow-y-auto max-h-[90vh] p-6">
              <ReviewForm
                productId={reviewingProduct.product_id}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewModal(false);
                  setReviewingProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}