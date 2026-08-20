import { useId } from "react";
import { ICategoryAttribute } from "../../../models/Category";

interface AttributeFieldInputProps {
  attribute: ICategoryAttribute;
  value: any;
  onChange: (value: any) => void;
  errors?: string[];
}

export default function AttributeFieldInput({
  attribute,
  value,
  onChange,
  errors,
}: AttributeFieldInputProps) {
  const id = useId();
  const fieldId = `${attribute.name || attribute.label}-${id}`;
  const errorId = `${fieldId}-error`;

  const baseClasses =
    "w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm";

  const errorClasses = errors && errors.length > 0 ? "border-red-500 focus:ring-red-500" : "";

  switch (attribute.type) {
    case "text":
      return (
        <div className="space-y-1">
          <label htmlFor={fieldId} className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            {attribute.label}
            {attribute.required && <span className="text-red-500">*</span>}
          </label>
          <input
            id={fieldId}
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={attribute.placeholder}
            required={attribute.required}
            aria-required={attribute.required}
            aria-invalid={errors && errors.length > 0}
            aria-describedby={errors && errors.length > 0 ? errorId : undefined}
            className={`${baseClasses} ${errorClasses}`}
          />
          {errors && errors.length > 0 && (
            <p id={errorId} className="text-xs text-red-500">
              {errors[0]}
            </p>
          )}
        </div>
      );

    case "number":
      return (
        <div className="space-y-1">
          <label htmlFor={fieldId} className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            {attribute.label}
            {attribute.required && <span className="text-red-500">*</span>}
          </label>
          <input
            id={fieldId}
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : "")}
            placeholder={attribute.placeholder}
            required={attribute.required}
            aria-required={attribute.required}
            aria-invalid={errors && errors.length > 0}
            aria-describedby={errors && errors.length > 0 ? errorId : undefined}
            className={`${baseClasses} ${errorClasses}`}
          />
          {errors && errors.length > 0 && (
            <p id={errorId} className="text-xs text-red-500">
              {errors[0]}
            </p>
          )}
        </div>
      );

    case "select":
      return (
        <div className="space-y-1">
          <label htmlFor={fieldId} className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            {attribute.label}
            {attribute.required && <span className="text-red-500">*</span>}
          </label>
          <select
            id={fieldId}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={attribute.required}
            aria-required={attribute.required}
            aria-invalid={errors && errors.length > 0}
            aria-describedby={errors && errors.length > 0 ? errorId : undefined}
            className={`${baseClasses} ${errorClasses}`}
          >
            <option value="">
              {attribute.placeholder || "Select an option"}
            </option>
            {attribute.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors && errors.length > 0 && (
            <p id={errorId} className="text-xs text-red-500">
              {errors[0]}
            </p>
          )}
        </div>
      );

    case "multiselect": {
      const helperId = `${fieldId}-helper`;
      return (
        <div className="space-y-1">
          <label htmlFor={fieldId} className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            {attribute.label}
            {attribute.required && <span className="text-red-500">*</span>}
          </label>
          <select
            id={fieldId}
            multiple
            value={value || []}
            onChange={(e) =>
              onChange(Array.from(e.target.selectedOptions, (option) => option.value))
            }
            required={attribute.required}
            aria-required={attribute.required}
            aria-invalid={errors && errors.length > 0}
            aria-describedby={`${helperId} ${errors && errors.length > 0 ? errorId : ""}`.trim()}
            className={`${baseClasses} ${errorClasses}`}
          >
            {attribute.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p id={helperId} className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Hold Ctrl/Cmd to select multiple
          </p>
          {errors && errors.length > 0 && (
            <p id={errorId} className="text-xs text-red-500">
              {errors[0]}
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}