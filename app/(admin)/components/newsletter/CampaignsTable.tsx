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
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 sm:p-8 md:p-12 text-center border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No campaigns found.
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
                    className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {campaign.recipients_count || 0}
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => onView(campaign)}
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                      title="View"
                      aria-label="View campaign"
                    >
                      <FaEye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    {campaign.status !== "sent" && (
                      <>
                        <button
                          onClick={() => onEdit(campaign)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                          title="Edit"
                          aria-label="Edit campaign"
                        >
                          <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onSend(campaign._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
                          title="Send"
                          aria-label="Send campaign"
                        >
                          <FaPaperPlane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(campaign._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 relative after:absolute after:inset-[-4px] after:content-['']"
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

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        <div className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
          {campaigns.map((campaign) => (
            <div
              key={campaign._id}
              className="p-3 sm:p-4 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
            >
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate mt-0.5">
                    {campaign.subject}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs sm:text-sm">
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Recipients
                  </p>
                  <p className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {campaign.recipients_count || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Created
                  </p>
                  <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Sent
                  </p>
                  <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 sm:space-x-3 pt-2 sm:pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
                <button
                  onClick={() => onView(campaign)}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="View campaign"
                >
                  <FaEye className="w-3 h-3" />
                  View
                </button>
                {campaign.status !== "sent" && (
                  <>
                    <button
                      onClick={() => onEdit(campaign)}
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                      aria-label="Edit campaign"
                    >
                      <FaEdit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => onSend(campaign._id)}
                      className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                      aria-label="Send campaign"
                    >
                      <FaPaperPlane className="w-3 h-3" />
                      Send
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(campaign._id)}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Delete campaign"
                >
                  <FaTrash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-theme-border-light dark:divide-theme-border-dark">
        {campaigns.map((campaign) => (
          <div
            key={campaign._id}
            className="p-3 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {campaign.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize flex-shrink-0 ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate">
                  Subj: {campaign.subject}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Recipients:
                </span>
                <span className="ml-1 font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {campaign.recipients_count || 0}
                </span>
              </div>
              <div>
                <span className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Created:
                </span>
                <span className="ml-1 text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-theme-border-light dark:border-theme-border-dark">
              <button
                onClick={() => onView(campaign)}
                className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium text-purple-600 border border-purple-600 rounded hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                aria-label="View campaign"
              >
                <FaEye className="w-3 h-3" />
                View
              </button>
              {campaign.status !== "sent" && (
                <>
                  <button
                    onClick={() => onEdit(campaign)}
                    className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Edit campaign"
                  >
                    <FaEdit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => onSend(campaign._id)}
                    className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium text-green-600 border border-green-600 rounded hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Send campaign"
                  >
                    <FaPaperPlane className="w-3 h-3" />
                    Send
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(campaign._id)}
                className="flex flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20 relative after:absolute after:inset-[-4px] after:content-['']"
                aria-label="Delete campaign"
              >
                <FaTrash className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}