// app/hero-slider/page.tsx (or pages/hero-slider.tsx)
"use client";

import { useState, useEffect } from "react";
import { heroSliderApi } from "../../../../lib/api/heroSlider";
import HeroSliderHeader from "../../components/hero-slider/HeroSliderHeader";
import HeroSliderTable from "../../components/hero-slider/HeroSliderTable";
import HeroSliderModal from "../../components/hero-slider/HeroSliderModal";
import Loader from "../../../components/shared/Loader";

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  button_text: string;
  button_url: string;
  image_url: string;
  background_gradient: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await heroSliderApi.getAll(true);
      setSlides(data.slides);
    } catch (error) {
      console.error("Failed to fetch slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    setModalMode("add");
    setSelectedSlide(null);
    setShowModal(true);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setModalMode("edit");
    setSelectedSlide(slide);
    setShowModal(true);
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      await heroSliderApi.delete(slideId);
      fetchSlides();
    } catch (error) {
      console.error("Failed to delete slide:", error);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await heroSliderApi.update(slide._id, {
        is_active: !slide.is_active,
      });
      fetchSlides();
    } catch (error) {
      console.error("Failed to toggle slide status:", error);
    }
  };

  const handleMoveSlide = async (slideId: string, direction: "up" | "down") => {
    const currentIndex = slides.findIndex((s) => s._id === slideId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    try {
      const currentSlide = slides[currentIndex];
      const targetSlide = slides[targetIndex];

      await Promise.all([
        heroSliderApi.update(currentSlide._id, {
          sort_order: targetSlide.sort_order,
        }),
        heroSliderApi.update(targetSlide._id, {
          sort_order: currentSlide.sort_order,
        }),
      ]);

      fetchSlides();
    } catch (error) {
      console.error("Failed to reorder slides:", error);
    }
  };

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <HeroSliderHeader onAddSlide={handleAddSlide} />

      <HeroSliderTable
        slides={slides}
        onEditSlide={handleEditSlide}
        onDeleteSlide={handleDeleteSlide}
        onToggleActive={handleToggleActive}
        onMoveSlide={handleMoveSlide}
      />

      <HeroSliderModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSlide(null);
        }}
        onSuccess={fetchSlides}
        slide={selectedSlide}
        mode={modalMode}
      />
    </div>
  );
}