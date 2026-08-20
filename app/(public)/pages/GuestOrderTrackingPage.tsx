// // app/(public)/pages/GuestOrderTrackingPage.tsx
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
    detailed_ratings: {
      quality: number;
      durability: number;
      matches_description: number;
    };
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8 md:py-12">
      <main className="container mx-auto px-4 max-w-6xl">
        <h1 className="sr-only">Guest Order Tracking</h1>
        
        {/* Search Section */}
        {!order && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm max-w-2xl mx-auto">
            <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-700">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4" aria-hidden="true">
                  <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Track Your Order
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  View order status and write product reviews
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="order-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Number *
                  </label>
                  <input
                    id="order-number"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    placeholder="ORD-XXXXX-XXXXX"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    aria-describedby="order-number-hint"
                  />
                  <p id="order-number-hint" className="sr-only">Enter your order number in the format ORD-XXXXX-XXXXX</p>
                </div>

                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="email-address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    aria-describedby="email-hint"
                  />
                  <p id="email-hint" className="sr-only">Enter the email address used for the order</p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  aria-label={loading ? "Searching for order" : "Search for order"}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Track Order
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg" role="note">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> You can find your order number in the
                  confirmation email we sent you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        {loading && (
          <div className="relative py-12" role="status" aria-live="polite">
            <Loader />
            <span className="sr-only">Loading order details</span>
          </div>
        )}

        {order && !loading && (
          <div>
            <button
              onClick={resetSearch}
              className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium min-h-[44px] px-2"
              aria-label="Track a different order"
            >
              <ArrowLeft className="w-4 h-4" />
              Track Another Order
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
          <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-w-2xl mx-auto" role="status">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Order Found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please check your order number and email address
            </p>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && reviewingProduct && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <h2 id="review-modal-title" className="sr-only">Write a review for {reviewingProduct.product_name}</h2>
            <div className="overflow-y-auto max-h-[90vh]">
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