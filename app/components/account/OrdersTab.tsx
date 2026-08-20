// app/components/account/OrdersTab.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ordersApi } from "../../../lib/api/orders";
import { reviewsApi } from "../../../lib/api/reviews";
import {
  ShoppingBag,
  Package,
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ReviewForm from "../reviews/ReviewForm";
import Loader from "../shared/Loader";
import Image from "next/image";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface OrdersTabProps {
  dbUser: any;
}

export default function OrdersTab({ dbUser }: OrdersTabProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [reviewingProduct, setReviewingProduct] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersApi.getOrders();
      setOrders(data.orders);
    } catch (error: any) {
      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancellingId(orderId);
    try {
      await ordersApi.cancelOrder(orderId);
      fetchOrders();
    } catch (error: any) {
      alert(error.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const handleReviewClick = (item: any, orderId: string) => {
    setReviewingProduct({ ...item, orderId });
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
    images: Array<{ url: string; caption?: string }>;
    videos: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => {
    try {
      await reviewsApi.createReview({
        product_id: reviewingProduct.product_id,
        ...formData,
      });
      setShowReviewModal(false);
      setReviewingProduct(null);
      alert("Review submitted successfully! It will be published after approval.");
      fetchOrders();
    } catch (error: any) {
      throw error;
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        icon: Clock,
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        icon: CheckCircle,
        label: "Confirmed",
      },
      processing: {
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        icon: Package,
        label: "Processing",
      },
      shipped: {
        color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
        icon: Truck,
        label: "Shipped",
      },
      delivered: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        icon: XCircle,
        label: "Cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Order History
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {orders.length} {orders.length === 1 ? "order" : "orders"} total
              </p>
            </div>
            {orders.length > 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Package className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Orders Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start shopping to see your order history here. Track deliveries, manage returns, and review your purchases.
            </p>
            <button
            aria-label="Start Shopping"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-3 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
            >
              <Package className="w-4 h-4" />
              Start Shopping
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrders.has(order._id);
              const itemCount = order.items?.length || 0;
              const canReview = order.status === "delivered";
              const unreviewedCount = canReview
                ? order.items?.filter((item: any) => !item.reviewed).length || 0
                : 0;

              return (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-mono text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400">
                            {order.order_number}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          {canReview && unreviewedCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3" />
                              {unreviewedCount} to review
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span>Placed {new Date(order.placed_at).toLocaleDateString()}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="flex items-center gap-4 lg:gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                            Total
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(order.pricing.total)}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                          aria-label="View order details"
                            onClick={() => router.push(`/orders/${order._id}`)}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </button>

                          {["pending", "confirmed"].includes(order.status) && (
                            <button
                            aria-label="Cancel this order"
                              onClick={() => handleCancelOrder(order._id)}
                              disabled={cancellingId === order._id}
                              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {cancellingId === order._id ? "Cancelling..." : "Cancel"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Items Section */}
                  {itemCount > 0 && (
                    <>
                      <button
                        aria-label={`${isExpanded ? "Hide" : "Show"} ${itemCount} ${itemCount === 1 ? "item" : "items"} in order`}
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="w-full px-4 sm:px-5 py-3 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-t border-gray-200 dark:border-gray-700"
                      >
                        <span>
                          {isExpanded ? "Hide" : "Show"} {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {/* Items List */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {order.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                              >
                                <div className="flex gap-3 sm:gap-4">
                                  {/* Product Image */}
                                  {item.product_image && (
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                      <Image
                                        src={item.product_image}
                                        alt={item.product_name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}

                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1 truncate">
                                      {item.product_name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                      <span>Qty: {item.quantity}</span>
                                      {item.variant && (
                                        <>
                                          <span className="hidden sm:inline">•</span>
                                          <span className="truncate">{item.variant}</span>
                                        </>
                                      )}
                                      <span className="hidden sm:inline">•</span>
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {formatPrice(item.price)}
                                      </span>
                                    </div>

                                    {/* Review Button/Status */}
                                    {canReview && (
                                      <div className="mt-3">
                                        {item.reviewed ? (
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs sm:text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Review Submitted
                                          </div>
                                        ) : (
                                          <button
                                          aria-label="Write a review"
                                            onClick={() => handleReviewClick(item, order._id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                          >
                                            <Star className="w-4 h-4" />
                                            Write Review
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && reviewingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
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
    </>
  );
}