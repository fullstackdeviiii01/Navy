// app/components/orders/BillingAddress.tsx
"use client";

interface Address {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface BillingAddressProps {
  address: Address;
  sameAsShipping: boolean;
}

export default function BillingAddress({ address, sameAsShipping }: BillingAddressProps) {
  if (sameAsShipping) {
    return (
      <p className="text-xs italic text-theme-text-muted-light dark:text-theme-text-muted-dark">
        Same as shipping address
      </p>
    );
  }

  return (
    <div className="text-xs space-y-1 text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
      <p className="font-medium text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
        {address.full_name}
      </p>
      <p>{address.phone}</p>
      <p className="pt-1">{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city}, {address.state} {address.postal_code}
      </p>
      <p>{address.country}</p>
    </div>
  );
}