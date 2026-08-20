"use client";

import { useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ICategoryAttribute, IAttributeOption } from "../../../models/Category";

interface CategoryAttributeManagerProps {
  attributes: ICategoryAttribute[];
  onAttributesChange: (attributes: ICategoryAttribute[]) => void;
  disabled?: boolean;
}

const ATTRIBUTE_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'select', label: 'Dropdown (Single Select)' },
  { value: 'multiselect', label: 'Multi-Select' },
];

export default function CategoryAttributeManager({
  attributes,
  onAttributesChange,
  disabled = false,
}: CategoryAttributeManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ICategoryAttribute>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
    placeholder: '',
    description: '',
  });

  const handleAddAttribute = () => {
    setEditingId(null);
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: '',
      description: '',
    });
    setShowForm(true);
  };

  const handleEditAttribute = (attribute: ICategoryAttribute) => {
    setEditingId(attribute._id?.toString() || null);
    setFormData(attribute);
    setShowForm(true);
  };

  const handleSaveAttribute = () => {
    if (!formData.name || !formData.label) {
      alert('Attribute name and label are required');
      return;
    }

    if ((formData.type === 'select' || formData.type === 'multiselect') && (!formData.options || formData.options.length === 0)) {
      alert('Select options require at least one option');
      return;
    }

    let updatedAttributes = [...attributes];

    if (editingId) {
      updatedAttributes = updatedAttributes.map((attr) =>
        attr._id?.toString() === editingId ? { ...formData, _id: attr._id } as ICategoryAttribute : attr
      );
    } else {
      updatedAttributes.push({
        ...formData,
        sort_order: attributes.length,
      } as ICategoryAttribute);
    }

    onAttributesChange(updatedAttributes);
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: '',
      description: '',
    });
  };

  const handleDeleteAttribute = (attributeId: string | undefined) => {
    if (!attributeId) return;
    if (!confirm('Are you sure you want to delete this attribute?')) return;

    const updatedAttributes = attributes
      .filter((attr) => attr._id?.toString() !== attributeId)
      .map((attr, index) => ({ ...attr, sort_order: index }));

    onAttributesChange(updatedAttributes);
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...(formData.options || []), { label: '', value: '' }],
    });
  };

  const handleOptionChange = (
    index: number,
    field: keyof IAttributeOption,
    value: string
  ) => {
    const updatedOptions = [...(formData.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = formData.options?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleMoveAttribute = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === attributes.length - 1) return;

    const updatedAttributes = [...attributes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedAttributes[index], updatedAttributes[newIndex]] = [updatedAttributes[newIndex], updatedAttributes[index]];

    updatedAttributes.forEach((attr, i) => (attr.sort_order = i));
    onAttributesChange(updatedAttributes);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h4 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Product Attributes
        </h4>
        <button
          type="button"
          onClick={handleAddAttribute}
          disabled={disabled || showForm}
          className="flex items-center justify-center sm:justify-start px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors relative after:absolute after:inset-[-4px] after:content-['']"
          aria-label="Add attribute"
        >
          <FaPlus className="mr-2 text-xs" />
          Add Attribute
        </button>
      </div>

      {showForm && (
        <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg p-3 sm:p-4 bg-theme-hover-bg-light dark:bg-theme-hover-bg-dark space-y-3 sm:space-y-4">
          <h5 className="font-medium text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {editingId ? 'Edit Attribute' : 'New Attribute'}
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                Attribute Name (system) *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., size, color, material"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
              />
              <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                Used for data storage (no spaces)
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                Display Label *
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Size, Color, Material"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                Field Type *
              </label>
              <select
                value={formData.type || 'text'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as ICategoryAttribute['type'],
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
              >
                {ATTRIBUTE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                Placeholder (optional)
              </label>
              <input
                type="text"
                value={formData.placeholder || ''}
                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                placeholder="e.g., Select a size"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Help text for admins"
              rows={2}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required || false}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="rounded"
            />
            <span className="ml-2 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Required for all products in this category
            </span>
          </label>

          {(formData.type === 'select' || formData.type === 'multiselect') && (
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <h6 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  Options
                </h6>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 w-full sm:w-auto relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Add option"
                >
                  <FaPlus className="inline mr-1" /> Add Option
                </button>
              </div>

              {formData.options?.map((option, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                    placeholder="Label (e.g., Small)"
                    className="flex-1 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    placeholder="Value (e.g., S)"
                    className="flex-1 px-2 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Remove option"
                    title="Remove option"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded text-xs sm:text-sm hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors relative after:absolute after:inset-[-4px] after:content-['']"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAttribute}
              className="px-3 py-1.5 bg-theme-primary text-white rounded text-xs sm:text-sm hover:bg-theme-primary-hover transition-colors relative after:absolute after:inset-[-4px] after:content-['']"
            >
              {editingId ? 'Update' : 'Add'} Attribute
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {attributes.map((attribute, index) => (
          <div
            key={attribute._id?.toString() || index}
            className="border border-theme-border-light dark:border-theme-border-dark rounded-lg p-2 sm:p-3 bg-theme-surface-light dark:bg-theme-surface-dark"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  setExpandedId(
                    expandedId === attribute._id?.toString() ? null : attribute._id?.toString() || null
                  )
                }
                className="flex items-center flex-1 text-left min-w-0 relative after:absolute after:inset-[-4px] after:content-['']"
                aria-label={`Toggle details for ${attribute.label}`}
              >
                {expandedId === attribute._id?.toString() ? (
                  <FaChevronUp className="text-theme-text-muted-light dark:text-theme-text-muted-dark mr-2 text-xs sm:text-sm flex-shrink-0" />
                ) : (
                  <FaChevronDown className="text-theme-text-muted-light dark:text-theme-text-muted-dark mr-2 text-xs sm:text-sm flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {attribute.label}
                  </p>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                    {attribute.type}
                    {attribute.required && ' • Required'}
                  </p>
                </div>
              </button>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="flex gap-0.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveAttribute(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded disabled:opacity-30 relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Move attribute up"
                    title="Move attribute up"
                  >
                    <FaChevronUp />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveAttribute(index, 'down')}
                    disabled={index === attributes.length - 1}
                    className="p-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded disabled:opacity-30 relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Move attribute down"
                    title="Move attribute down"
                  >
                    <FaChevronDown />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditAttribute(attribute)}
                  disabled={disabled || showForm}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Edit attribute"
                  title="Edit attribute"
                >
                  <FaEdit size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAttribute(attribute._id?.toString())}
                  disabled={disabled}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Delete attribute"
                  title="Delete attribute"
                >
                  <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>

            {expandedId === attribute._id?.toString() && (
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-theme-border-light dark:border-theme-border-dark space-y-2 text-xs sm:text-sm">
                <p className="break-words">
                  <span className="font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Name:
                  </span>{' '}
                  <code className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {attribute.name}
                  </code>
                </p>
                {attribute.description && (
                  <p className="break-words">
                    <span className="font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      Description:
                    </span>{' '}
                    {attribute.description}
                  </p>
                )}
                {attribute.options && attribute.options.length > 0 && (
                  <div>
                    <span className="font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      Options:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {attribute.options.map((opt, i) => (
                        <span
                          key={i}
                          className="px-1.5 sm:px-2 py-0.5 bg-theme-hover-bg-light dark:bg-theme-hover-bg-dark rounded text-xs"
                        >
                          {opt.label} ({opt.value})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {attributes.length === 0 && !showForm && (
          <p className="text-center py-3 sm:py-4 text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm">
            No attributes defined. Add one to get started.
          </p>
        )}
      </div>
    </div>
  );
}