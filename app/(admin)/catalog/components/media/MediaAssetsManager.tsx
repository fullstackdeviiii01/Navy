// app/(admin)/catalog/components/media/MediaAssetsManager.tsx
"use client";

import { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaVideo, FaImage, FaStar, FaPlay } from "react-icons/fa";

interface MediaAssetsManagerProps {
  images: any[];
  newImages: File[];
  onImageSelect: (files: File[]) => void;
  onRemoveExistingImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onSetPrimaryImage?: (index: number) => void;
  videos: any[];
  newVideos: File[];
  onVideoSelect: (files: File[]) => void;
  onRemoveExistingVideo: (index: number) => void;
  onRemoveNewVideo: (index: number) => void;
  colorItems?: any[];
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION = 30; // 30s
const ALLOWED_VIDEO_FORMATS = ["video/mp4", "video/webm", "video/quicktime"];

function NewImagePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return null;

  return (
    <div className="relative group rounded-xl overflow-hidden border border-theme-hover-light bg-black/5 aspect-square">
      <img
        src={url}
        alt={file.name || "New photo upload"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          type="button"
          onClick={onRemove}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow"
          title="Remove photo"
        >
          <FaTrash size={12} />
        </button>
      </div>
      <span className="absolute bottom-2 left-2 bg-theme-hover-light text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-xs">
        New Photo ({(file.size / (1024 * 1024)).toFixed(1)}MB)
      </span>
    </div>
  );
}

function NewVideoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return null;

  return (
    <div className="relative group rounded-xl overflow-hidden border border-purple-500/80 bg-black/10 aspect-square">
      <video
        src={url}
        className="w-full h-full object-cover"
        muted
        loop
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:opacity-0 transition-opacity">
        <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
          <FaPlay className="ml-0.5" size={12} />
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
        title="Remove video"
      >
        <FaTrash size={11} />
      </button>
      <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
        <FaVideo size={9} /> Video
      </span>
      <span className="absolute bottom-2 left-2 bg-theme-hover-light text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-xs">
        New ({(file.size / (1024 * 1024)).toFixed(1)}MB)
      </span>
    </div>
  );
}

