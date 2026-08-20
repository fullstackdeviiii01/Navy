import { useEffect, useState } from "react";
import { ICategoryAttribute } from "../../../../app/models/Category";
import AttributeFieldInput from "../shared/AttributeFieldInput";
import { categoriesApi } from "../../../../lib/api/categories";
import Loader from "../../../components/shared/Loader";

interface ProductAttributeFieldsProps {
  categoryId: string;
  attributes: { [key: string]: any };
  onAttributesChange: (attributes: { [key: string]: any }) => void;
}

interface ValidationError {
  [attributeName: string]: string[];
}

export default function ProductAttributeFields({
  categoryId,
  attributes,
  onAttributesChange,
}: ProductAttributeFieldsProps) {
  const [categoryAttributes, setCategoryAttributes] = useState<ICategoryAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationError>({});

  useEffect(() => {
    fetchCategoryAttributes();
  }, [categoryId]);

  const fetchCategoryAttributes = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAttributes(categoryId);
      const sorted = (data.attributes || []).sort(
        (a, b) => a.sort_order - b.sort_order
      );
      setCategoryAttributes(sorted);
    } catch (error) {
      console.error("Failed to fetch category attributes:", error);
      setCategoryAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const validateAttribute = (
    attribute: ICategoryAttribute,
    value: any
  ): string[] => {
    const errors: string[] = [];

    if (attribute.required && !value) {
      errors.push(`${attribute.label} is required`);
      return errors;
    }

    if (!value) return errors;

    switch (attribute.type) {
      case "number":
        if (isNaN(value)) {
          errors.push(`${attribute.label} must be a valid number`);
        }
        break;
      case "multiselect":
        if (!Array.isArray(value)) {
          errors.push(`${attribute.label} must be an array`);
        }
        break;
    }

    return errors;
  };

  const handleAttributeChange = (attributeName: string, value: any) => {
    const attribute = categoryAttributes.find((a) => a.name === attributeName);

    if (!attribute) return;

    const validationErrors = validateAttribute(attribute, value);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (validationErrors.length > 0) {
        newErrors[attributeName] = validationErrors;
      } else {
        delete newErrors[attributeName];
      }
      return newErrors;
    });

    onAttributesChange({
      ...attributes,
      [attributeName]: value,
    });
  };

 if (loading) {
  return (
    <div className="relative h-64">
      <Loader />
    </div>
  );
}

  if (categoryAttributes.length === 0) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        This category has no attributes defined.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
        Product Attributes
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryAttributes.map((attribute) => (
          <AttributeFieldInput
            key={attribute.name}
            attribute={attribute}
            value={attributes[attribute.name]}
            onChange={(value) => handleAttributeChange(attribute.name, value)}
            errors={errors[attribute.name]}
          />
        ))}
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Please fix the following errors:
          </p>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {Object.entries(errors).map(([attrName, attrErrors]) => (
              <li key={attrName}>
                • {attrErrors.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}