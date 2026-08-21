// app/components/checkout/SavedAddressList.tsx
"use client";

interface SavedAddressListProps {
  addresses: any[];
  onSelect: (address: any) => void;
}

export default function SavedAddressList({ addresses, onSelect }: SavedAddressListProps) {
  if (addresses.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {addresses.map((address) => (
        <button
          key={address._id}
          onClick={() => onSelect(address)}
          aria-label={`Select ${address.full_name}'s address at ${address.line1}, ${address.city}`}
          className="w-full text-left p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-colors"
        >
          <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1 text-xs sm:text-sm truncate">
            {address.full_name}
          </p>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark line-clamp-2">
            {address.line1}, {address.city}, {address.state}
          </p>
        </button>
      ))}
    </div>
  );
}