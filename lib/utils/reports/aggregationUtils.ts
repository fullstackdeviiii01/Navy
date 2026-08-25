// app/lib/utils/reports/aggregationUtils.ts
// ============================================
export function generateDailyBreakdown(orders: any[], start: Date, end: Date) {
  const getPktDateString = (d: Date): string => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  };

  const dailyMap = new Map();
  const current = new Date(start);
  const endStr = getPktDateString(end);

  while (current <= end || getPktDateString(current) === endStr) {
    const dateStr = getPktDateString(current);
    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
    }
    if (dateStr === endStr) break;
    current.setDate(current.getDate() + 1);
  }

  orders.forEach((order) => {
    const dateStr = getPktDateString(new Date(order.placed_at));
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
