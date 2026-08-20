// app/lib/utils/reports/aggregationUtils.ts
// ============================================
export function generateDailyBreakdown(orders: any[], start: Date, end: Date) {
  const dailyMap = new Map();
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    dailyMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
    current.setDate(current.getDate() + 1);
  }

  orders.forEach((order) => {
    const dateStr = new Date(order.placed_at).toISOString().split("T")[0];
    if (dailyMap.has(dateStr)) {
      const day = dailyMap.get(dateStr);
      day.revenue += order.pricing.total;
      day.orders += 1;
    }
  });

  return Array.from(dailyMap.values());
}

export function groupOrdersByStatus(orders: any[]) {
  const statusMap = new Map();
  orders.forEach((order) => {
    const status = order.status;
    if (!statusMap.has(status)) {
      statusMap.set(status, { status, count: 0, revenue: 0 });
    }
    const stat = statusMap.get(status);
    stat.count += 1;
    stat.revenue += order.pricing.total;
  });
  return Array.from(statusMap.values());
}

export function calculateGrowth(current: number, previous: number): number {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
}
