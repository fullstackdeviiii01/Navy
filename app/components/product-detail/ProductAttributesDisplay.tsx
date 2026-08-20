// app/components/product-detail/ProductAttributesDisplay.tsx

import { ICategoryAttribute } from "../../models/Category";

interface ProductAttributesDisplayProps {
  attributes: { [key: string]: any };
  categoryAttributes?: ICategoryAttribute[];
}

export default function ProductAttributesDisplay({
  attributes,
  categoryAttributes,
}: ProductAttributesDisplayProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null;
  }

  const formatAttributeValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  const getAttributeLabel = (attrName: string): string => {
    const catAttr = categoryAttributes?.find((a) => a.name === attrName);
    return catAttr?.label || attrName.replace(/_/g, " ");
  };

  const sortedAttributes = categoryAttributes
    ? Object.entries(attributes).sort(
        ([keyA], [keyB]) => {
          const catAttrA = categoryAttributes.find((a) => a.name === keyA);
          const catAttrB = categoryAttributes.find((a) => a.name === keyB);
          return (catAttrA?.sort_order || 0) - (catAttrB?.sort_order || 0);
        }
      )
    : Object.entries(attributes);

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg p-3 sm:p-4 md:p-5 lg:p-6">
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3 sm:mb-4">
        Product Attributes
      </h3>

      <dl className="space-y-2 sm:space-y-2.5 md:space-y-3">
        {sortedAttributes.map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3 md:gap-4 pb-2 sm:pb-2.5 md:pb-3 last:pb-0 border-b border-theme-border-light dark:border-theme-border-dark last:border-b-0"
          >
            <dt className="font-medium text-xs sm:text-sm md:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark capitalize flex-shrink-0">
              {getAttributeLabel(key)}
            </dt>

            <dd className="text-left sm:text-right flex-1 break-words">
              {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 sm:justify-end">
                  {value.map((v, i) => (
                    <span
                      key={i}
                      className="inline-block px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-theme-primary/10 text-theme-primary rounded-full text-xs sm:text-sm font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              ) : typeof value === "boolean" ? (
                <span
                  className={`inline-flex px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    value
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {value ? "Yes" : "No"}
                </span>
              ) : (
                <span className="text-xs sm:text-sm md:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {formatAttributeValue(value)}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}