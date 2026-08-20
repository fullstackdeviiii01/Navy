"use client";

import { FaTimes } from "react-icons/fa";
import JoditHtmlContent from "../../../components/shared/JoditHtmlContent";

interface CampaignViewModalProps {
  campaign: any;
  onClose: () => void;
}

export default function CampaignViewModal({
  campaign,
  onClose,
}: CampaignViewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-3 md:mx-4">
        <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              {campaign.title}
            </h3>
            <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1 truncate">
              Subject: {campaign.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark ml-2 flex-shrink-0 relative after:absolute after:inset-[-4px] after:content-['']"
            aria-label="Close"
            title="Close"
          >
            <FaTimes className="text-lg sm:text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
            <JoditHtmlContent content={campaign.content} />
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6 border-t border-theme-border-light dark:border-theme-border-dark">
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex-1 min-w-0">
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Status:{" "}
              </span>
              <span className="font-medium capitalize text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                {campaign.status}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                Recipients:{" "}
              </span>
              <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {campaign.recipients_count || 0}
              </span>
            </div>
            {campaign.sent_at && (
              <div className="flex-1 min-w-0">
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Sent:{" "}
                </span>
                <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
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