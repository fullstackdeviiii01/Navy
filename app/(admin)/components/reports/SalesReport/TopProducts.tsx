// app/(admin)/components/reports/reports/SalesReport/TopProducts.tsx
"use client";

interface Product {
  name: string;
  image: string;
  quantity: number;
  revenue: number;
}

interface TopProductsProps {
  products: Product[];
}

export default function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 lg:p-6">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
        Top Selling Products
      </h3>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-theme-border-light dark:border-theme-border-dark">
                <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap min-w-[150px]">
                  Product
                </th>
                <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                  Units Sold
                </th>
                <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any, index: number) => (
                <tr
                  key={index}
                  className="border-b border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="py-2 px-3 sm:py-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <span className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                    {product.quantity}
                  </td>
                  <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark whitespace-nowrap">
                    ${product.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}