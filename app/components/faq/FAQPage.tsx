// app/components/faq/FAQPage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaHome,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";
import { faqsApi } from "../../../lib/api/faqs";
import Loader from "../shared/Loader";
import JoditHtmlContent from "../shared/JoditHtmlContent";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export default function FAQPage() {
  const [groupedFaqs, setGroupedFaqs] = useState<{ [key: string]: FAQ[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await faqsApi.getAll();
      setGroupedFaqs(data.groupedFaqs || {});
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(groupedFaqs);

  const getFilteredFaqs = () => {
    let faqs: FAQ[] = [];

    if (activeCategory === "all") {
      Object.values(groupedFaqs).forEach((categoryFaqs) => {
        faqs = [...faqs, ...categoryFaqs];
      });
    } else {
      faqs = groupedFaqs[activeCategory] || [];
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query),
      );
    }

    return faqs;
  };

  const filteredFaqs = getFilteredFaqs();

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            aria-label="Home"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors"
          >
            <FaHome />
          </Link>
          <FaChevronRight
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs"
          />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            FAQ
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark max-w-2xl mx-auto">
            Find answers to common questions about our products and services
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label="Search FAQs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-3 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              aria-label="All product categories"
              aria-pressed={activeCategory === "all"}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-blue-50 dark:hover:bg-blue-900/20"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* FAQs */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <div
                key={faq._id}
                className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq._id)}
                  aria-label={`Toggle answer for: ${faq.question || "this question"}`}
                  aria-expanded={expandedFaq === faq._id}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
                >
                  <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark pr-4">
                    {faq.question}
                  </span>
                  {expandedFaq === faq._id ? (
                    <FaChevronUp
                      className="text-blue-600 flex-shrink-0"
                    />
                  ) : (
                    <FaChevronDown
                      className="text-theme-text-muted-light dark:text-theme-text-muted-dark flex-shrink-0"
                      
                    />
                  )}
                </button>

                {expandedFaq === faq._id && (
                  <div className="px-6 pb-4 border-t border-theme-border-light dark:border-theme-border-dark pt-4">
                    <JoditHtmlContent content={faq.answer} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark">
              <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {searchQuery
                  ? "No FAQs match your search. Try different keywords."
                  : "No FAQs available at the moment."}
              </p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-8 border border-theme-border-light dark:border-theme-border-dark">
          <h3 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            Still have questions?
          </h3>
          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4">
            Can't find the answer you're looking for? Get in touch with our
            support team.
          </p>
          <Link
            href="/contact"
            aria-label="Go to Contact page"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
