// // app/components/checkout/SavedAddressList.tsx - FULLY RESPONSIVE
"use client";

interface SavedAddressListProps {
  addresses: any[];
  onSelect: (address: any) => void;
}

export default function SavedAddressList({ addresses, onSelect }: SavedAddressListProps) {
  if (addresses.length === 0) return null;

  return (
    <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
      {addresses.map((address) => (
        <button
          key={address._id}
          onClick={() => onSelect(address)}
            aria-label={`Select ${address.full_name}'s address at ${address.line1}, ${address.city}`}
          className="w-full text-left p-3 sm:p-3.5 md:p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-[0.98]"
        >
          <p className="font-medium text-gray-900 dark:text-white mb-1 text-xs sm:text-sm md:text-base truncate">
            {address.full_name}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {address.line1}, {address.city}, {address.state}
          </p>
        </button>
      ))}
    </div>
  );
}