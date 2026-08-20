// app/components/product-detail/ProductSpecs.tsx
"use client";

interface ProductSpecsProps {
  specifications?: Map<string, string> | { [key: string]: string };
}

export default function ProductSpecs({ specifications }: ProductSpecsProps) {
  if (!specifications) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12">
        <p className="text-xs sm:text-sm md:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No specifications available for this product.
        </p>
      </div>
    );
  }

  // Convert Map to array if needed
  const specsArray = specifications instanceof Map
    ? Array.from(specifications.entries())
    : Object.entries(specifications);

  if (specsArray.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12">
        <p className="text-xs sm:text-sm md:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No specifications available for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table" aria-label="Product specifications">
        <tbody className="divide-y border-theme-border-light dark:border-theme-border-dark">
          {specsArray.map(([key, value], index) => (
            <tr key={index} className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors">
              <th scope="row" className="py-2.5 sm:py-3 md:py-4 pr-4 sm:pr-6 md:pr-8 text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium w-1/3 align-top text-left">
                {key}
              </th>
              <td className="py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark break-words">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}