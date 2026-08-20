"use client";

/**
 * app/(admin)/dropshipping/cj/components/CJCredentialsPanel.tsx
 *
 * Admin panel to view, save, and remove CJ Dropshipping credentials.
 * Mirrors the AliExpress credentials panel exactly.
 */

import { useState, useEffect } from "react";
import {
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { cjApi } from "../../../../../lib/api/cj";

interface CredentialStatus {
  _id: string;
  api_key_masked: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CJCredentialsPanel() {
  const [status, setStatus] = useState<CredentialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await cjApi.getCredentials();
      setStatus(data.credentials);
      setShowForm(!data.credentials); // auto-open form if no creds
    } catch (err: any) {
      setError(err.message || "Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      await cjApi.saveCredentials({ api_key: apiKey });
      setSuccess("Credentials saved successfully.");
      setApiKey("");
      setShowForm(false);
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || "Failed to save credentials.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deactivate CJ credentials? API calls will fail until new credentials are added.")) return;

    setError(null);
    setSuccess(null);
    setDeleting(true);

    try {
      await cjApi.deleteCredentials();
      setSuccess("Credentials deactivated.");
      setStatus(null);
      setShowForm(true);
    } catch (err: any) {
      setError(err.message || "Failed to deactivate credentials.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaKey className="text-theme-primary" />
          <h3 className="text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark uppercase tracking-wide">
            CJ Dropshipping Credentials
          </h3>
        </div>

        {status && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-colors"
          >
            Update Credentials
          </button>
        )}
      </div>

      {/* Current status */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          <FaSpinner className="animate-spin" /> Loading...
        </div>
      ) : status ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <FaCheckCircle />
              <span className="text-sm font-medium">Credentials Active</span>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
            >
              {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
              Deactivate
            </button>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 space-y-0.5">
            <p>API Key: <span className="font-mono">{status.api_key_masked}</span></p>
            <p>Last updated: {new Date(status.updated_at).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
          <FaTimesCircle className="flex-shrink-0" />
          No active credentials. Add your CJ API credentials below.
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <FaTimesCircle className="flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
          <FaCheckCircle className="flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Credential form */}
      {showForm && (
        <div className="space-y-4 pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Find your API key in the{" "}
            <a
              href="https://developers.cjdropshipping.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-primary underline"
            >
              CJ Developer Portal
            </a>.
          </p>

          <div>
            <label className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your CJ API key"
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaKey />}
              {saving ? "Saving..." : "Save Credentials"}
            </button>

            {status && (
              <button
                onClick={() => { setShowForm(false); setError(null); }}
                className="text-sm px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-bg-light dark:hover:bg-theme-bg-dark transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}