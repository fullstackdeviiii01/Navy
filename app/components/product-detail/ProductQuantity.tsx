// app/components/product-detail/ProductQuantity.tsx
"use client";

import { FaMinus, FaPlus } from "react-icons/fa";

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
    <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
      <span className="text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium" id="quantity-label">
        Quantity:
      </span>
      <div className="flex items-center border border-theme-border-light dark:border-theme-border-dark rounded-md sm:rounded-lg" role="group" aria-labelledby="quantity-label">
        <button
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="p-2 sm:p-2.5 md:p-3 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease quantity"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <FaMinus className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[10px] sm:text-xs md:text-sm" />
        </button>
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={1}
          max={max}
          className="w-12 sm:w-16 md:w-20 text-center text-xs sm:text-sm md:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium border-x border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark focus:outline-none"
          aria-label={`Quantity, ${quantity} of ${max} available`}
          aria-valuemin={1}
          aria-valuemax={max}
          aria-valuenow={quantity}
        />
        <button
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="p-2 sm:p-2.5 md:p-3 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase quantity"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          <FaPlus className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-[10px] sm:text-xs md:text-sm" />
        </button>
      </div>
      <span className="text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark whitespace-nowrap" aria-live="polite">
        {max} available
      </span>
    </div>
  );
}