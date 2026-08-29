// app/components/reviews/ReviewCard.tsx
"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Check, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import Image from "next/image";

interface ReviewCardProps {
  review: {
    _id: string;
    user_id?: {
      _id: string;
      name: string;
      avatar_url?: string;
    };
    guest_name?: string;
    rating: number;
    title: string;
    comment: string;
    images?: Array<{
      url: string;
      caption?: string;
    }>;
    videos?: Array<{
      url: string;
      thumbnail?: string;
      caption?: string;
    }>;
    verified_purchase: boolean;
    helpful_count: number;
    not_helpful_count: number;
    created_at: string;
  };
  currentUserId?: string;
  currentSessionId?: string | null;
  onMarkHelpful?: (reviewId: string, voteType: "helpful" | "not_helpful") => void;
  userVote?: "helpful" | "not_helpful" | null;
}

export default function ReviewCard({
  review,
  currentUserId,
  currentSessionId,
  onMarkHelpful,
  userVote: initialUserVote,
}: ReviewCardProps) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<"image" | "video" | null>(null);
  const [localHelpfulCount, setLocalHelpfulCount] = useState(review.helpful_count);
  const [localNotHelpfulCount, setLocalNotHelpfulCount] = useState(review.not_helpful_count);
  const [userVote, setUserVote] = useState<"helpful" | "not_helpful" | null>(initialUserVote || null);
  const [isVoting, setIsVoting] = useState(false);

  const displayName = review.user_id?.name || review.guest_name || "Verified Customer";
  const avatarUrl = review.user_id?.avatar_url;

  const allMedia = [
    ...(review.images || []).map((img) => ({ type: "image" as const, ...img })),
    ...(review.videos || []).map((vid) => ({ type: "video" as const, ...vid })),
  ];

  const handleVote = async (voteType: "helpful" | "not_helpful") => {
    if (!onMarkHelpful || isVoting) return;

    setIsVoting(true);

    try {
      const previousVote = userVote;

      if (previousVote === voteType) {
        setUserVote(null);
        if (voteType === "helpful") {
          setLocalHelpfulCount(Math.max(0, localHelpfulCount - 1));
        } else {
          setLocalNotHelpfulCount(Math.max(0, localNotHelpfulCount - 1));
        }
      } else if (previousVote) {
        setUserVote(voteType);
        if (voteType === "helpful") {
          setLocalHelpfulCount(localHelpfulCount + 1);
          setLocalNotHelpfulCount(Math.max(0, localNotHelpfulCount - 1));
        } else {
          setLocalNotHelpfulCount(localNotHelpfulCount + 1);
          setLocalHelpfulCount(Math.max(0, localHelpfulCount - 1));
        }
      } else {
        setUserVote(voteType);
        if (voteType === "helpful") {
          setLocalHelpfulCount(localHelpfulCount + 1);
        } else {
          setLocalNotHelpfulCount(localNotHelpfulCount + 1);
        }
      }

      await onMarkHelpful(review._id, voteType);
    } catch (error) {
      console.error("Vote failed:", error);
      setUserVote(initialUserVote || null);
      setLocalHelpfulCount(review.helpful_count);
      setLocalNotHelpfulCount(review.not_helpful_count);
    } finally {
      setIsVoting(false);
    }
  };

  const openMedia = (index: number, type: "image" | "video") => {
    setSelectedMediaIndex(index);
    setSelectedMediaType(type);
  };

  const closeMedia = () => {
    setSelectedMediaIndex(null);
    setSelectedMediaType(null);
  };

  const navigateMedia = (direction: "prev" | "next") => {
    if (selectedMediaIndex === null) return;
    
    const newIndex = direction === "next" 
      ? (selectedMediaIndex + 1) % allMedia.length
      : (selectedMediaIndex - 1 + allMedia.length) % allMedia.length;
    
    setSelectedMediaIndex(newIndex);
    setSelectedMediaType(allMedia[newIndex].type);
  };

  return (
    <>
      <article className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 transition-colors">
        {/* Header: User Info, Date & Rating */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-border-light dark:border-theme-border-dark mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light dark:bg-theme-card-dark flex items-center justify-center font-serif text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="36px" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {displayName}
                </span>
                {review.verified_purchase && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300 text-[9px] uppercase tracking-wider font-medium">
                    <Check className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating
                    ? "fill-amber-500 text-amber-500"
                    : "text-theme-border-light dark:text-theme-border-dark"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Content: Title & Text */}
        <div className="space-y-2 mb-4 min-w-0">
          <h4 className="text-sm sm:text-base font-serif font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark break-words [overflow-wrap:anywhere]">
            {review.title}
          </h4>
          <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-line">
            {review.comment}
          </p>
        </div>

        {/* Attached Photos & Videos */}
        {allMedia.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-4">
            {allMedia.map((media, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => openMedia(idx, media.type)}
                className="relative w-16 h-16 border border-theme-border-light dark:border-theme-border-dark group overflow-hidden bg-black/5 dark:bg-black/20"
                aria-label={`View media ${idx + 1}`}
              >
                {media.type === "image" ? (
                  <img src={media.url} alt="Review attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <>
                    {media.thumbnail ? (
                      <img src={media.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Footer: Helpful Vote */}
        {onMarkHelpful && (
          <div className="flex items-center gap-3 pt-3 border-t border-theme-border-light dark:border-theme-border-dark text-xs">
            <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light">
              Was this review helpful?
            </span>
            <button
              onClick={() => handleVote("helpful")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider border transition-colors ${
                userVote === "helpful"
                  ? "border-theme-primary bg-theme-primary text-theme-btn-text"
                  : "border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light hover:border-theme-hover-light"
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{localHelpfulCount > 0 ? localHelpfulCount : "Yes"}</span>
            </button>
            <button
              onClick={() => handleVote("not_helpful")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider border transition-colors ${
                userVote === "not_helpful"
                  ? "border-theme-primary bg-theme-primary text-theme-btn-text"
                  : "border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light hover:border-theme-hover-light"
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>{localNotHelpfulCount > 0 ? localNotHelpfulCount : "No"}</span>
            </button>
          </div>
        )}
      </article>

      {/* Lightbox Modal */}
      {selectedMediaIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={closeMedia}
        >
          <button
            onClick={closeMedia}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-10"
            aria-label="Close media preview"
          >
            <X className="w-6 h-6" />
          </button>

          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia("prev");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 bg-black/40 border border-white/20 z-10"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateMedia("next");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 bg-black/40 border border-white/20 z-10"
                aria-label="Next media"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-3xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {selectedMediaType === "image" ? (
              <img
                src={allMedia[selectedMediaIndex].url}
                alt="Review attachment enlarged"
                className="max-h-[80vh] max-w-full object-contain border border-white/10"
              />
            ) : (
              <video
                src={allMedia[selectedMediaIndex].url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full border border-white/10"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}