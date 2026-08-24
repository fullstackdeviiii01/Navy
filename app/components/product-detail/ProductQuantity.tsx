// app/components/product-detail/ProductQuantity.tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface ProductQuantityProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max: number;
  showLabel?: boolean;
  showStock?: boolean;
}

export default function ProductQuantity({ 
  quantity, 
  onQuantityChange, 
  max,
  showLabel = true,
  showStock = true,
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
    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 py-1">
      <div className="flex items-center gap-3">
        {showLabel && (
          <span 
            className="text-xs uppercase tracking-[0.2em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark shrink-0" 
            id="quantity-label"
          >
            QUANTITY:
          </span>
        )}
        
        {/* Stepper Control */}
        <div 
          className="inline-flex items-center border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark shadow-2xs" 
          role="group" 
          aria-labelledby={showLabel ? "quantity-label" : undefined}
          aria-label="Quantity selector"
        >
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          
          <input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            min={1}
            max={max}
            className="w-10 sm:w-12 h-8 sm:h-9 text-center text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-x border-theme-border-light dark:border-theme-border-dark bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={`Quantity, ${quantity} of ${max} available`}
            aria-valuemin={1}
            aria-valuemax={max}
            aria-valuenow={quantity}
          />
          
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= max}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-card-light dark:hover:bg-theme-card-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showStock && max > 0 && (
        <span 
          className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark whitespace-nowrap shrink-0" 
          aria-live="polite"
        >
          ({max} AVAILABLE)
        </span>
      )}
    </div>
  );
}