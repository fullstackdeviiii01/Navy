// lib/utils/reports/services/customerReportService.ts
import Order from "../../../../app/models/Order";
import User from "../../../../app/models/User";

export async function generateCustomerReport(start: Date, end: Date) {
  const [orders, newCustomers, totalCustomersCount] = await Promise.all([
    Order.find({
      placed_at: { $gte: start, $lte: end },
      status: { $nin: ["cancelled"] },
    })
      .populate("user_id", "name email created_at")
      .lean(),
    User.countDocuments({ created_at: { $gte: start, $lte: end } }),
    User.countDocuments({ role: "customer" }),
  ]);

  const customerMap = new Map();

  orders.forEach((order: any) => {
    const isGuest = order.order_type === "guest";
    const customerId = isGuest
      ? `guest-${order.guest_info?.email || order.guest_info?.phone || order._id}`
      : order.user_id?._id?.toString() || `user-${order.user_id}`;

    if (!customerId) return;

    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customer_id: customerId,
        name: isGuest
          ? order.guest_info?.name || order.shipping_address?.full_name || "Guest Patron"
          : order.user_id?.name || order.shipping_address?.full_name || "Valued Patron",
        email: isGuest ? order.guest_info?.email : order.user_id?.email,
        isGuest,
        orders: 0,
        totalSpent: 0,
        revenue: 0,
        firstOrder: order.placed_at,
        lastOrder: order.placed_at,
      });
    }

    const customer = customerMap.get(customerId);
    const orderTotal = order.pricing?.total || 0;
    customer.orders += 1;
    customer.totalSpent += orderTotal;
    customer.revenue += orderTotal;
    if (order.placed_at > customer.lastOrder) {
      customer.lastOrder = order.placed_at;
    }
  });

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const activeCount = customers.length;

  return {
    totalCustomers: Math.max(totalCustomersCount, activeCount),
    newCustomers,
    activeCustomers: activeCount,
    topCustomers: customers.slice(0, 20),
    totalRevenue: totalSpentAll,
    averageSpent: activeCount > 0 ? totalSpentAll / activeCount : 0,
    averageRevenuePerCustomer: activeCount > 0 ? totalSpentAll / activeCount : 0,
    averageOrdersPerCustomer:
      activeCount > 0
        ? customers.reduce((sum, c) => sum + c.orders, 0) / activeCount
        : 0,
  };
}