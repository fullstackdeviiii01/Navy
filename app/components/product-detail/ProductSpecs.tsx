// app/components/product-detail/ProductSpecs.tsx
"use client";

interface ProductSpecsProps {
  specifications?: Map<string, string> | { [key: string]: string };
}

export default function ProductSpecs({ specifications }: ProductSpecsProps) {
  if (!specifications) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No specifications available for this piece.
        </p>
      </div>
    );
  }

  const specsArray = specifications instanceof Map
    ? Array.from(specifications.entries())
    : Object.entries(specifications);

  if (specsArray.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No specifications available for this piece.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" role="table" aria-label="Product specifications">
        <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
          {specsArray.map(([key, value], index) => (
            <tr key={index} className="transition-colors">
              <th scope="row" className="py-3 pr-4 text-xs uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium w-1/3 align-top">
                {key}
              </th>
              <td className="py-3 text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}