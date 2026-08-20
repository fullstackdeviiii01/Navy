// app/components/reviews/ReviewCard.tsx
"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, BadgeCheck, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
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
    detailed_ratings: {
      quality: number;
      durability: number;
      matches_description: number;
    };
    images: Array<{
      url: string;
      caption?: string;
    }>;
    videos: Array<{
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

  const displayName = review.user_id?.name || review.guest_name || "Anonymous";
  const avatarUrl = review.user_id?.avatar_url;

  const allMedia = [
    ...(review.images || []).map(img => ({ type: 'image' as const, ...img })),
    ...(review.videos || []).map(vid => ({ type: 'video' as const, ...vid }))
  ];

  const handleVote = async (voteType: "helpful" | "not_helpful") => {
    if (!onMarkHelpful || isVoting) return;

    setIsVoting(true);

    try {
      const previousVote = userVote;
      const previousHelpful = localHelpfulCount;
      const previousNotHelpful = localNotHelpfulCount;

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

  const DetailedRatingBox = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
      <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-center truncate w-full">
        {label}
      </span>
      <div className="flex items-center gap-0.5" role="img" aria-label={`${label}: ${value.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((box) => (
          <div
            key={box}
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-all duration-300 ${
              box <= Math.round(value)
                ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-xs font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
        {value.toFixed(1)}
      </span>
    </div>
  );

  return (
    <>
      <article className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-200">
        {/* Header with User Info, Stars, and Helpful Buttons */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0" aria-hidden="true">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg sm:text-xl font-semibold text-gray-500 dark:text-gray-400">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* First Row: Name, Verified Badge, Stars */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm sm:text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                {displayName}
              </span>
              {review.verified_purchase && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium rounded-full flex-shrink-0">
                  <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                  Verified
                </span>
              )}
              {/* Stars Rating */}
              <div className="flex items-center gap-0.5" role="img" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {/* Second Row: Date and Helpful Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <time 
                className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark"
                dateTime={review.created_at}
              >
                {new Date(review.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              
              {/* Helpful Buttons */}
              {onMarkHelpful && (
                <>
                  <button
                    onClick={() => handleVote("helpful")}
                    disabled={isVoting}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                      userVote === "helpful"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    } disabled:opacity-50`}
                    aria-label={`Mark review as helpful${localHelpfulCount > 0 ? `. ${localHelpfulCount} people found this helpful` : ''}`}
                    aria-pressed={userVote === "helpful"}
                  >
                    <ThumbsUp className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${userVote === "helpful" ? "fill-current" : ""}`} />
                    <span className="hidden xs:inline">Helpful</span>
                    {localHelpfulCount > 0 && <span>({localHelpfulCount})</span>}
                  </button>

                  <button
                    onClick={() => handleVote("not_helpful")}
                    disabled={isVoting}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                      userVote === "not_helpful"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                    } disabled:opacity-50`}
                    aria-label={`Mark review as not helpful${localNotHelpfulCount > 0 ? `. ${localNotHelpfulCount} people found this not helpful` : ''}`}
                    aria-pressed={userVote === "not_helpful"}
                  >
                    <ThumbsDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${userVote === "not_helpful" ? "fill-current" : ""}`} />
                    <span className="hidden xs:inline">Not Helpful</span>
                    {localNotHelpfulCount > 0 && <span>({localNotHelpfulCount})</span>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {review.title}
        </h4>

        {/* Comment */}
        <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed mb-1 break-words line-clamp-4">
          {review.comment}
        </p>

        {/* Media Gallery */}
        {allMedia.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2" role="list" aria-label="Review media gallery">
              {allMedia.map((media, index) => (
                <button
                  key={index}
                  onClick={() => openMedia(index, media.type)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark hover:opacity-80 transition-opacity group min-h-[44px] min-w-[44px]"
                  aria-label={media.type === 'image' ? `View image ${index + 1} of ${allMedia.length}${media.caption ? `: ${media.caption}` : ''}` : `Play video ${index + 1} of ${allMedia.length}${media.caption ? `: ${media.caption}` : ''}`}
                  role="listitem"
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={media.caption || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={media.thumbnail || ''}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white"/>
                      </div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Ratings */}
        {review.detailed_ratings && (
          <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg" role="group" aria-label="Detailed product ratings">
            <div className="flex gap-2 sm:gap-3 items-start justify-center">
              <DetailedRatingBox label="Quality" value={review.detailed_ratings.quality} />
              <div className="w-px h-10 bg-theme-border-light dark:bg-theme-border-dark" aria-hidden="true"></div>
              <DetailedRatingBox label="Durability" value={review.detailed_ratings.durability} />
              <div className="w-px h-10 bg-theme-border-light dark:bg-theme-border-dark" aria-hidden="true"></div>
              <DetailedRatingBox label="Matches Desc." value={review.detailed_ratings.matches_description} />
            </div>
          </div>
        )}
      </article>

      {/* Media Viewer Modal */}
      {selectedMediaIndex !== null && selectedMediaType && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeMedia}
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
        >
          <button
            onClick={closeMedia}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close media viewer"
          >
            <X className="h-8 w-8"/>
          </button>

          {allMedia.length > 1 && selectedMediaIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateMedia("prev");
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {allMedia.length > 1 && selectedMediaIndex < allMedia.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateMedia("next");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next media"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            {selectedMediaType === 'image' ? (
              <img
                src={allMedia[selectedMediaIndex].url}
                alt={allMedia[selectedMediaIndex].caption || `Review media ${selectedMediaIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={allMedia[selectedMediaIndex].url}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] rounded-lg"
                aria-label={allMedia[selectedMediaIndex].caption || `Review video ${selectedMediaIndex + 1}`}
              >
                Your browser does not support the video tag.
              </video>
            )}
            {allMedia[selectedMediaIndex].caption && (
              <p className="mt-4 text-center text-white text-sm sm:text-base">
                {allMedia[selectedMediaIndex].caption}
              </p>
            )}
            <p className="mt-2 text-center text-white/60 text-xs sm:text-sm" aria-live="polite">
              {selectedMediaIndex + 1} of {allMedia.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}