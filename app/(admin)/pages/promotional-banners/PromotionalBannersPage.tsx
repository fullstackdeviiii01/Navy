// app/(admin)/admin/promotional-banners/page.tsx
"use client";

import { useState, useEffect } from "react";
import { promotionalBannersApi } from "../../../../lib/api/promotionalBanners";
import BannerManagementHeader from "../../components/promotional-banners/BannerManagementHeader";
import BannerFilters from "../../components/promotional-banners/BannerFilters";
import BannerTable from "../../components/promotional-banners/BannerTable";
import BannerModal from "../../components/promotional-banners/BannerModal";
import Loader from "../../../components/shared/Loader";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  background_color: string;
  background_gradient?: string;
  text_color: string;
  images: any[];
  buttons: any[];
  target_page: string;
  is_active: boolean;
  sort_order: number;
  display_from?: Date;
  display_until?: Date;
  created_at: string;
}

export default function PromotionalBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [filterPage, setFilterPage] = useState<string>("all");

  useEffect(() => {
    console.log("PromotionalBannersPage: Component mounted");
    fetchBanners();
  }, [filterPage]);

  const fetchBanners = async () => {
    try {
      console.log("  PromotionalBannersPage: Fetching banners...");
      setLoading(true);
      const data = await promotionalBannersApi.getAll(true);
      console.log("PromotionalBannersPage: Fetched banners:", data.banners);

      let filteredBanners = data.banners;
      if (filterPage !== "all") {
        filteredBanners = data.banners.filter(
          (b: Banner) => b.target_page === filterPage,
        );
      }

      console.log(
        `   PromotionalBannersPage: Filtered to ${filteredBanners.length} banners`,
      );
      setBanners(filteredBanners);
    } catch (error) {
      console.error(
        "   PromotionalBannersPage: Failed to fetch banners:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = () => {
    console.log(" PromotionalBannersPage: Opening add banner modal");
    setModalMode("add");
    setSelectedBanner(null);
    setShowModal(true);
  };

  const handleEditBanner = (banner: Banner) => {
    console.log("   PromotionalBannersPage: Editing banner:", banner._id);
    setModalMode("edit");
    setSelectedBanner(banner);
    setShowModal(true);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this banner? It will also be removed from the home page layout.",
      )
    )
      return;

    console.log("   PromotionalBannersPage: Deleting banner:", bannerId);
    try {
      await promotionalBannersApi.delete(bannerId);
      console.log("   PromotionalBannersPage: Banner deleted");
      fetchBanners();
    } catch (error) {
      console.error(
        "   PromotionalBannersPage: Failed to delete banner:",
        error,
      );
    }
  };

  const handleFiltersChange = (newFilter: { page: string }) => {
    setFilterPage(newFilter.page);
  };

  if (loading) {
    return (
      <div className="relative h-32 sm:h-48 lg:h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <BannerManagementHeader onCreateBanner={handleAddBanner} />

      <BannerFilters
        filterPage={filterPage}
        onFiltersChange={handleFiltersChange}
      />

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        <p className="truncate">
          Showing{" "}
          <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            {banners.length}
          </span>{" "}
          banners
          {filterPage !== "all" && ` for ${filterPage} page`}
        </p>
      </div>

      {/* Banners Table */}
      <BannerTable
        banners={banners}
        onEditBanner={handleEditBanner}
        onDeleteBanner={handleDeleteBanner}
      />

      {/* Banner Modal */}
      <BannerModal
        isOpen={showModal}
        onClose={() => {
          console.log("   PromotionalBannersPage: Closing modal");
          setShowModal(false);
          setSelectedBanner(null);
        }}
        onSuccess={fetchBanners}
        banner={selectedBanner}
        mode={modalMode}
      />
    </div>
  );
}