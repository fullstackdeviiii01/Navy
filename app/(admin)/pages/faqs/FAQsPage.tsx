// page.tsx (FAQsPage)
"use client";

import { useState, useEffect } from "react";
import FAQManagementHeader from "../../components/faqs/FAQManagementHeader";
import FAQFilters from "../../components/faqs/FAQFilters";
import FAQTable from "../../components/faqs/FAQTable";
import FAQEditorModal from "../../components/faqs/FAQEditorModal";
import { faqsApi } from "../../../../lib/api/faqs";
import Loader from "../../../components/shared/Loader";

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

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [groupedFaqs, setGroupedFaqs] = useState<any>({});
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
      setFaqs(data.faqs);
      setGroupedFaqs(data.groupedFaqs);
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

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const handleCreateFaq = () => {
    setSelectedFaq(null);
    setShowEditorModal(true);
  };

  const handleEditFaq = (faq: FAQ) => {
    setSelectedFaq(faq);
    setShowEditorModal(true);
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      await faqsApi.delete(faqId);
      fetchFaqs();
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
      alert("Failed to delete FAQ");
    }
  };

  const handleToggleStatus = async (faq: FAQ) => {
    try {
      await faqsApi.update(faq._id, { is_active: !faq.is_active });
      fetchFaqs();
    } catch (error) {
      console.error("Failed to update FAQ status:", error);
      alert("Failed to update FAQ status");
    }
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleFiltersChange = (newFilters: { category: string; status: string }) => {
    setFilterCategory(newFilters.category);
    setFilterStatus(newFilters.status);
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <FAQManagementHeader 
        totalFaqs={faqs.length} 
        activeFaqs={faqs.filter(f => f.is_active).length}
        onCreateFaq={handleCreateFaq}
      />

      <FAQFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        onFiltersChange={handleFiltersChange}
        categories={categories}
        onSearch={handleSearch}
      />

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        <p className="break-words">
          Showing{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {filteredFaqs.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {faqs.length}
          </span>{" "}
          FAQs
        </p>
      </div>

      {/* FAQs Table */}
      <FAQTable
        faqs={filteredFaqs}
        onEditFaq={handleEditFaq}
        onDeleteFaq={handleDeleteFaq}
        onToggleStatus={handleToggleStatus}
      />

      {/* FAQ Editor Modal */}
      {showEditorModal && (
        <FAQEditorModal
          faq={selectedFaq}
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