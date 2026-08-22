// // app/(admin)/components/reports/reports/InventoryReport.tsx
"use client";

import { useState, useEffect } from "react";
import { Download, Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { reportsApi } from "../../../../../lib/api/reports";
import { exportToPDF } from "../export/exportUtils";
import Loader from "../../../../components/shared/Loader";
import { getPrimaryProductImage } from "../../../../../lib/utils/productImageUtils";

export default function InventoryReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await reportsApi.getInventoryReport();
      setData(response);
    } catch (error) {
      console.error("Failed to fetch inventory report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data) return;
    exportToPDF("inventory", data, "current");
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  if (!data) return null;

  const report = data.data;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Inventory Status Report
        </h2>
        <button
          onClick={handleExport}
          className="flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Export PDF</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Total Products
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.totalProducts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Low Stock
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.lowStockCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Out of Stock
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {report.outOfStockCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-muted-dark">
                Inventory Value
              </p>
              <p className="text-lg sm:text-xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                ${report.totalInventoryValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {report.outOfStockProducts.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-red-300 dark:border-red-800 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Out of Stock Products
            </h3>
          </div>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-theme-border-light dark:border-theme-border-dark">
                    <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap min-w-[180px]">
                      Product
                    </th>
                    <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap hidden sm:table-cell">
                      SKU
                    </th>
                    <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.outOfStockProducts.map((product: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                    >
                      <td className="py-2 px-3 sm:py-3 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={getPrimaryProductImage(product)}
                            alt={product.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0 bg-black/5"
                          />
                          <span className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden sm:table-cell">
                        <span className="truncate max-w-[120px] inline-block">{product.inventory.sku}</span>
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4 text-right">
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                          {product.inventory.stock_quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {report.lowStockProducts.length > 0 && (
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-orange-300 dark:border-orange-800 p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Low Stock Products
            </h3>
          </div>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-theme-border-light dark:border-theme-border-dark">
                    <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap min-w-[180px]">
                      Product
                    </th>
                    <th className="text-left py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap hidden md:table-cell">
                      SKU
                    </th>
                    <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap">
                      Current Stock
                    </th>
                    <th className="text-right py-2 px-3 sm:py-3 sm:px-4 text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark whitespace-nowrap hidden sm:table-cell">
                      Threshold
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.lowStockProducts.map((product: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-theme-border-light dark:border-theme-border-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                    >
                      <td className="py-2 px-3 sm:py-3 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={getPrimaryProductImage(product)}
                            alt={product.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0 bg-black/5"
                          />
                          <span className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden md:table-cell">
                        <span className="truncate max-w-[120px] inline-block">{product.inventory.sku}</span>
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                        {product.inventory.stock_quantity}
                      </td>
                      <td className="py-2 px-3 sm:py-3 sm:px-4 text-right text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark hidden sm:table-cell whitespace-nowrap">
                        {product.inventory.low_stock_threshold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}