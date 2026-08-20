// ============================================
// app/lib/utils/reports/dateUtils.ts
// ============================================
export function calculateDateRange(range: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
  } else {
    switch (range) {
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      case "30d":
        start.setDate(now.getDate() - 30);
        break;
      case "90d":
        start.setDate(now.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
  }

  return { start, end };
}

export function calculatePreviousPeriod(start: Date, end: Date) {
  const periodLength = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - periodLength);
  const prevEnd = new Date(start);

  return { prevStart, prevEnd };
}
