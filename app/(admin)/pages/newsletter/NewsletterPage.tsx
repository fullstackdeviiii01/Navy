"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaDownload, FaUsers, FaPaperPlane, FaSearch } from "react-icons/fa";
import NewsletterHeader from "../../components/newsletter/NewsletterHeader";
import SubscribersTable from "../../components/newsletter/SubscribersTable";
import SubscriberModal from "../../components/newsletter/SubscriberModal";
import CampaignsTable from "../../components/newsletter/CampaignsTable";
import CampaignModal from "../../components/newsletter/CampaignModal";
import CampaignViewModal from "../../components/newsletter/CampaignViewModal";
import { adminNewsletterApi } from "../../../../lib/api/newsletter";
import Loader from "../../../components/shared/Loader";

type TabType = "subscribers" | "campaigns";

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState<TabType>("subscribers");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [subscribers, setSubscribers] = useState([]);
  const [subscribersPagination, setSubscribersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [subscribersFilters, setSubscribersFilters] = useState({
    status: "all",
    search: "",
  });
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [campaignsPagination, setCampaignsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [campaignsFilters, setCampaignsFilters] = useState({
    status: "all",
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);

  useEffect(() => {
    if (activeTab === "subscribers") {
      fetchSubscribers();
    } else {
      fetchCampaigns();
    }
  }, [activeTab, subscribersPagination.page, subscribersFilters, campaignsPagination.page, campaignsFilters]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await adminNewsletterApi.getSubscribers({
        page: subscribersPagination.page,
        limit: subscribersPagination.limit,
        status: subscribersFilters.status !== "all" ? subscribersFilters.status : undefined,
        search: subscribersFilters.search || undefined,
      });

      setSubscribers(data.subscribers);
      setSubscribersPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await adminNewsletterApi.getCampaigns({
        page: campaignsPagination.page,
        limit: campaignsPagination.limit,
        status: campaignsFilters.status !== "all" ? campaignsFilters.status : undefined,
      });

      setCampaigns(data.campaigns);
      setCampaignsPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscriber = () => {
    setSelectedSubscriber(null);
    setShowSubscriberModal(true);
  };

  const handleEditSubscriber = (subscriber: any) => {
    setSelectedSubscriber(subscriber);
    setShowSubscriberModal(true);
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
      await adminNewsletterApi.deleteSubscriber(id);
      fetchSubscribers();
    } catch (error) {
      alert("Failed to delete subscriber");
    }
  };

  const handleToggleSubscriberStatus = async (subscriber: any) => {
    try {
      await adminNewsletterApi.updateSubscriber(subscriber._id, {
        is_active: !subscriber.is_active,
      });
      fetchSubscribers();
    } catch (error) {
      alert("Failed to update subscriber status");
    }
  };

  const handleExportSubscribers = async () => {
    try {
      await adminNewsletterApi.exportSubscribers(
        subscribersFilters.status !== "all" ? subscribersFilters.status : undefined
      );
    } catch (error) {
      alert("Failed to export subscribers");
    }
  };

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowCampaignModal(true);
  };

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowCampaignModal(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await adminNewsletterApi.deleteCampaign(id);
      fetchCampaigns();
    } catch (error) {
      alert("Failed to delete campaign");
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm("Are you sure you want to send this campaign to all active subscribers?")) return;

    try {
      await adminNewsletterApi.sendCampaign(id);
      alert("Campaign sent successfully");
      fetchCampaigns();
    } catch (error: any) {
      alert(error.message || "Failed to send campaign");
    }
  };

  const handleViewCampaign = (campaign: any) => {
    setViewCampaign(campaign);
  };

  if (loading && subscribers.length === 0 && campaigns.length === 0) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <NewsletterHeader stats={stats} />

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark">
        {/* Tabs Navigation */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark overflow-x-auto">
          <nav 
            className="flex min-w-max px-2"
            role="tablist"
            aria-label="Newsletter management sections"
          >
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap relative after:absolute after:inset-[-4px] after:content-[''] ${
                activeTab === "subscribers"
                  ? "bg-theme-primary text-white border-b-2 border-theme-primary"
                  : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              }`}
              role="tab"
              aria-selected={activeTab === "subscribers"}
              aria-label="Subscribers"
            >
              <FaUsers className="text-xs sm:text-sm" />
              <span>Subscribers</span>
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap relative after:absolute after:inset-[-4px] after:content-[''] ${
                activeTab === "campaigns"
                  ? "bg-theme-primary text-white border-b-2 border-theme-primary"
                  : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
              }`}
              role="tab"
              aria-selected={activeTab === "campaigns"}
              aria-label="Campaigns"
            >
              <FaPaperPlane className="text-xs sm:text-sm" />
              <span>Campaigns</span>
            </button>
          </nav>
        </div>

        <div className="p-3 sm:p-4 lg:p-6">
          {activeTab === "subscribers" && (
            <>
              {/* Subscribers Header - Filters and Actions */}
              <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm" />
                    <input
                      type="text"
                      value={subscribersFilters.search}
                      onChange={(e) =>
                        setSubscribersFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      placeholder="Search by email or name..."
                      className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                      aria-label="Search subscribers"
                    />
                  </div>
                  <select
                    value={subscribersFilters.status}
                    onChange={(e) =>
                      setSubscribersFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleExportSubscribers}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Export subscribers as CSV"
                  >
                    <FaDownload className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                  <button
                    onClick={handleCreateSubscriber}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
                    aria-label="Add new subscriber"
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Add Subscriber</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {subscribers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {subscribersPagination.total}
                  </span>{" "}
                  subscribers
                </p>
                {subscribersPagination.totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setSubscribersPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={subscribersPagination.page === 1}
                      className="px-2 sm:px-3 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded disabled:opacity-50 relative after:absolute after:inset-[-4px] after:content-['']"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1">
                      Page {subscribersPagination.page} of {subscribersPagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setSubscribersPagination((prev) => ({
                          ...prev,
                          page: Math.min(subscribersPagination.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={subscribersPagination.page === subscribersPagination.totalPages}
                      className="px-2 sm:px-3 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded disabled:opacity-50 relative after:absolute after:inset-[-4px] after:content-['']"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <SubscribersTable
                subscribers={subscribers}
                onEdit={handleEditSubscriber}
                onDelete={handleDeleteSubscriber}
                onToggleStatus={handleToggleSubscriberStatus}
              />
            </>
          )}

          {activeTab === "campaigns" && (
            <>
              {/* Campaigns Header - Filters and Actions */}
              <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <select
                  value={campaignsFilters.status}
                  onChange={(e) =>
                    setCampaignsFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  aria-label="Filter campaigns by status"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                </select>

                <button
                  onClick={handleCreateCampaign}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
                  aria-label="Create new campaign"
                >
                  <FaPlus className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Create Campaign</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>

              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {campaigns.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {campaignsPagination.total}
                  </span>{" "}
                  campaigns
                </p>
                {campaignsPagination.totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setCampaignsPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={campaignsPagination.page === 1}
                      className="px-2 sm:px-3 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded disabled:opacity-50 relative after:absolute after:inset-[-4px] after:content-['']"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1">
                      Page {campaignsPagination.page} of {campaignsPagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCampaignsPagination((prev) => ({
                          ...prev,
                          page: Math.min(campaignsPagination.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={campaignsPagination.page === campaignsPagination.totalPages}
                      className="px-2 sm:px-3 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded disabled:opacity-50 relative after:absolute after:inset-[-4px] after:content-['']"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <CampaignsTable
                campaigns={campaigns}
                onEdit={handleEditCampaign}
                onDelete={handleDeleteCampaign}
                onSend={handleSendCampaign}
                onView={handleViewCampaign}
              />
            </>
          )}
        </div>
      </div>

      {showSubscriberModal && (
        <SubscriberModal
          subscriber={selectedSubscriber}
          onClose={() => {
            setShowSubscriberModal(false);
            setSelectedSubscriber(null);
          }}
          onSave={() => {
            fetchSubscribers();
            setShowSubscriberModal(false);
            setSelectedSubscriber(null);
          }}
        />
      )}

      {showCampaignModal && (
        <CampaignModal
          campaign={selectedCampaign}
          onClose={() => {
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
          onSave={() => {
            fetchCampaigns();
            setShowCampaignModal(false);
            setSelectedCampaign(null);
          }}
        />
      )}

      {viewCampaign && (
        <CampaignViewModal
          campaign={viewCampaign}
          onClose={() => setViewCampaign(null)}
        />
      )}
    </div>
  );
}