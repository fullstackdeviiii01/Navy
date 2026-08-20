// // AISettingsPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { Settings, Sparkles, Save, Eye, EyeOff } from "lucide-react";

interface AISettingsPanelProps {
  onSettingsSaved?: () => void;
}

export default function AISettingsPanel({ onSettingsSaved }: AISettingsPanelProps) {
  const [settings, setSettings] = useState({
    openrouter_api_key: "",
    selected_model: "google/gemma-3-27b-it:free",
    max_tokens: 500,
    temperature: 0.7,
    is_active: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableModels = [
    { value: "google/gemma-3-27b-it:free", label: "Gemma 3 27B (Free)" },
    { value: "google/gemma-3-12b-it:free", label: "Gemma 3 12B (Free)" },
    { value: "google/gemma-3-4b-it:free", label: "Gemma 3 4B (Free)" },
    { value: "qwen/qwen-3-next-80b-a3b-instruct:free", label: "Qwen3 Next 80B (Free)" },
    { value: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B (Free)" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch("/api/reviews/ai-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          ...data.settings,
          openrouter_api_key: "", // Always clear — user must re-enter to change
        });
        setIsConfigured(data.isConfigured);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setError("");
    setSuccess("");

    // If already configured and key is empty, that's fine — key won't be overwritten
    // If not configured yet, key is required
    if (!isConfigured && !settings.openrouter_api_key.trim()) {
      setError("API key is required");
      return;
    }

    setSaving(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch("/api/reviews/ai-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess("AI settings saved successfully!");
        setIsConfigured(true);
        // Clear the key field again after saving
        setSettings((prev) => ({ ...prev, openrouter_api_key: "" }));
        if (onSettingsSaved) {
          onSettingsSaved();
        }
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save settings");
      }
    } catch (error) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!isConfigured) {
      setError("Please configure and save AI settings first");
      return;
    }

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("__session="))
        ?.split("=")[1];

      const response = await fetch("/api/reviews/ai-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !settings.is_active }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings((prev) => ({ ...prev, is_active: data.is_active }));
        setSuccess(`AI feature ${data.is_active ? "activated" : "deactivated"} successfully!`);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to toggle AI feature");
      }
    } catch (error) {
      setError("Failed to toggle AI feature");
    }
  };

  if (loading) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-theme-border-light dark:border-theme-border-dark bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                AI Review Summary Settings
              </h3>
              <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Configure OpenRouter API for automated review summaries
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              {settings.is_active ? "Active" : "Inactive"}
            </span>
            <button
              onClick={handleToggleActive}
              disabled={!isConfigured}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.is_active
                  ? "bg-green-600"
                  : "bg-gray-300 dark:bg-gray-600"
              } ${!isConfigured ? "opacity-50 cursor-not-allowed" : ""}`}
              role="switch"
              aria-checked={settings.is_active}
              aria-label="Toggle AI feature"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.is_active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Notifications */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg" role="alert">
            <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            OpenRouter API Key {isConfigured ? "(leave blank to keep existing)" : "*"}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={settings.openrouter_api_key}
              onChange={(e) =>
                setSettings({ ...settings, openrouter_api_key: e.target.value })
              }
              placeholder={isConfigured ? "Enter new key to update, or leave blank" : "sk-or-v1-..."}
              className="w-full px-4 py-2 pr-10 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {isConfigured && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              ✓ API key is configured. Leave blank to keep the existing key.
            </p>
          )}
          <p className="mt-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Get your API key from{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              OpenRouter
            </a>
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            AI Model *
          </label>
          <select
            value={settings.selected_model}
            onChange={(e) =>
              setSettings({ ...settings, selected_model: e.target.value })
            }
            className="w-full px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {availableModels.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Recommended: Gemma 3 27B for best quality summaries
          </p>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              min="100"
              max="2000"
              value={settings.max_tokens}
              onChange={(e) =>
                setSettings({ ...settings, max_tokens: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              Temperature
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}