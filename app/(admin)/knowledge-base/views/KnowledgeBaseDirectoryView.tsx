// app/(admin)/knowledge-base/views/KnowledgeBaseDirectoryView.tsx
"use client";

import { useState, useEffect } from "react";
import KnowledgeBaseFilterToolbar from "../components/KnowledgeBaseFilterToolbar";
import KnowledgeBaseDataTable from "../components/KnowledgeBaseDataTable";
import KnowledgeArticleModal from "../components/KnowledgeArticleModal";
import Loader from "../../../components/shared/Loader";
import { faqsApi } from "../../../../lib/api/faqs";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function KnowledgeBaseDirectoryView() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [faqs, filterCategory, filterStatus, searchQuery]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await faqsApi.getAllAdmin(true);
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...faqs];

    if (filterCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === filterCategory);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((faq) =>
        filterStatus === "active" ? faq.is_active : !faq.is_active
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  };

  const categories = Array.from(new Set(faqs.map((faq) => faq.category).filter(Boolean)));

  const handleCreateFaq = () => {
    setSelectedFaq(null);
    setShowEditorModal(true);
  };

  const handleEditFaq = (faq: FAQ) => {
    setSelectedFaq(faq);
    setShowEditorModal(true);
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm("Are you sure you want to delete this FAQ article?")) {
      return;
    }

    try {
      await faqsApi.delete(faqId);
      fetchFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    }
  };

  const handleToggleStatus = async (faq: FAQ) => {
    try {
      await faqsApi.update(faq._id, { is_active: !faq.is_active });
      fetchFaqs();
    } catch (error) {
      console.error("Failed to update FAQ status:", error);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <KnowledgeBaseFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        onCategoryChange={setFilterCategory}
        onStatusChange={setFilterStatus}
        categories={categories}
        onCreateArticle={handleCreateFaq}
      />

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <KnowledgeBaseDataTable
          faqs={filteredFaqs}
          onEditFaq={handleEditFaq}
          onDeleteFaq={handleDeleteFaq}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Editor Modal */}
      {showEditorModal && (
        <KnowledgeArticleModal
          faq={selectedFaq}
          categories={categories}
          isOpen={showEditorModal}
          onClose={() => {
            setShowEditorModal(false);
            setSelectedFaq(null);
          }}
          onSave={() => {
            fetchFaqs();
            setShowEditorModal(false);
            setSelectedFaq(null);
          }}
        />
      )}
    </div>
  );
}
