// ============================================
// 2. app/(admin)/components/products/form/ProductFormImages.tsx
// ============================================
"use client";

import { FaUpload, FaTrash } from "react-icons/fa";

interface ProductFormImagesProps {
  images: any[];
  newImages: File[];
  onImageSelect: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
}

export default function ProductFormImages({
  images,
  newImages,
  onImageSelect,
  onRemoveExisting,
  onRemoveNew,
}: ProductFormImagesProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      onImageSelect(filesArray);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
        Product Images
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div key={`existing-${index}`} className="relative group">
            <img
              src={img.url}
              alt={img.alt_text || "Product"}
              className="w-full h-32 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
            />
            <button
              type="button"
              onClick={() => onRemoveExisting(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash size={12} />
            </button>
            {img.is_primary && (
              <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Primary
              </span>
            )}
          </div>
        ))}

        {newImages.map((file, index) => (
          <div key={`new-${index}`} className="relative group">
            <img
              src={URL.createObjectURL(file)}
              alt="New upload"
              className="w-full h-32 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
            />
            <button
              type="button"
              onClick={() => onRemoveNew(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash size={12} />
            </button>
            <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              New
            </span>
          </div>
        ))}

        <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer hover:border-theme-primary transition-colors">
          <FaUpload className="text-3xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2" />
          <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Upload Images
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
