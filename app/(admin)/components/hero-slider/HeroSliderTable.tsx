// components/hero-slider/HeroSliderTable.tsx
"use client";

import { FaEdit, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  button_text: string;
  button_url: string;
  image_url: string;
  background_gradient: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

interface HeroSliderTableProps {
  slides: HeroSlide[];
  onEditSlide: (slide: HeroSlide) => void;
  onDeleteSlide: (slideId: string) => void;
  onToggleActive: (slide: HeroSlide) => void;
  onMoveSlide: (slideId: string, direction: "up" | "down") => void;
}

export default function HeroSliderTable({
  slides,
  onEditSlide,
  onDeleteSlide,
  onToggleActive,
  onMoveSlide,
}: HeroSliderTableProps) {
  if (slides.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 lg:py-12 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark px-2 sm:px-4">
        No slides found. Click "Add Slide" to create your first hero slide.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Preview
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Title
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden md:table-cell">
                Button URL
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider hidden sm:table-cell">
                Order
              </th>
              <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {slides.map((slide, index) => (
              <tr
                key={slide._id}
                className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              >
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="h-12 w-16 sm:h-14 sm:w-20 lg:h-16 lg:w-24 object-cover rounded"
                  />
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                  <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[120px] sm:max-w-none">
                    {slide.title}
                  </div>
                  <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate max-w-[120px] sm:max-w-none">
                    {slide.subtitle}
                  </div>
                  <div className="md:hidden text-xs mt-1">
                    <a
                      href={slide.button_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate block"
                      aria-label={`View ${slide.button_url} (opens in new tab)`}
                    >
                      {slide.button_url.substring(0, 20)}...
                    </a>
                  </div>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 hidden md:table-cell">
                  <a
                    href={slide.button_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm truncate block max-w-[120px] lg:max-w-none"
                    aria-label={`View ${slide.button_url} (opens in new tab)`}
                  >
                    {slide.button_url.substring(0, 30)}...
                  </a>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                  <button
                    onClick={() => onToggleActive(slide)}
                    className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full relative after:absolute after:inset-[-4px] after:content-[''] ${
                      slide.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                    aria-label={`Toggle active status for ${slide.title}`}
                  >
                    <span className="hidden sm:inline">
                      {slide.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="sm:hidden">
                      {slide.is_active ? "✓" : "✗"}
                    </span>
                  </button>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 hidden sm:table-cell">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onMoveSlide(slide._id, "up")}
                      disabled={index === 0}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="Move Up"
                      aria-label="Move slide up"
                    >
                      <FaArrowUp size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <span className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark min-w-[20px] text-center">
                      {slide.sort_order}
                    </span>
                    <button
                      onClick={() => onMoveSlide(slide._id, "down")}
                      disabled={index === slides.length - 1}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="Move Down"
                      aria-label="Move slide down"
                    >
                      <FaArrowDown size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
                  <div className="flex gap-2 sm:gap-4 lg:gap-6">
                    <button
                      onClick={() => onEditSlide(slide)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="Edit Slide"
                      aria-label={`Edit slide: ${slide.title}`}
                    >
                      <FaEdit size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSlide(slide._id)}
                      className="text-theme-error hover:text-red-500 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="Delete Slide"
                      aria-label={`Delete slide: ${slide.title}`}
                    >
                      <FaTrash size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <div className="sm:hidden flex items-center gap-1">
                      <button
                        onClick={() => onMoveSlide(slide._id, "up")}
                        disabled={index === 0}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                        title="Move Up"
                        aria-label="Move slide up"
                      >
                        <FaArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => onMoveSlide(slide._id, "down")}
                        disabled={index === slides.length - 1}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                        title="Move Down"
                        aria-label="Move slide down"
                      >
                        <FaArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}