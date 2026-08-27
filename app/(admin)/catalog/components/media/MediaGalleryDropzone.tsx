// app/(admin)/catalog/components/media/MediaGalleryDropzone.tsx
"use client";

import { useState, useEffect } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";

interface MediaGalleryDropzoneProps {
  images: any[];
  newImages: File[];
  onImageSelect: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
  colorItems?: any[];
}

function NewImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return null;

  return (
    <div className="relative group rounded-xl overflow-hidden border border-theme-hover-light bg-black/5 aspect-square">
      <img
        src={url}
        alt={file.name || "New upload"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onClick={onRemove}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow"
          title="Remove image"
        >
          <FaTrash size={12} />
        </button>
      </div>
      <span className="absolute bottom-2 left-2 bg-theme-hover-light text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-xs">
        New
      </span>
    </div>
  );
}

export default function MediaGalleryDropzone({
  images,
  newImages,
  onImageSelect,
  onRemoveExisting,
  onRemoveNew,
  colorItems = [],
}: MediaGalleryDropzoneProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      onImageSelect(filesArray);
      e.target.value = "";
    }
  };

  const colorImagesCount = colorItems.reduce((acc, c) => {
    const existing = c.existingImages?.length || 0;
    const pending = c.newFiles?.length || 0;
    return acc + existing + pending;
  }, 0);

  const totalAllPhotos = images.length + newImages.length + colorImagesCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            General Product Photography
          </h4>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            General high-res showcase photos. (Color-specific finishes can also be uploaded in the Color section below).
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-theme-text-muted-light bg-theme-bg-light dark:bg-theme-bg-dark px-2.5 py-1 rounded border border-theme-border-light dark:border-theme-border-dark">
            {images.length + newImages.length} General {colorImagesCount > 0 ? `+ ${colorImagesCount} Color (${totalAllPhotos} Total)` : "Photos"}
          </span>
        </div>
      </div>

      {/* Color Section Images Notice Banner if color photos exist */}
      {colorImagesCount > 0 && (
        <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <div>
              <p className="text-xs font-semibold text-purple-950 dark:text-purple-200">
                {colorImagesCount} Color Finish photo{colorImagesCount === 1 ? "" : "s"} attached below
              </p>
              <p className="text-[11px] text-purple-800/80 dark:text-purple-300/70">
                These will be displayed across customer storefront, product carousels, and catalog listings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {colorItems
              .filter((c) => (c.existingImages?.length || 0) + (c.newFiles?.length || 0) > 0)
              .map((c, i) => {
                const count = (c.existingImages?.length || 0) + (c.newFiles?.length || 0);
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-black/40 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-2xs"
                  >
                    <span>{c.name}: {count} photo{count === 1 ? "" : "s"}</span>
                  </span>
                );
              })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Existing Images */}
        {images.map((img, index) => (
          <div
            key={`existing-${index}`}
            className="relative group rounded-xl overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 aspect-square"
          >
            <img
              src={img.url}
              alt={img.alt_text || "Product"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => onRemoveExisting(index)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow"
                title="Delete Photo"
              >
                <FaTrash size={12} />
              </button>
            </div>
            {img.is_primary && (
              <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-xs">
                Primary
              </span>
            )}
          </div>
        ))}

        {/* New Upload Previews */}
        {newImages.map((file, index) => (
          <NewImagePreview
            key={`new-${index}-${file.name}-${file.lastModified}`}
            file={file}
            onRemove={() => onRemoveNew(index)}
          />
        ))}

        {/* Upload Button */}
        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl cursor-pointer hover:border-theme-hover-light dark:hover:border-theme-hover-dark hover:bg-theme-hover-light/5 transition-all text-theme-text-muted-light hover:text-theme-hover-light group">
          <FaUpload className="text-xl mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Add Photos
          </span>
          <span className="text-[9px] text-theme-text-muted-light mt-0.5">
            JPG, PNG, WebP
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
