// app/components/newsletter/CampaignViewModal.tsx
"use client";

import { FaTimes } from "react-icons/fa";
import JoditHtmlContent from "../shared/JoditHtmlContent";

interface CampaignViewModalProps {
  campaign: any;
  onClose: () => void;
}

export default function CampaignViewModal({
  campaign,
  onClose,
}: CampaignViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-theme-border-light dark:border-theme-border-dark shadow-2xl">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark font-serif truncate">
              {campaign.title}
            </h3>
            <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 truncate">
              Subject: {campaign.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark ml-2 cursor-pointer p-1"
            aria-label="Close"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F9F6F0] dark:bg-[#120D09]">
          <div className="bg-white dark:bg-[#1A130D] p-5 sm:p-8 rounded-lg border border-[#E0D4C3] dark:border-[#8A5E22]/30 shadow-sm max-w-2xl mx-auto">
            <div className="border-b border-[#E0D4C3] dark:border-[#8A5E22]/30 pb-4 mb-4 text-center">
              <span className="font-serif text-lg tracking-widest text-[#C59345] font-bold">TALAL WOODEN LAMPS</span>
            </div>
            <JoditHtmlContent content={campaign.content} />
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">Status: </span>
              <span className="font-semibold capitalize text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {campaign.status}
              </span>
            </div>
            <div>
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">Recipients: </span>
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono">
                {campaign.recipients_count || 0}
              </span>
            </div>
            {campaign.sent_at && (
              <div>
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">Sent At: </span>
                <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(campaign.sent_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
