// // app/(admin)/components/site-settings/DynamicPagesSettings.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { siteSettingsApi } from "../../../../lib/api/siteSettings";
import dynamic from "next/dynamic";
import Loader from "../../../components/shared/Loader";

const LazyJoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const PAGE_TYPES = [
  { value: "terms", label: "Terms & Conditions" },
  { value: "privacy", label: "Privacy Policy" },
  { value: "refund", label: "Refund Policy" },
  { value: "shipping", label: "Shipping Policy" },
  { value: "about", label: "About Us" },
  { value: "licensing", label: "Licensing" },
  { value: "custom", label: "Custom Page" },
];

export default function DynamicPagesSettings() {
  const editor = useRef(null);
  const [pages, setPages] = useState<any[]>([]);
  const [filteredPages, setFilteredPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    page_type: "custom",
    content: "",
    meta_title: "",
    meta_description: "",
    is_active: true,
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pages, filterType, filterStatus]);

  useEffect(() => {
    if (selectedPage) {
      setFormData({
        title: selectedPage.title || "",
        slug: selectedPage.slug || "",
        page_type: selectedPage.page_type || "custom",
        content: selectedPage.content || "",
        meta_title: selectedPage.meta_title || "",
        meta_description: selectedPage.meta_description || "",
        is_active: selectedPage.is_active ?? true,
        sort_order: selectedPage.sort_order || 0,
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        page_type: "custom",
        content: "",
        meta_title: "",
        meta_description: "",
        is_active: true,
        sort_order: 0,
      });
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsApi.getAllPages(true);
      setPages(data.pages);
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pages];

    if (filterType !== "all") {
      filtered = filtered.filter((page) => page.page_type === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((page) => 
        filterStatus === "active" ? page.is_active : !page.is_active
      );
    }

    setFilteredPages(filtered);
  };

  const handleCreatePage = () => {
    setSelectedPage(null);
    setShowEditorModal(true);
  };

  const handleEditPage = (page: any) => {
    setSelectedPage(page);
    setShowEditorModal(true);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }

    try {
      await siteSettingsApi.deletePage(pageId);
      fetchPages();
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("Failed to delete page");
    }
  };

  const handleToggleStatus = async (page: any) => {
    try {
      await siteSettingsApi.updatePage(page._id, { is_active: !page.is_active });
      fetchPages();
    } catch (error) {
      console.error("Failed to update page status:", error);
      alert("Failed to update page status");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedPage) {
        await siteSettingsApi.updatePage(selectedPage._id, formData);
      } else {
        await siteSettingsApi.createPage(formData);
      }
      fetchPages();
      setShowEditorModal(false);
      setSelectedPage(null);
    } catch (error: any) {
      console.error("Failed to save page:", error);
      alert(error.error || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const getPageTypeLabel = (type: string) => {
    const pageType = PAGE_TYPES.find((pt) => pt.value === type);
    return pageType ? pageType.label : type;
  };

  const editorConfig = {
    readonly: false,
    height: 400,
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarButtonSize: "middle" as const,
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    buttons: [
      "source",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "outdent",
      "indent",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "image",
      "table",
      "link",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "copyformat",
      "|",
      "symbol",
      "fullsize",
      "print",
    ],
    uploader: {
      insertImageAsBase64URI: true,
    },
    removeButtons: ["brush", "file"],
    showPlaceholder: false,
    placeholder: "Start typing your content here...",
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Create and manage custom content pages (Terms, Privacy, etc.)
          </p>
        </div>
        <button
          onClick={handleCreatePage}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm w-full sm:w-auto"
        >
          <FaPlus size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Create Page</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="filter-type" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Filter by Type
            </label>
            <select
              id="filter-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            >
              <option value="all">All Types</option>
              {PAGE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-status" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Filter by Status
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
            <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
              <tr>
                <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Title
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Type
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
              {filteredPages.map((page) => (
                <tr
                  key={page._id}
                  className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                >
                  <td className="px-2 sm:px-4 lg:px-6 py-3 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[120px] sm:max-w-none">
                      {page.title}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-3 whitespace-nowrap">
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap">
                      {getPageTypeLabel(page.page_type)}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-3 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark font-mono truncate max-w-[100px] sm:max-w-none">
                      /{page.slug}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(page)}
                      aria-label={page.is_active ? "Deactivate page" : "Activate page"}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                        page.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {page.is_active ? <FaEye size={12} className="sm:w-3.5 sm:h-3.5" /> : <FaEyeSlash size={12} className="sm:w-3.5 sm:h-3.5" />}
                      <span className="hidden sm:inline">{page.is_active ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => handleEditPage(page)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                        aria-label={`Edit page: ${page.title}`}
                      >
                        <FaEdit size={16} className="sm:w-4.5 sm:h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                        aria-label={`Delete page: ${page.title}`}
                      >
                        <FaTrash size={16} className="sm:w-4.5 sm:h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
              No pages found. Create your first page to get started.
            </p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg w-full max-w-3xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-auto">
            <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
              <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {selectedPage ? "Edit Page" : "Create New Page"}
              </h3>
              <button
                onClick={() => {
                  setShowEditorModal(false);
                  setSelectedPage(null);
                }}
                aria-label="Close editor modal"
                className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="page-title" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Page Title *
                    </label>
                    <input
                      id="page-title"
                      type="text"
                      value={formData.title}
                      onChange={handleTitleChange}
                      required
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                      placeholder="Enter page title"
                    />
                  </div>

                  <div>
                    <label htmlFor="page-type" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Page Type *
                    </label>
                    <select
                      id="page-type"
                      value={formData.page_type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, page_type: e.target.value }))
                      }
                      required
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                    >
                      {PAGE_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="page-slug" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Slug *
                  </label>
                  <input
                    id="page-slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    required
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm font-mono"
                    placeholder="page-url-slug"
                  />
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                    URL: /{formData.slug}
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Page Content *
                  </label>
                  <div className="border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden">
                    <LazyJoditEditor
                      ref={editor}
                      value={formData.content}
                      config={editorConfig}
                      onBlur={(newContent) =>
                        setFormData((prev) => ({ ...prev, content: newContent }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="page-meta-title" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Meta Title
                    </label>
                    <input
                      id="page-meta-title"
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
                      }
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <label htmlFor="page-sort-order" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                      Sort Order
                    </label>
                    <input
                      id="page-sort-order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sort_order: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="page-meta-description" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                    Meta Description
                  </label>
                  <textarea
                    id="page-meta-description"
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        meta_description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                    placeholder="SEO description"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark"
                  >
                    Active (visible to users)
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-theme-border-light dark:border-theme-border-dark">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditorModal(false);
                    setSelectedPage(null);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark bg-theme-bg-light dark:bg-theme-bg-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {saving ? "Saving..." : selectedPage ? "Update Page" : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}