// app/(admin)/components/chatbot/ChatbotConfigPanel.tsx
"use client";

import { useState } from "react";
import {
  MdSupportAgent,
  MdShoppingBag,
  MdHelp,
  MdLightbulb,
  MdStar,
  MdPerson,
  MdSmartToy,
  MdChat,
} from "react-icons/md";
import { chatbotApi } from "../../../../lib/api/chatbot";
import type { IChatbotConfig } from "../../../../types/chatbot.types";

interface ChatbotConfigPanelProps {
  config: IChatbotConfig;
  onUpdate: (config: IChatbotConfig) => void;
}

// Each option: value stored in DB → React icon + label
const AVATAR_OPTIONS = [
  { value: "💬", icon: MdChat,          label: "Chat" },
  { value: "🤖", icon: MdSmartToy,      label: "Robot" },
  { value: "🛍️", icon: MdShoppingBag,  label: "Shop" },
  { value: "❓", icon: MdHelp,          label: "Help" },
  { value: "💡", icon: MdLightbulb,     label: "Tip" },
  { value: "🎯", icon: MdSupportAgent,  label: "Agent" },
  { value: "⭐", icon: MdStar,          label: "Star" },
  { value: "🙋", icon: MdPerson,        label: "Person" },
];

export default function ChatbotConfigPanel({ config, onUpdate }: ChatbotConfigPanelProps) {
  const [form, setForm] = useState({ ...config });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { config: updated } = await chatbotApi.updateConfig({
        is_enabled:      form.is_enabled,
        bot_name:        form.bot_name,
        welcome_message: form.welcome_message,
        fallback_message:form.fallback_message,
        primary_color:   form.primary_color,
        position:        form.position,
        avatar_icon:     form.avatar_icon,
        show_branding:   form.show_branding,
      });
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save config:", error);
      alert("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Master Toggle */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Chatbot Status
            </h3>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
              When disabled, the floating chatbot button will not appear on the website.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_enabled}
              onChange={e => setForm(p => ({ ...p, is_enabled: e.target.checked }))}
              className="sr-only peer"
              aria-label="Enable chatbot"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-theme-primary" />
          </label>
        </div>
      </div>

      {/* Bot Identity */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-5 space-y-4">
        <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Bot Identity
        </h3>

        {/* Bot Name */}
        <div>
          <label htmlFor="bot-name" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Bot Name
          </label>
          <input
            id="bot-name"
            type="text"
            value={form.bot_name}
            onChange={e => setForm(p => ({ ...p, bot_name: e.target.value }))}
            maxLength={40}
            placeholder="Support Bot"
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        {/* Avatar — React icons, NO emojis */}
        <div>
          <p className="text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Avatar Icon
          </p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map(({ value, icon: Icon, label }) => {
              const isSelected = form.avatar_icon === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, avatar_icon: value }))}
                  aria-label={`Select ${label} as avatar`}
                  aria-pressed={isSelected}
                  title={label}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? "ring-2 ring-theme-primary bg-theme-primary/10 scale-110"
                      : "bg-theme-bg-light dark:bg-theme-bg-dark border border-theme-border-light dark:border-theme-border-dark hover:scale-105"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isSelected
                      ? "text-theme-primary"
                      : "text-theme-text-muted-light dark:text-theme-text-muted-dark"
                    }
                  />
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1.5">
            Selected: <span className="font-medium">{AVATAR_OPTIONS.find(o => o.value === form.avatar_icon)?.label ?? "None"}</span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-5 space-y-4">
        <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Messages
        </h3>
        <div>
          <label htmlFor="welcome-msg" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Welcome Message
          </label>
          <textarea
            id="welcome-msg"
            rows={3}
            value={form.welcome_message}
            onChange={e => setForm(p => ({ ...p, welcome_message: e.target.value }))}
            placeholder="Hi there! How can I help you today?"
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary resize-none"
          />
        </div>
        <div>
          <label htmlFor="fallback-msg" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Fallback Message
            <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark font-normal ml-1">(shown when something goes wrong)</span>
          </label>
          <textarea
            id="fallback-msg"
            rows={2}
            value={form.fallback_message}
            onChange={e => setForm(p => ({ ...p, fallback_message: e.target.value }))}
            placeholder="Please contact our support team..."
            className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary resize-none"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-5 space-y-4">
        <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Appearance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primary-color" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="primary-color"
                type="color"
                value={form.primary_color}
                onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-theme-border-light dark:border-theme-border-dark cursor-pointer"
              />
              <span className="text-sm font-mono text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {form.primary_color}
              </span>
            </div>
          </div>
          <div>
            <label htmlFor="position" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Button Position
            </label>
            <select
              id="position"
              value={form.position}
              onChange={e => setForm(p => ({ ...p, position: e.target.value as "bottom-right" | "bottom-left" }))}
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="show-branding"
            checked={form.show_branding}
            onChange={e => setForm(p => ({ ...p, show_branding: e.target.checked }))}
            className="w-4 h-4 text-theme-primary border-gray-300 rounded focus:ring-theme-primary"
          />
          <label htmlFor="show-branding" className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark cursor-pointer select-none">
            Show "Powered by" branding in chatbot
          </label>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Configuration"}
        </button>
      </div>
    </form>
  );
}