export default function MediaAssetsManager({
  images,
  newImages,
  onImageSelect,
  onRemoveExistingImage,
  onRemoveNewImage,
  onSetPrimaryImage,
  videos,
  newVideos,
  onVideoSelect,
  onRemoveExistingVideo,
  onRemoveNewVideo,
  colorItems = [],
}: MediaAssetsManagerProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateVideo = async (file: File): Promise<string | null> => {
    if (!ALLOWED_VIDEO_FORMATS.includes(file.type)) {
      return `${file.name}: Invalid format. Only MP4, WebM, and MOV are allowed.`;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return `${file.name}: File too large. Maximum size is 50MB.`;
    }
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          resolve(`${file.name}: Video too long. Maximum duration is ${MAX_VIDEO_DURATION} seconds.`);
        } else {
          resolve(null);
        }
      };
      video.onerror = () => resolve(`${file.name}: Failed to load video metadata.`);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleMediaFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const photoFiles: File[] = [];
    const videoFilesToValidate: File[] = [];

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        photoFiles.push(file);
      } else if (file.type.startsWith("video/") || ALLOWED_VIDEO_FORMATS.includes(file.type)) {
        videoFilesToValidate.push(file);
      }
    }

    if (photoFiles.length > 0) {
      onImageSelect(photoFiles);
    }

    if (videoFilesToValidate.length > 0) {
      const errors: string[] = [];
      const validVideos: File[] = [];
      for (const vFile of videoFilesToValidate) {
        const err = await validateVideo(vFile);
        if (err) errors.push(err);
        else validVideos.push(vFile);
      }
      if (errors.length > 0) {
        setValidationErrors(errors);
        setTimeout(() => setValidationErrors([]), 6000);
      }
      if (validVideos.length > 0) {
        onVideoSelect(validVideos);
      }
    }

    e.target.value = "";
  };

  const colorPhotosCount = colorItems.reduce((acc, c) => {
    return acc + (c.existingImages?.length || 0) + (c.newFiles?.length || 0);
  }, 0);

  const colorVideosCount = colorItems.reduce((acc, c) => {
    return acc + (c.existingVideos?.length || 0) + (c.newVideoFiles?.length || 0);
  }, 0);

  const totalGeneralMedia = images.length + newImages.length + videos.length + newVideos.length;
  const totalAllMedia = totalGeneralMedia + colorPhotosCount + colorVideosCount;

  return (
    <div className="space-y-5">
      {/* Header with KPI Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme-border-light/80 dark:border-theme-border-dark/80 pb-3">
        <div>
          <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center gap-2">
            <span>Visual Media Assets (Photos & Videos)</span>
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            High-res general catalog photography and cinematic showreel clips (JPG, PNG, WebP, MP4, MOV).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-theme-text-muted-light bg-theme-bg-light dark:bg-theme-bg-dark px-2.5 py-1 rounded-lg border border-theme-border-light dark:border-theme-border-dark">
            {images.length + newImages.length} Photos • {videos.length + newVideos.length} Videos
            {(colorPhotosCount > 0 || colorVideosCount > 0) && ` • ${colorPhotosCount + colorVideosCount} Color Media`}
            {` (${totalAllMedia} Total)`}
          </span>
        </div>
      </div>

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-1">
          <p className="text-xs font-semibold text-red-800 dark:text-red-300">Media Upload Notice:</p>
          <ul className="text-xs text-red-700 dark:text-red-400 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Attached Color Finishes Notice Banner */}
      {(colorPhotosCount > 0 || colorVideosCount > 0) && (
        <div className="p-3.5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse shrink-0" />
            <div>
              <p className="text-xs font-semibold text-purple-950 dark:text-purple-200">
                {colorPhotosCount} Finish Photo{colorPhotosCount === 1 ? "" : "s"}
                {colorVideosCount > 0 && ` & ${colorVideosCount} Finish Video${colorVideosCount === 1 ? "" : "s"}`} attached in Color Section below
              </p>
              <p className="text-[11px] text-purple-800/80 dark:text-purple-300/70">
                These are linked to specific finishes and seamlessly integrated into the customer storefront carousel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {colorItems
              .filter(
                (c) =>
                  (c.existingImages?.length || 0) +
                    (c.newFiles?.length || 0) +
                    (c.existingVideos?.length || 0) +
                    (c.newVideoFiles?.length || 0) >
                  0
              )
              .map((c, i) => {
                const pCount = (c.existingImages?.length || 0) + (c.newFiles?.length || 0);
                const vCount = (c.existingVideos?.length || 0) + (c.newVideoFiles?.length || 0);
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-black/50 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 shadow-2xs"
                  >
                    <span>
                      {c.name}: {pCount} photo{pCount === 1 ? "" : "s"}
                      {vCount > 0 ? `, ${vCount} video${vCount === 1 ? "" : "s"}` : ""}
                    </span>
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Unified Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {/* Existing Images */}
        {images.map((img, index) => (
          <div
            key={`existing-img-${index}`}
            className="relative group rounded-xl overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 aspect-square"
          >
            <img
              src={img.url}
              alt={img.alt_text || "Product photo"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              {onSetPrimaryImage && !img.is_primary && (
                <button
                  type="button"
                  onClick={() => onSetPrimaryImage(index)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow"
                  title="Make Primary"
                >
                  <FaStar size={11} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemoveExistingImage(index)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow"
                title="Delete Photo"
              >
                <FaTrash size={11} />
              </button>
            </div>
            {img.is_primary && (
              <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                <FaStar size={8} /> Primary
              </span>
            )}
          </div>
        ))}

        {/* New Image Uploads */}
        {newImages.map((file, index) => (
          <NewImagePreview
            key={`new-img-${index}-${file.name}-${file.lastModified}`}
            file={file}
            onRemove={() => onRemoveNewImage(index)}
          />
        ))}

        {/* Existing Videos */}
        {videos.map((video, index) => (
          <div
            key={`existing-video-${index}`}
            className="relative group rounded-xl overflow-hidden border border-purple-500/80 bg-black/10 aspect-square"
          >
            <video
              src={video.url}
              className="w-full h-full object-cover"
              muted
              loop
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none group-hover:opacity-0 transition-opacity">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white">
                <FaPlay className="ml-0.5" size={12} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveExistingVideo(index)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
              title="Delete Video"
            >
              <FaTrash size={11} />
            </button>
            <span className="absolute top-2 left-2 bg-purple-600 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
              <FaVideo size={9} /> Showreel
            </span>
          </div>
        ))}

        {/* New Video Uploads */}
        {newVideos.map((file, index) => (
          <NewVideoPreview
            key={`new-video-${index}-${file.name}-${file.lastModified}`}
            file={file}
            onRemove={() => onRemoveNewVideo(index)}
          />
        ))}

        {/* Unified Upload Trigger Tile */}
        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl cursor-pointer hover:border-theme-hover-light dark:hover:border-theme-hover-dark hover:bg-theme-hover-light/5 transition-all text-theme-text-muted-light hover:text-theme-hover-light group p-2 text-center">
          <div className="flex items-center gap-1.5 mb-1.5 text-lg group-hover:-translate-y-0.5 transition-transform text-theme-hover-light">
            <FaImage size={15} />
            <span>+</span>
            <FaVideo size={15} />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Add Media
          </span>
          <span className="text-[9px] text-theme-text-muted-light mt-0.5 font-mono">
            Photos or Videos
          </span>
          <input
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            onChange={handleMediaFilesChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
