// app/components/reviews/ReviewForm.tsx
"use client";

import { useState } from "react";
import { Star, X, Upload, Trash2, Image as ImageIcon, Video as VideoIcon, Play } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSubmit: (data: {
    rating: number;
    title: string;
    comment: string;
    detailed_ratings: {
      quality: number;
      durability: number;
      matches_description: number;
    };
    images: Array<{ url: string; caption?: string }>;
    videos: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    rating: number;
    title: string;
    comment: string;
    detailed_ratings: {
      quality: number;
      durability: number;
      matches_description: number;
    };
    images: Array<{ url: string; caption?: string }>;
    videos: Array<{ url: string; thumbnail?: string; caption?: string }>;
  };
  isEdit?: boolean;
}

export default function ReviewForm({
  productId,
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(initialData?.title || "");
  const [comment, setComment] = useState(initialData?.comment || "");
  
  const [qualityRating, setQualityRating] = useState(initialData?.detailed_ratings?.quality || 0);
  const [durabilityRating, setDurabilityRating] = useState(initialData?.detailed_ratings?.durability || 0);
  const [matchesRating, setMatchesRating] = useState(initialData?.detailed_ratings?.matches_description || 0);
  
  const [hoverQuality, setHoverQuality] = useState(0);
  const [hoverDurability, setHoverDurability] = useState(0);
  const [hoverMatches, setHoverMatches] = useState(0);
  
  const [images, setImages] = useState<Array<{ url: string; caption?: string }>>(
    initialData?.images || []
  );
  const [videos, setVideos] = useState<Array<{ url: string; thumbnail?: string; caption?: string }>>(
    initialData?.videos || []
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/reviews/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setImages([...images, { url: data.url, caption: "" }]);
    } catch (error: any) {
      setError(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videos.length >= 2) {
      setError("Maximum 2 videos allowed");
      return;
    }

    setUploadingVideo(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch("/api/reviews/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload video");
      }

      const data = await response.json();
      setVideos([...videos, { url: data.url, thumbnail: data.thumbnail, caption: "" }]);
    } catch (error: any) {
      setError(error.message || "Failed to upload video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const updateImageCaption = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    setImages(newImages);
  };

  const updateVideoCaption = (index: number, caption: string) => {
    const newVideos = [...videos];
    newVideos[index].caption = caption;
    setVideos(newVideos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }

    if (qualityRating === 0 || durabilityRating === 0 || matchesRating === 0) {
      setError("Please rate all aspects (Quality, Durability, Matches Description)");
      return;
    }

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Comment must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        rating,
        title,
        comment,
        detailed_ratings: {
          quality: qualityRating,
          durability: durabilityRating,
          matches_description: matchesRating,
        },
        images,
        videos,
      });
    } catch (error: any) {
      setError(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars = ({
    value,
    hover,
    onValueChange,
    onHoverChange,
    label,
    id,
  }: {
    value: number;
    hover: number;
    onValueChange: (value: number) => void;
    onHoverChange: (value: number) => void;
    label: string;
    id: string;
  }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
        {label} *
      </label>
      <div className="flex items-center gap-2" role="radiogroup" aria-labelledby={id} id={id}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onValueChange(star)}
            onMouseEnter={() => onHoverChange(star)}
            onMouseLeave={() => onHoverChange(0)}
            className="transition-all hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Rate ${star} out of 5 stars`}
            role="radio"
            aria-checked={value === star}
          >
            <Star
              size={28}
              className={`${
                star <= (hover || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark" aria-live="polite">
            {value === 1 && "Poor"}
            {value === 2 && "Fair"}
            {value === 3 && "Good"}
            {value === 4 && "Very Good"}
            {value === 5 && "Excellent"}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {isEdit ? "Edit Your Review" : "Write a Review"}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close review form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Overall Rating */}
        <RatingStars
          value={rating}
          hover={hoverRating}
          onValueChange={setRating}
          onHoverChange={setHoverRating}
          label="Overall Rating"
          id="overall-rating"
        />

        {/* Detailed Ratings */}
        <fieldset className="border-t border-theme-border-light dark:border-theme-border-dark pt-4 sm:pt-6">
          <legend className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
            Rate Specific Aspects
          </legend>
          <div className="space-y-4">
            <RatingStars
              value={qualityRating}
              hover={hoverQuality}
              onValueChange={setQualityRating}
              onHoverChange={setHoverQuality}
              label="Quality"
              id="quality-rating"
            />
            <RatingStars
              value={durabilityRating}
              hover={hoverDurability}
              onValueChange={setDurabilityRating}
              onHoverChange={setHoverDurability}
              label="Durability"
              id="durability-rating"
            />
            <RatingStars
              value={matchesRating}
              hover={hoverMatches}
              onValueChange={setMatchesRating}
              onHoverChange={setHoverMatches}
              label="Matches Description/Images"
              id="matches-rating"
            />
          </div>
        </fieldset>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Review Title *
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="What's most important to know?"
            className="w-full px-3 sm:px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-sm sm:text-base"
            required
            aria-describedby="title-char-count"
          />
          <p id="title-char-count" className="mt-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark" aria-live="polite">
            {title.length}/200 characters
          </p>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Your Review *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={2000}
            rows={6}
            placeholder="Share your experience with this product..."
            className="w-full px-3 sm:px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary resize-none text-sm sm:text-base"
            required
            aria-describedby="comment-char-count"
          />
          <p id="comment-char-count" className="mt-1 text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark" aria-live="polite">
            {comment.length}/2000 characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Add Photos (Optional)
          </label>
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-3">
            Upload up to 5 images to help others see your experience
          </p>

          {images.length < 5 && (
            <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer hover:border-theme-primary transition-colors min-h-[44px]">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                aria-label="Upload review image"
              />
              {uploadingImage ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-primary" aria-hidden="true"></div>
                  <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Uploading...
                  </span>
                </div>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" aria-hidden="true" />
                  <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Upload Image
                  </span>
                </>
              )}
            </label>
          )}

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Review image ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3"/>
                  </button>
                  <label htmlFor={`image-caption-${index}`} className="sr-only">
                    Caption for image {index + 1}
                  </label>
                  <input
                    id={`image-caption-${index}`}
                    type="text"
                    value={image.caption || ""}
                    onChange={(e) => updateImageCaption(index, e.target.value)}
                    placeholder="Add caption (optional)"
                    maxLength={200}
                    className="w-full px-2 py-1 text-xs border-t border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Add Videos (Optional)
          </label>
          <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-3">
            Upload up to 2 videos (max 20 seconds, 30MB each)
          </p>

          {videos.length < 2 && (
            <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer hover:border-theme-primary transition-colors min-h-[44px]">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                className="hidden"
                aria-label="Upload review video"
              />
              {uploadingVideo ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-primary" aria-hidden="true"></div>
                  <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Uploading & Compressing...
                  </span>
                </div>
              ) : (
                <>
                  <VideoIcon className="h-5 w-5 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" aria-hidden="true" />
                  <span className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    Upload Video
                  </span>
                </>
              )}
            </label>
          )}

          {videos.length > 0 && (
            <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="relative border border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden"
                >
                  <div className="relative h-32 bg-black">
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.caption || `Video ${index + 1} thumbnail`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-10 w-10 text-white opacity-80" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove video ${index + 1}`}
                  >
                    <Trash2 className="h-3 w-3"/>
                  </button>
                  <label htmlFor={`video-caption-${index}`} className="sr-only">
                    Caption for video {index + 1}
                  </label>
                  <input
                    id={`video-caption-${index}`}
                    type="text"
                    value={video.caption || ""}
                    onChange={(e) => updateVideoCaption(index, e.target.value)}
                    placeholder="Add caption (optional)"
                    maxLength={200}
                    className="w-full px-2 py-1 text-xs border-t border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submission Note */}
        {!isEdit && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg" role="status">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your review will be published after admin approval. This helps us
              maintain quality standards.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base min-h-[44px]"
            aria-label={submitting ? "Submitting review" : (isEdit ? "Update review" : "Submit review")}
          >
            {submitting
              ? "Submitting..."
              : isEdit
              ? "Update Review"
              : "Submit Review"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors text-sm sm:text-base min-h-[44px]"
            aria-label="Cancel review submission"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}