// ReturnStats.tsx
"use client";

interface ReturnStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    refunded: number;
  };
}

export default function ReturnStats({ stats }: ReturnStatsProps) {
  const statItems = [
    {
      label: "Total Returns",
      value: stats.total,
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Pending Review",
      value: stats.pending,
      color: "bg-yellow-500",
      textColor: "text-yellow-700 dark:text-yellow-300",
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Refunded",
      value: stats.refunded,
      color: "bg-green-500",
      textColor: "text-green-700 dark:text-green-300",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "bg-red-500",
      textColor: "text-red-700 dark:text-red-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-2 sm:p-3 lg:p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {item.label}
              </p>
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold mt-0.5 sm:mt-1 ${item.textColor}`}>
                {item.value}
              </p>
            </div>
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.color}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}