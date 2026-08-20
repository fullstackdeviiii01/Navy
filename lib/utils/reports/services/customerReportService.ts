// lib/utils/reports/services/customerReportService.ts
import Order from "../../../../app/models/Order";
import User from "../../../../app/models/User";

export async function generateCustomerReport(start: Date, end: Date) {
  const [orders, newCustomers] = await Promise.all([
    Order.find({ placed_at: { $gte: start, $lte: end } })
      .populate("user_id", "name email created_at order_count total_spent")
      .lean(),
    User.countDocuments({ created_at: { $gte: start, $lte: end } }),
  ]);

  const customerMap = new Map();

  orders.forEach((order: any) => {
    const isGuest = order.order_type === "guest";
    const customerId = isGuest
      ? `guest-${order.guest_info?.email}`
      : order.user_id?._id?.toString();

    if (!customerId) return;

    if (!customerMap.has(customerId)) {
      customerMap.set(customerId, {
        customer_id: customerId,
        name: isGuest ? order.guest_info?.name : order.user_id?.name,
        email: isGuest ? order.guest_info?.email : order.user_id?.email,
        isGuest,
        orders: 0,
        revenue: 0,
        firstOrder: order.placed_at,
        lastOrder: order.placed_at,
      });
    }

    const customer = customerMap.get(customerId);
    customer.orders += 1;
    customer.revenue += order.pricing.total;
    if (order.placed_at > customer.lastOrder) {
      customer.lastOrder = order.placed_at;
    }
  });

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  return {
    newCustomers,
    activeCustomers: customers.length,
    topCustomers: customers.slice(0, 10),
    totalRevenue: customers.reduce((sum, c) => sum + c.revenue, 0),
    averageOrdersPerCustomer:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.orders, 0) / customers.length
        : 0,
    averageRevenuePerCustomer:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + c.revenue, 0) / customers.length
        : 0,
  };
}