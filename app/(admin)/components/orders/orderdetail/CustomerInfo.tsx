// app/(admin)/components/orders/orderdetail/CustomerInfo.tsx
interface CustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
  customer_since?: string;
  order_count?: number;
}

interface AdminCustomerInfoProps {
  customer: CustomerInfo;
  isGuest?: boolean;
  guestInfo?: {
    email: string;
    name: string;
    phone: string;
  };
}

export default function CustomerInfo({ customer, isGuest, guestInfo }: AdminCustomerInfoProps) {
  const displayName = isGuest ? guestInfo?.name : customer.name;
  const displayEmail = isGuest ? guestInfo?.email : customer.email;
  const displayPhone = isGuest ? guestInfo?.phone : customer.phone;

  return (
    <div className="space-y-3">
      {isGuest && (
        <div className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full mb-2">
          Guest Order
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
        {/* Name */}
        <div className="border-l-2 border-emerald-400/40 pl-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-sm">
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1.5">
            {isGuest ? "Guest Name" : "Customer Name"}
          </p>
          <p className="font-medium text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {displayName || "N/A"}
          </p>
        </div>

        {/* Email */}
        <div className="border-l-2 border-emerald-400/40 pl-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-sm">
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1.5">
            Email Address
          </p>
          <p className="font-medium text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            {displayEmail || "N/A"}
          </p>
        </div>

        {/* Phone / Total Orders */}
        <div className="border-l-2 border-emerald-400/40 pl-3 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-sm">
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1.5">
            {isGuest ? "Phone Number" : "Total Orders"}
          </p>
          <p className="font-medium text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {isGuest ? displayPhone || "N/A" : customer.order_count || 0}
          </p>
        </div>
      </div>
    </div>
  );
}