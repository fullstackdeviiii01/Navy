// app/(admin)/components/products/form/ProductFormPricing.tsx - UPDATED WITH STRIPE TAX CODE
"use client";

const UNITS_OF_MEASURE = [
  { value: "", label: "Select unit (optional)" },
  // Length
  { value: "meter", label: "Meter (m)" },
  { value: "centimeter", label: "Centimeter (cm)" },
  { value: "millimeter", label: "Millimeter (mm)" },
  { value: "kilometer", label: "Kilometer (km)" },
  { value: "inch", label: "Inch (in)" },
  { value: "foot", label: "Foot (ft)" },
  { value: "yard", label: "Yard (yd)" },
  { value: "mile", label: "Mile (mi)" },
  // Weight/Mass
  { value: "kilogram", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "milligram", label: "Milligram (mg)" },
  { value: "ton", label: "Ton (t)" },
  { value: "pound", label: "Pound (lb)" },
  { value: "ounce", label: "Ounce (oz)" },
  // Volume
  { value: "liter", label: "Liter (L)" },
  { value: "milliliter", label: "Milliliter (mL)" },
  { value: "gallon", label: "Gallon (gal)" },
  { value: "quart", label: "Quart (qt)" },
  { value: "pint", label: "Pint (pt)" },
  { value: "cup", label: "Cup" },
  { value: "fluid_ounce", label: "Fluid Ounce (fl oz)" },
  { value: "cubic_meter", label: "Cubic Meter (m³)" },
  // Area
  { value: "square_meter", label: "Square Meter (m²)" },
  { value: "square_foot", label: "Square Foot (ft²)" },
  { value: "acre", label: "Acre" },
  { value: "hectare", label: "Hectare (ha)" },
  // Count/Quantity
  { value: "piece", label: "Piece (pc)" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
  { value: "pair", label: "Pair" },
  { value: "set", label: "Set" },
  { value: "bundle", label: "Bundle" },
  { value: "carton", label: "Carton" },
  { value: "case", label: "Case" },
  { value: "unit", label: "Unit" },
];

// Stripe Tax Codes for common product types
const STRIPE_TAX_CODES = [
  { value: "txcd_99999999", label: "General - Tangible Goods (Default)" },
  { value: "txcd_20030000", label: "Clothing & Apparel" },
  { value: "txcd_40060003", label: "Electronics - General" },
  { value: "txcd_34020000", label: "Food & Grocery" },
  { value: "txcd_92010001", label: "Digital Products / Software" },
  { value: "txcd_10103001", label: "Books - Physical" },
  { value: "txcd_10103000", label: "Books - Digital / E-Books" },
  { value: "txcd_20010000", label: "Footwear" },
  { value: "txcd_30060006", label: "Furniture & Home" },
  { value: "txcd_40010000", label: "Computers & Accessories" },
  { value: "txcd_90000001", label: "Services - General" },
];

interface ProductFormPricingProps {
  formData: any;
  onChange: (updates: any) => void;
}

export default function ProductFormPricing({
  formData,
  onChange,
}: ProductFormPricingProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
        Pricing
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Price (USD) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => onChange({ price: e.target.value })}
            required
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Compare at Price (USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.compare_at_price}
            onChange={(e) => onChange({ compare_at_price: e.target.value })}
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Unit of Measure
          </label>
          <select
            value={formData.unit_of_measure}
            onChange={(e) => onChange({ unit_of_measure: e.target.value })}
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            {UNITS_OF_MEASURE.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stripe Tax Code Section */}
      <div className="pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-start gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Stripe Tax Code
            </label>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Used for automatic international tax calculation. Select the category that best matches this product.
            </p>
          </div>
        </div>
        <select
          value={formData.stripe_tax_code || "txcd_99999999"}
          onChange={(e) => onChange({ stripe_tax_code: e.target.value })}
          className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
        >
          {STRIPE_TAX_CODES.map((code) => (
            <option key={code.value} value={code.value}>
              {code.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1.5">
          Default: <span className="font-mono">txcd_99999999</span> — General Tangible Goods. Only relevant for international Stripe payments.
        </p>
      </div>
    </div>
  );
}