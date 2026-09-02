// app/components/newsletter/CampaignsTable.tsx
"use client";

import { FaEdit, FaTrash, FaPaperPlane, FaEye } from "react-icons/fa";

interface Campaign {
  _id: string;
  title: string;
  subject: string;
  status: string;
  recipients_count: number;
  sent_at?: string;
  created_at: string;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onView: (campaign: Campaign) => void;
}

export default function CampaignsTable({
  campaigns,
  onEdit,
  onDelete,
  onSend,
  onView,
}: CampaignsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300";
      case "sent":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300/40";
      default:
        return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300";
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 sm:p-8 md:p-12 text-center border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No campaigns created yet. Click &quot;Create Campaign&quot; to draft an email blast.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
          <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
            <tr>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Recipients
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {campaigns.map((campaign) => (
              <tr
                key={campaign._id}
                className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              >
                <td className="px-4 lg:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[200px]">
                    {campaign.title}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4">
                  <div className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate max-w-[200px]">
                    {campaign.subject}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize border ${getStatusBadge(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark font-mono">
                  {campaign.recipients_count || 0}
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => onView(campaign)}
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 p-1 cursor-pointer"
                      title="Preview Campaign"
                      aria-label="View campaign"
                    >
                      <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {campaign.status !== "sent" && (
                      <>
                        <button
                          onClick={() => onEdit(campaign)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1 cursor-pointer"
                          title="Edit"
                          aria-label="Edit campaign"
                        >
                          <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onSend(campaign._id)}
                          className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 p-1 cursor-pointer"
                          title="Send to Active Subscribers"
                          aria-label="Send campaign"
                        >
                          <FaPaperPlane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(campaign._id)}
                      className="text-rose-600 hover:text-rose-800 dark:text-rose-400 p-1 cursor-pointer"
                      title="Delete"
                      aria-label="Delete campaign"
                    >
                      <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-theme-border-light dark:divide-theme-border-dark">
        {campaigns.map((campaign) => (
          <div
            key={campaign._id}
            className="p-3 sm:p-4 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {campaign.title}
                </h3>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate mt-0.5">
                  Subj: {campaign.subject}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize border shrink-0 ${getStatusBadge(
                  campaign.status
                )}`}
              >
                {campaign.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-theme-border-light dark:border-theme-border-dark text-xs">
              <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {new Date(campaign.created_at).toLocaleDateString()} • {campaign.recipients_count || 0} sent
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(campaign)}
                  className="text-purple-600 dark:text-purple-400 p-1"
                >
                  <FaEye className="w-3.5 h-3.5" />
                </button>
                {campaign.status !== "sent" && (
                  <>
                    <button
                      onClick={() => onEdit(campaign)}
                      className="text-blue-600 dark:text-blue-400 p-1"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSend(campaign._id)}
                      className="text-emerald-600 dark:text-emerald-400 p-1"
                    >
                      <FaPaperPlane className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(campaign._id)}
                  className="text-rose-600 dark:text-rose-400 p-1"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
