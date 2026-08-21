// app/components/product-detail/ProductQuantity.tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface ProductQuantityProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max: number;
}

export default function ProductQuantity({ 
  quantity, 
  onQuantityChange, 
  max 
}: ProductQuantityProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1 && value <= max) {
      onQuantityChange(value);
    } else if (value > max) {
      onQuantityChange(max);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark" id="quantity-label">
        Quantity:
      </span>
      <div className="inline-flex items-center border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark" role="group" aria-labelledby="quantity-label">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={1}
          max={max}
          className="w-14 h-10 text-center text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-x border-theme-border-light dark:border-theme-border-dark bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label={`Quantity, ${quantity} of ${max} available`}
          aria-valuemin={1}
          aria-valuemax={max}
          aria-valuenow={quantity}
        />
        <button
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="w-10 h-10 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="text-[11px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark" aria-live="polite">
        ({max} AVAILABLE)
      </span>
    </div>
  );
}