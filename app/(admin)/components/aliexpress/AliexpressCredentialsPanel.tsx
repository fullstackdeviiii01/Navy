// app/(admin)/components/aliexpress/AliexpressCredentialsPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { FaKey, FaSave, FaTrash, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { aliexpressCredentialsApi } from "../../../../lib/api/aliexpress-credentials";

interface CredentialStatus {
  configured: boolean;
  credentials: {
    _id: string; app_key: string; app_secret: string;
    access_token: string; refresh_token: string;
    token_expiry?: string; is_active: boolean; updated_at: string;
  } | null;
}

export default function AliexpressCredentialsPanel() {
  const [status, setStatus] = useState<CredentialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [showSecrets, setShowSecrets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    app_key: "", app_secret: "", access_token: "", refresh_token: "", token_expiry: "",
  });

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await aliexpressCredentialsApi.get();
      setStatus(data);
      if (data.configured) setShowForm(false);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setSaving(true);
    try {
      await aliexpressCredentialsApi.save(form);
      setSuccess("Credentials saved and encrypted successfully.");
      setShowForm(false);
      setForm({ app_key: "", app_secret: "", access_token: "", refresh_token: "", token_expiry: "" });
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || "Failed to save credentials");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Deactivate AliExpress credentials? API calls will fail until new credentials are added.")) return;
    setError(null);
    try {
      await aliexpressCredentialsApi.deactivate();
      setSuccess("Credentials deactivated.");
      setShowForm(true);
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || "Failed to deactivate credentials");
    }
  };

  const isConfigured = status?.configured && status.credentials;

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <FaKey className="text-theme-primary text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              AliExpress API Credentials
            </h3>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
              Stored encrypted in database — never exposed in plaintext
            </p>
          </div>
        </div>
        {!loading && (
          <span className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
            isConfigured
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          }`}>
            {isConfigured ? <FaCheckCircle className="w-3 h-3" /> : <FaTimesCircle className="w-3 h-3" />}
            <span className="hidden xs:inline">{isConfigured ? "Active" : "Not configured"}</span>
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {loading && (
          <div className="flex items-center gap-3 text-theme-text-muted-light dark:text-theme-text-muted-dark">
            <FaSpinner className="animate-spin w-4 h-4 flex-shrink-0" />
            <span className="text-sm">Checking credential status…</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            <FaTimesCircle className="flex-shrink-0 w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
            <FaCheckCircle className="flex-shrink-0 w-4 h-4 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Configured summary */}
        {!loading && isConfigured && !showForm && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "App Key", value: status!.credentials!.app_key, mono: true },
                { label: "App Secret", value: status!.credentials!.app_secret, mono: true },
                { label: "Access Token", value: status!.credentials!.access_token, mono: true },
                { label: "Last Updated", value: new Date(status!.credentials!.updated_at).toLocaleDateString(), mono: false },
              ].map(({ label, value, mono }) => (
                <div key={label} className="p-3 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark min-w-0">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1">{label}</p>
                  <p className={`text-sm truncate ${mono ? "font-mono" : ""} text-theme-text-primary-light dark:text-theme-text-primary-dark`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col xs:flex-row gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover text-sm font-medium transition-colors w-full xs:w-auto text-center"
              >
                Update Credentials
              </button>
              <button
                onClick={handleDeactivate}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors w-full xs:w-auto"
              >
                <FaTrash className="w-3 h-3" />
                Deactivate
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!loading && (!isConfigured || showForm) && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong>Security:</strong> All secret values are encrypted with AES-256-GCM before
                storage. Enter your AliExpress Open Platform <strong>App Key</strong>,{" "}
                <strong>App Secret</strong>, <strong>Access Token</strong>, and{" "}
                <strong>Refresh Token</strong>.
              </p>
            </div>

            {/* Show/hide secrets toggle */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-1.5 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
              >
                {showSecrets ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                {showSecrets ? "Hide secrets" : "Show secrets"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* App Key */}
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  App Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.app_key}
                  onChange={(e) => setForm({ ...form, app_key: e.target.value })}
                  required
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              {/* App Secret */}
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  App Secret <span className="text-red-500">*</span>
                </label>
                <input
                  type={showSecrets ? "text" : "password"}
                  value={form.app_secret}
                  onChange={(e) => setForm({ ...form, app_secret: e.target.value })}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              {/* Access Token */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  Access Token <span className="text-red-500">*</span>
                </label>
                <input
                  type={showSecrets ? "text" : "password"}
                  value={form.access_token}
                  onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              {/* Refresh Token */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  Refresh Token <span className="text-red-500">*</span>
                </label>
                <input
                  type={showSecrets ? "text" : "password"}
                  value={form.refresh_token}
                  onChange={(e) => setForm({ ...form, refresh_token: e.target.value })}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              {/* Token Expiry */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  Token Expiry{" "}
                  <span className="text-xs font-normal text-theme-text-muted-light dark:text-theme-text-muted-dark">(optional)</span>
                </label>
                <input
                  type="date"
                  value={form.token_expiry}
                  onChange={(e) => setForm({ ...form, token_expiry: e.target.value })}
                  className="w-full px-3 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>
            </div>

            <div className="flex flex-col xs:flex-row gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 text-sm font-medium transition-colors w-full xs:w-auto"
              >
                {saving ? <FaSpinner className="animate-spin w-3.5 h-3.5" /> : <FaSave className="w-3.5 h-3.5" />}
                {saving ? "Saving…" : "Save Credentials"}
              </button>
              {isConfigured && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark text-sm font-medium transition-colors w-full xs:w-auto text-center"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}