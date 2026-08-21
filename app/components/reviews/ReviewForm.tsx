// app/components/reviews/ReviewForm.tsx
"use client";

import { useState } from "react";
import { Star, Upload, Trash2, Image as ImageIcon, Video as VideoIcon, Loader2 } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSubmit: (data: {
    rating: number;
    title: string;
    comment: string;
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    rating: number;
    title: string;
    comment: string;
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; thumbnail?: string; caption?: string }>;
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
      setError("Maximum 5 photos allowed");
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
        throw new Error(errorData.error || "Failed to upload photo");
      }

      const data = await response.json();
      setImages([...images, { url: data.url, caption: "" }]);
    } catch (error: any) {
      setError(error.message || "Failed to upload photo");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a review title");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your review thoughts");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images,
        videos,
      });
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-8">
      <div className="border-b border-theme-border-light dark:border-theme-border-dark pb-4 mb-6">
        <h3 className="text-xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {isEdit ? "Edit Your Review" : "Write a Customer Review"}
        </h3>
        <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
          Share your experience with fellow patrons
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating || rating)
                      ? "fill-amber-500 text-amber-500"
                      : "text-theme-border-light dark:text-theme-border-dark"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs uppercase tracking-wider text-theme-hover-light dark:text-theme-hover-dark font-medium ml-2">
                {rating === 5 ? "Exceptional" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : rating === 2 ? "Below Expectations" : "Disappointing"}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Review Title / Headline *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stunning craftsmanship, fits perfectly in our living room"
            maxLength={100}
            className="w-full px-4 py-3 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light"
            required
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-xs uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Tell us about the wood grain, lighting ambiance, finish quality, and packaging..."
            maxLength={2000}
            className="w-full p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light resize-none"
            required
          />
        </div>

        {/* Media Attachments */}
        <div className="space-y-4 pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
          <div>
            <span className="block text-xs uppercase tracking-[0.18em] font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Attach Photos & Videos (Optional)
            </span>
            
            <div className="flex flex-wrap gap-4">
              {/* Photo Upload Trigger */}
              {images.length < 5 && (
                <label className="cursor-pointer border border-dashed border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light p-4 flex flex-col items-center justify-center gap-1.5 w-32 h-28 text-center bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-theme-hover-light" />
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-theme-text-muted-light" />
                      <span className="text-[10px] uppercase tracking-wider text-theme-text-secondary-light">
                        Add Photo
                      </span>
                    </>
                  )}
                </label>
              )}

              {/* Video Upload Trigger */}
              {videos.length < 2 && (
                <label className="cursor-pointer border border-dashed border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light p-4 flex flex-col items-center justify-center gap-1.5 w-32 h-28 text-center bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                  />
                  {uploadingVideo ? (
                    <Loader2 className="w-5 h-5 animate-spin text-theme-hover-light" />
                  ) : (
                    <>
                      <VideoIcon className="w-5 h-5 text-theme-text-muted-light" />
                      <span className="text-[10px] uppercase tracking-wider text-theme-text-secondary-light">
                        Add Video
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Uploaded Images Preview */}
          {images.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light mb-2">
                Attached Photos ({images.length}/5)
              </p>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 border border-theme-border-light dark:border-theme-border-dark group overflow-hidden">
                    <img src={img.url} alt="Attached review photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Videos Preview */}
          {videos.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light mb-2">
                Attached Videos ({videos.length}/2)
              </p>
              <div className="flex flex-wrap gap-3">
                {videos.map((vid, idx) => (
                  <div key={idx} className="relative w-28 h-20 border border-theme-border-light dark:border-theme-border-dark group overflow-hidden bg-black flex items-center justify-center">
                    <video src={vid.url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit / Cancel Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-4 px-6 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? "SUBMITTING REVIEW..." : isEdit ? "UPDATE REVIEW" : "SUBMIT REVIEW"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="py-4 px-6 border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:border-theme-hover-light text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}