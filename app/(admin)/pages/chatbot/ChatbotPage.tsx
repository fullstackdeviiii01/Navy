"use client";

import { useState, useEffect, useCallback } from "react";
import { FaPlus, FaRobot, FaList, FaCog, FaChartBar, FaSearch } from "react-icons/fa";
import Loader from "../../../components/shared/Loader";
import { chatbotApi } from "../../../../lib/api/chatbot";
import ChatbotQATable from "../../components/chatbot/ChatbotQATable";
import ChatbotQAModal from "../../components/chatbot/ChatbotQAModal";
import ChatbotConfigPanel from "../../components/chatbot/ChatbotConfigPanel";
import ChatbotStatsCards from "../../components/chatbot/ChatbotStatsCards";
import type { IChatbotQA, IChatbotConfig, IChatbotStats } from "../../../../types/chatbot.types";

type TabType = "questions" | "config" | "stats";

export default function ChatbotAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("questions");
  const [qas, setQAs] = useState<IChatbotQA[]>([]);
  const [config, setConfig] = useState<IChatbotConfig | null>(null);
  const [stats, setStats] = useState<IChatbotStats | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // only for first load
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQA, setSelectedQA] = useState<IChatbotQA | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");

  // `silent` = background refresh after modal save — does NOT trigger full-page loader
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setInitialLoading(true);
    try {
      const [qaRes, configRes, statsRes] = await Promise.all([
        chatbotApi.adminGetAllQAs(),
        chatbotApi.getConfig(),
        chatbotApi.getStats(),
      ]);
      setQAs(qaRes.qas || []);
      setConfig(configRes.config);
      setStats(statsRes.stats);
    } catch (error) {
      console.error("Failed to load chatbot data:", error);
    } finally {
      if (!silent) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  const handleEdit = (qa: IChatbotQA) => {
    setSelectedQA(qa);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Q&A? This action cannot be undone.")) return;
    try {
      await chatbotApi.deleteQA(id);
      setQAs((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete Q&A.");
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await chatbotApi.toggleVisibility(id, !current);
      setQAs((prev) =>
        prev.map((q) => (q._id === id ? { ...q, is_visible: !current } : q))
      );
    } catch (error) {
      console.error("Visibility toggle failed:", error);
      alert("Failed to update visibility.");
    }
  };

  const handleModalSave = () => {
    setModalOpen(false);
    setSelectedQA(null);
    fetchAll(true); // silent refresh — no loader, no layout shift
  };

  // Derived: unique categories
  const categories = ["all", ...Array.from(new Set(qas.map((q) => q.category)))];

  // Filtered QAs
  const filteredQAs = qas.filter((qa) => {
    const matchSearch =
      !searchTerm ||
      qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qa.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "all" || qa.category === filterCategory;
    const matchVisibility =
      filterVisibility === "all" ||
      (filterVisibility === "visible" && qa.is_visible) ||
      (filterVisibility === "hidden" && !qa.is_visible);
    return matchSearch && matchCategory && matchVisibility;
  });

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "questions", label: "Questions & Answers", icon: <FaList size={14} /> },
    { id: "config", label: "Configuration", icon: <FaCog size={14} /> },
    { id: "stats", label: "Analytics", icon: <FaChartBar size={14} /> },
  ];

  if (initialLoading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
            <FaRobot className="text-indigo-600 dark:text-indigo-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Chatbot Management
            </h1>
            <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
              Configure your website chatbot, manage Q&As and track analytics
            </p>
          </div>
        </div>

        {/* Status badge + Add button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {config && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                config.is_enabled
                  ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  config.is_enabled ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {config.is_enabled ? "Chatbot Active" : "Chatbot Disabled"}
            </span>
          )}
          {activeTab === "questions" && (
            <button
              onClick={() => {
                setSelectedQA(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-theme-primary text-white text-sm font-semibold rounded-lg hover:bg-theme-primary-hover transition-colors shadow-sm"
            >
              <FaPlus size={12} />
              Add Question
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-theme-bg-light dark:bg-theme-bg-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark shadow-sm"
                : "text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Questions Tab */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark"
                  size={13}
                />
                <input
                  type="text"
                  placeholder="Search questions or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              {/* Category filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                aria-label="Filter by category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>

              {/* Visibility filter */}
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                aria-label="Filter by visibility"
              >
                <option value="all">All Visibility</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>
          </div>

          {/* Result summary */}
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark px-1">
            Showing{" "}
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {filteredQAs.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {qas.length}
            </span>{" "}
            questions
          </p>

          <ChatbotQATable
            qas={filteredQAs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      )}

      {/* Config Tab */}
      {activeTab === "config" && config && (
        <ChatbotConfigPanel config={config} onUpdate={setConfig} />
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="space-y-4">
          <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Chatbot usage analytics based on user interactions.
          </p>
          <ChatbotStatsCards stats={stats} />
        </div>
      )}

      {/* QA Modal */}
      {modalOpen && (
        <ChatbotQAModal
          qa={selectedQA}
          onClose={() => {
            setModalOpen(false);
            setSelectedQA(null);
          }}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}