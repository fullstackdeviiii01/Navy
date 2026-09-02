// app/(admin)/pages/newsletter/NewsletterPage.tsx
"use client";

import { useState, useEffect } from "react";
import { FaPlus, FaDownload, FaUsers, FaPaperPlane, FaSearch } from "react-icons/fa";
import NewsletterHeader from "../../../components/newsletter/NewsletterHeader";
import SubscribersTable from "../../../components/newsletter/SubscribersTable";
import SubscriberModal from "../../../components/newsletter/SubscriberModal";
import CampaignsTable from "../../../components/newsletter/CampaignsTable";
import CampaignModal from "../../../components/newsletter/CampaignModal";
import CampaignViewModal from "../../../components/newsletter/CampaignViewModal";
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

  const [subscribers, setSubscribers] = useState<any[]>([]);
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
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsPagination, setCampaignsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [campaignsFilters, setCampaignsFilters] = useState({
    status: "all",
  });
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "subscribers") {
      fetchSubscribers();
    } else {
      fetchCampaigns();
    }
  }, [
    activeTab,
    subscribersPagination.page,
    subscribersFilters,
    campaignsPagination.page,
    campaignsFilters,
  ]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await adminNewsletterApi.getSubscribers({
        page: subscribersPagination.page,
        limit: subscribersPagination.limit,
        status: subscribersFilters.status !== "all" ? subscribersFilters.status : undefined,
        search: subscribersFilters.search || undefined,
      });

      setSubscribers(data.subscribers || []);
      setSubscribersPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
      setStats(data.stats || { total: 0, active: 0, inactive: 0 });
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

      setCampaigns(data.campaigns || []);
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
    if (!confirm("Are you sure you want to broadcast this campaign to all active subscribers?")) return;

    try {
      const res = await adminNewsletterApi.sendCampaign(id);
      alert(res.message || "Campaign sent successfully!");
      fetchCampaigns();
    } catch (error: any) {
      alert(error.message || "Failed to send campaign");
    }
  };

  const handleViewCampaign = (campaign: any) => {
    setViewCampaign(campaign);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <NewsletterHeader stats={stats} />

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl shadow border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50">
          <nav className="flex px-4 gap-2" role="tablist">
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "subscribers"
                  ? "border-[#C59345] text-[#C59345]"
                  : "border-transparent text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light"
              }`}
              role="tab"
              aria-selected={activeTab === "subscribers"}
            >
              <FaUsers className="text-sm" />
              <span>Subscribers</span>
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "campaigns"
                  ? "border-[#C59345] text-[#C59345]"
                  : "border-transparent text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light"
              }`}
              role="tab"
              aria-selected={activeTab === "campaigns"}
            >
              <FaPaperPlane className="text-sm" />
              <span>Campaigns</span>
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "subscribers" && (
            <>
              {/* Subscribers Header - Filters and Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs" />
                    <input
                      type="text"
                      value={subscribersFilters.search}
                      onChange={(e) =>
                        setSubscribersFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      placeholder="Search email or name..."
                      className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345]"
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
                    className="px-3 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportSubscribers}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors text-xs font-medium cursor-pointer shadow-sm"
                  >
                    <FaDownload className="text-xs" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={handleCreateSubscriber}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#8A5E22] hover:bg-[#A8752B] text-white rounded-lg transition-colors text-xs font-bold cursor-pointer shadow-sm"
                  >
                    <FaPlus className="text-xs" />
                    <span>Add Subscriber</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader />
                </div>
              ) : (
                <SubscribersTable
                  subscribers={subscribers}
                  onEdit={handleEditSubscriber}
                  onDelete={handleDeleteSubscriber}
                  onToggleStatus={handleToggleSubscriberStatus}
                />
              )}
            </>
          )}

          {activeTab === "campaigns" && (
            <>
              {/* Campaigns Header - Filters and Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <select
                  value={campaignsFilters.status}
                  onChange={(e) =>
                    setCampaignsFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="px-3 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-[#C59345]"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                </select>

                <button
                  onClick={handleCreateCampaign}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#8A5E22] hover:bg-[#A8752B] text-white rounded-lg transition-colors text-xs font-bold cursor-pointer shadow-sm self-end"
                >
                  <FaPlus className="text-xs" />
                  <span>Create Campaign</span>
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader />
                </div>
              ) : (
                <CampaignsTable
                  campaigns={campaigns}
                  onEdit={handleEditCampaign}
                  onDelete={handleDeleteCampaign}
                  onSend={handleSendCampaign}
                  onView={handleViewCampaign}
                />
              )}
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
