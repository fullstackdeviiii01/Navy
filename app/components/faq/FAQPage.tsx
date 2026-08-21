// app/components/faq/FAQPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Search, ChevronRight } from "lucide-react";
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
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-12 sm:py-16 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] mb-8" aria-label="Breadcrumb">
          <Link
            href="/"
            aria-label="Home"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            HOME
          </Link>
          <ChevronRight className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            FAQS
          </span>
        </nav>

        {/* Header */}
        <div className="mb-10 border-b border-theme-border-light dark:border-theme-border-dark pb-8">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-2">
            HELP & KNOWLEDGE BASE
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3">
            Frequently <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Asked Questions</span>
          </h1>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-2xl">
            Everything you need to know about our handcrafted lighting, shipping timelines, and care instructions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted-light dark:text-theme-text-muted-dark"
              aria-hidden="true"
            />
            <input
              type="text"
              aria-label="Search FAQs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, material, warranty, shipping..."
              className="w-full pl-11 pr-4 py-3.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light placeholder:text-theme-text-muted-light"
            />
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              aria-pressed={activeCategory === "all"}
              className={`px-4 py-2 border text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                activeCategory === "all"
                  ? "border-theme-primary bg-theme-primary text-theme-btn-text"
                  : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 border text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                  activeCategory === category
                    ? "border-theme-primary bg-theme-primary text-theme-btn-text"
                    : "border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* FAQs List */}
        <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark border-y border-theme-border-light dark:border-theme-border-dark">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = expandedFaq === faq._id;
              return (
                <div key={faq._id} className="py-4">
                  <button
                    onClick={() => toggleFaq(faq._id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between text-left py-2 hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors group"
                  >
                    <span className="font-serif text-base sm:text-lg text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark flex-shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-theme-hover-light dark:text-theme-hover-dark flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pt-3 pb-2 text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                      <JoditHtmlContent content={faq.answer} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
              {searchQuery
                ? "No FAQs match your search query."
                : "No FAQs available at this time."}
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-8 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-center space-y-4">
          <h3 className="text-xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Still need assistance?
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-md mx-auto">
            Our atelier specialists are available to answer any questions regarding bespoke custom projects or delivery schedules.
          </p>
          <Link
            href="/contact"
            className="inline-block py-3 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            CONTACT OUR CONCIERGE
          </Link>
        </div>
      </div>
    </div>
  );
}
