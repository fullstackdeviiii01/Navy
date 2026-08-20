// app/(admin)/components/promotional-banners/BannerTable.tsx
"use client";

import { FaEdit, FaTrash } from "react-icons/fa";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  background_color: string;
  background_gradient?: string;
  text_color: string;
  images: any[];
  buttons: any[];
  target_page: string;
  position?: string;
  is_active: boolean;
  sort_order: number;
  display_from?: Date;
  display_until?: Date;
  created_at: string;
}

interface BannerTableProps {
  banners: Banner[];
  onEditBanner: (banner: Banner) => void;
  onDeleteBanner: (bannerId: string) => void;
}

export default function BannerTable({
  banners,
  onEditBanner,
  onDeleteBanner,
}: BannerTableProps) {
  if (banners.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
        <div className="text-center py-6 sm:py-8 lg:py-12 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark px-4">
          No banners found. Click "Add Banner" to create your first promotional banner.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <caption className="sr-only">
            List of promotional banners with preview, title, target page, position, scheduling, and actions
          </caption>
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Preview
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Title
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Target Page
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Position
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Scheduling
              </th>
              <th className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {banners.map((banner) => (
              <tr
                key={banner._id}
                className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              >
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  {banner.images && banner.images.length > 0 ? (
                    <img
                      src={banner.images[0].url}
                      alt=""
                      className="h-12 w-16 sm:h-14 sm:w-20 lg:h-16 lg:w-24 object-cover rounded"
                    />
                  ) : (
                    <div
                      className="h-12 w-16 sm:h-14 sm:w-20 lg:h-16 lg:w-24 rounded flex items-center justify-center text-white text-[10px] sm:text-xs"
                      style={{
                        background: banner.background_gradient || banner.background_color,
                      }}
                      role="img"
                      aria-label={`No image available for banner: ${banner.title}`}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4">
                  <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[120px] sm:max-w-none">
                    {banner.title}
                  </div>
                  {banner.subtitle && (
                    <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate max-w-[120px] sm:max-w-none">
                      {banner.subtitle}
                    </div>
                  )}
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 truncate">
                    {banner.target_page.charAt(0).toUpperCase() + banner.target_page.slice(1)}
                  </span>
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  {banner.target_page === 'home' ? (
                    <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                      Site Settings
                    </span>
                  ) : (
                    <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {banner.position ? banner.position.charAt(0).toUpperCase() + banner.position.slice(1) : 'N/A'}
                    </span>
                  )}
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 text-[10px] sm:text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  {banner.display_from || banner.display_until ? (
                    <div className="space-y-0.5">
                      {banner.display_from && (
                        <div className="truncate">From: {new Date(banner.display_from).toLocaleDateString()}</div>
                      )}
                      {banner.display_until && (
                        <div className="truncate">Until: {new Date(banner.display_until).toLocaleDateString()}</div>
                      )}
                    </div>
                  ) : (
                    "Always On"
                  )}
                </td>
                <td className="px-2 sm:px-3 lg:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <div className="flex space-x-2 sm:space-x-3 lg:space-x-6">
                    <button
                      onClick={() => onEditBanner(banner)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm sm:text-base"
                      title="Edit Banner"
                      aria-label={`Edit banner: ${banner.title}`}
                    >
                      <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBanner(banner._id)}
                      className="text-theme-error hover:text-red-500 text-sm sm:text-base"
                      title="Delete Banner"
                      aria-label={`Delete banner: ${banner.title}`}
                    >
                      <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
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