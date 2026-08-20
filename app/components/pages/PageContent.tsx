// app/components/pages/PageContent.tsx
"use client";

import { FaHome, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import JoditHtmlContent from "../shared/JoditHtmlContent";

interface PageContentProps {
  page: {
    title: string;
    content: string;
    page_type: string;
    updated_at: string;
  };
}

export default function PageContent({ page }: PageContentProps) {
  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link
            href="/"
            aria-label="Home page"
            className="text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors"
          >
            <FaHome />
          </Link>
          <FaChevronRight className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs" aria-hidden="true"/>
          <span className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium">
            {page.title}
          </span>
        </nav>

        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
          <div className="border-b border-theme-border-light dark:border-theme-border-dark bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-8 py-6">
            <h1 className="text-3xl md:text-4xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              {page.title}
            </h1>
            <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
              Last updated:{" "}
              {new Date(page.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="px-8 py-8">
            <JoditHtmlContent content={page.content} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            aria-label="Home Page"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaHome/>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}