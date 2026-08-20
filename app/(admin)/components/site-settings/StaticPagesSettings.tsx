// app/(admin)/components/site-settings/StaticPagesSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSave, FaEye, FaEyeSlash, FaEdit } from "react-icons/fa";
import { siteSettingsApi } from "../../../../lib/api/siteSettings";
import Loader from "../../../components/shared/Loader";

interface StaticPageConfig {
  page_key: string;
  page_name: string;
  page_path: string;
  is_visible: boolean;
  meta_title?: string;
  meta_description?: string;
}

export default function StaticPagesSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState<StaticPageConfig[]>([]);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsApi.getStaticPagesConfig();
      setPages(data.static_pages || []);
    } catch (error) {
      console.error("Failed to fetch static pages config:", error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await siteSettingsApi.updateStaticPagesConfig(pages);
      
      showMessage('success', 'Static pages settings saved successfully');
      setEditingPage(null);
    } catch (error) {
      console.error("Failed to save settings:", error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (pageKey: string) => {
    setPages(prev =>
      prev.map(page =>
        page.page_key === pageKey
          ? { ...page, is_visible: !page.is_visible }
          : page
      )
    );
  };

  const updatePageMeta = (pageKey: string, field: 'meta_title' | 'meta_description', value: string) => {
    setPages(prev =>
      prev.map(page =>
        page.page_key === pageKey
          ? { ...page, [field]: value }
          : page
      )
    );
  };

  if (loading) {
    return (
      <div className="relative h-48 sm:h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Message Banner */}
      {message && (
        <div 
          role="alert"
          aria-live="polite"
          className={`p-3 sm:p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
          Configure visibility and SEO metadata for static pages. Hidden pages will return 404 errors.
        </p>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="p-6 sm:p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No static pages found. Click Save to initialize default pages.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pages.map((page) => (
            <div
              key={page.page_key}
              className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden"
            >
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {page.page_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono truncate">
                    {page.page_path}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setEditingPage(editingPage === page.page_key ? null : page.page_key)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label={editingPage === page.page_key 
                      ? `Close meta editor for ${page.page_name}` 
                      : `Edit meta tags for ${page.page_name}`}
                  >
                    <FaEdit size={12} className="sm:w-3.5 sm:h-3.5"/>
                    {editingPage === page.page_key ? 'Close' : 'Edit Meta'}
                  </button>

                  <button
                    onClick={() => toggleVisibility(page.page_key)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-[''] ${
                      page.is_visible
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                    aria-label={page.is_visible 
                      ? `Hide ${page.page_name} page` 
                      : `Show ${page.page_name} page`}
                  >
                    {page.is_visible ? <FaEye size={12} className="sm:w-3.5 sm:h-3.5"/> : <FaEyeSlash size={12} className="sm:w-3.5 sm:h-3.5"/>}
                    <span className="hidden sm:inline">{page.is_visible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>

              {/* Meta Fields (Expandable) */}
              {editingPage === page.page_key && (
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 border-t border-theme-border-light dark:border-theme-border-dark">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={page.meta_title || ""}
                      onChange={(e) => updatePageMeta(page.page_key, 'meta_title', e.target.value)}
                      placeholder={`${page.page_name} - Your Store Name`}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                    />
                    <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                      {(page.meta_title || "").length}/80 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={page.meta_description || ""}
                      onChange={(e) => updatePageMeta(page.page_key, 'meta_description', e.target.value)}
                      placeholder={`Learn more about ${page.page_name.toLowerCase()}...`}
                      rows={4}
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                    />
                    <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                      {(page.meta_description || "").length}/200 characters
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm w-full sm:w-auto relative after:absolute after:inset-[-4px] after:content-['']"
          aria-label="Save static pages settings"
        >
          <FaSave size={14} className="sm:w-4 sm:h-4"/>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}