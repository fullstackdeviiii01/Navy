// ReturnStatusBadge.tsx
"use client";

interface ReturnStatusBadgeProps {
  status: string;
}

export default function ReturnStatusBadge({ status }: ReturnStatusBadgeProps) {
  const statusConfig: Record<string, { color: string; bg: string; text: string }> = {
    pending: {
      color: "text-yellow-700 dark:text-yellow-300",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "Pending Review",
    },
    approved: {
      color: "text-blue-700 dark:text-blue-300",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "Approved",
    },
    rejected: {
      color: "text-red-700 dark:text-red-300",
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "Rejected",
    },
    refunded: {
      color: "text-green-700 dark:text-green-300",
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "Refunded",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-1.5 sm:px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}
    >
      <span className="hidden xs:inline">{config.text}</span>
      <span className="xs:hidden">
        {status === "pending" ? "Pending" : 
         status === "approved" ? "Approved" : 
         status === "rejected" ? "Rejected" : "Refunded"}
      </span>
    </span>
  );
}