// app/components/product-detail/ProductQuantity.tsx
"use client";

import { Minus, Plus } from "lucide-react";

interface ProductQuantityProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  max?: number;
  showLabel?: boolean;
  showStock?: boolean;
}

export default function ProductQuantity({ 
  quantity, 
  onQuantityChange, 
  max = 999,
  showLabel = true,
  showStock = false,
}: ProductQuantityProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1) {
      onQuantityChange(value);
    }
  };

  return (
    <div className="flex items-center shrink-0">
      {/* Symmetrical 3-column stepper matching customer reference */}
      <div 
        className="grid grid-cols-3 items-stretch border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-[#1E1711] rounded-xs h-12 w-28 sm:w-32 shrink-0 select-none overflow-hidden" 
        role="group" 
        aria-label="Quantity selector"
      >
        <button
          type="button"
          onClick={handleDecrease}
          disabled={quantity <= 1}
          className="flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-r border-neutral-300 dark:border-neutral-600 cursor-pointer"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={1}
          className="w-full h-full text-center font-sans text-sm font-semibold text-neutral-900 dark:text-neutral-100 bg-transparent focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none select-all"
          aria-label={`Quantity, ${quantity}`}
          aria-valuemin={1}
          aria-valuenow={quantity}
        />
        
        <button
          type="button"
          onClick={handleIncrease}
          disabled={quantity >= max}
          className="flex items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white disabled:opacity-25 disabled:cursor-not-allowed hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-l border-neutral-300 dark:border-neutral-600 cursor-pointer"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}