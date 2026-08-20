// app/(admin)/components/site-settings/HomePageSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSave, FaEye, FaEyeSlash, FaGripVertical, FaCalendar } from "react-icons/fa";
import { siteSettingsApi } from "../../../../lib/api/siteSettings";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Loader from "../../../components/shared/Loader";

interface HomeComponent {
  component_key: string;
  component_type: 'static' | 'banner';
  banner_id?: string;
  display_name: string;
  is_visible: boolean;
  sort_order: number;
  banner_details?: {
    title: string;
    is_active: boolean;
    display_from?: string;
    display_until?: string;
  };
}

export default function HomePageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [components, setComponents] = useState<HomeComponent[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsApi.getHomeSettings();
      
      setMetaTitle(data.home_meta_title || "");
      setMetaDescription(data.home_meta_description || "");
      setComponents(data.home_components || []);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await siteSettingsApi.updateHomeSettings({
        home_meta_title: metaTitle,
        home_meta_description: metaDescription,
        home_components: components.map((comp, index) => ({
          ...comp,
          sort_order: index
        }))
      });
      
      showMessage('success', 'Home page settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error("Failed to save:", error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (componentKey: string) => {
    const updatedComponents = components.map(comp =>
      comp.component_key === componentKey
        ? { ...comp, is_visible: !comp.is_visible }
        : comp
    );
    setComponents(updatedComponents);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    
    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    setComponents(updatedItems);
  };

  const isDateVisible = (displayFrom?: string, displayUntil?: string) => {
    if (!displayFrom && !displayUntil) return true;
    
    const now = new Date();
    const from = displayFrom ? new Date(displayFrom) : null;
    const until = displayUntil ? new Date(displayUntil) : null;

    if (from && now < from) return false;
    if (until && now > until) return false;
    return true;
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
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`p-3 sm:p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Meta Data Section */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Home Page Meta Data
        </h3>

        <div>
          <label htmlFor="home-meta-title" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Meta Title
          </label>
          <input
            id="home-meta-title"
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Home - Your Store Name"
            aria-describedby="meta-title-count"
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
          />
          <p id="meta-title-count" className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            {metaTitle.length}/80 characters
          </p>
        </div>

        <div>
          <label htmlFor="home-meta-description" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Meta Description
          </label>
          <textarea
            id="home-meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Shop our amazing collection of products..."
            rows={4}
            aria-describedby="meta-description-count"
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
          />
          <p id="meta-description-count" className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            {metaDescription.length}/200 characters
          </p>
        </div>
      </div>

      {/* Components Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Page Components & Banners
          </h3>
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Drag to reorder • Toggle visibility
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Banners are created in Banner Management. Here you can control their order and visibility. 
            Date-based visibility (display from/until) is managed in Banner Management.
          </p>
        </div>

        {components.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No components found. Click Save to initialize default components.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="components">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {components.map((component, index) => {
                    const dateVisible = component.component_type === 'banner' && component.banner_details
                      ? isDateVisible(component.banner_details.display_from, component.banner_details.display_until)
                      : true;

                    return (
                      <Draggable
                        key={component.component_key}
                        draggableId={component.component_key}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 bg-theme-surface-light dark:bg-theme-surface-dark border rounded-lg ${
                              snapshot.isDragging
                                ? 'border-blue-500 shadow-lg'
                                : 'border-theme-border-light dark:border-theme-border-dark'
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing flex-shrink-0"
                              role="button"
                              aria-label={`Drag to reorder ${component.display_name}. Current position ${index + 1}`}
                              tabIndex={0}
                            >
                              <FaGripVertical className="text-theme-text-muted-light dark:text-theme-text-muted-dark sm:w-4 sm:h-4" size={14} aria-hidden="true" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm sm:text-base font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                                    {component.display_name}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                                    <span>Order: {index + 1}</span>
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded ${
                                      component.component_type === 'banner'
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {component.component_type === 'banner' ? 'Banner' : 'Static Component'}
                                    </span>
                                    {component.component_type === 'banner' && (
                                      <span className="text-xs truncate">
                                        ID: {component.banner_id}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Banner Date Info */}
                              {component.component_type === 'banner' && component.banner_details && 
                               (component.banner_details.display_from || component.banner_details.display_until) && (
                                <div className={`mt-1 sm:mt-2 flex items-center gap-1 text-xs ${
                                  dateVisible 
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-orange-600 dark:text-orange-400'
                                }`}>
                                  <FaCalendar className="text-xs sm:w-3.5 sm:h-3.5" size={12} aria-hidden="true" />
                                  <span className="truncate">
                                    {component.banner_details.display_from && 
                                      `From: ${new Date(component.banner_details.display_from).toLocaleDateString()}`}
                                    {component.banner_details.display_from && component.banner_details.display_until && ' • '}
                                    {component.banner_details.display_until && 
                                      `Until: ${new Date(component.banner_details.display_until).toLocaleDateString()}`}
                                    {!dateVisible && ' (Not currently visible)'}
                                  </span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => toggleVisibility(component.component_key)}
                              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm whitespace-nowrap ${
                                component.is_visible
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                              }`}
                              aria-label={`${component.is_visible ? 'Hide' : 'Show'} ${component.display_name}`}
                              aria-pressed={component.is_visible}
                            >
                              {component.is_visible ? (
                                <FaEye size={12} className="sm:w-3.5 sm:h-3.5"/>
                              ) : (
                                <FaEyeSlash size={12} className="sm:w-3.5 sm:h-3.5"/>
                              )}
                              <span className="hidden sm:inline">{component.is_visible ? 'Visible' : 'Hidden'}</span>
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm w-full sm:w-auto"
        >
          <FaSave size={14} className="sm:w-4 sm:h-4"/>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}