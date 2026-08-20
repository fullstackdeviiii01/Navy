// app/(admin)/components/products/form/ProductFormVideos.tsx
"use client";

import { useState } from "react";
import { FaUpload, FaTrash, FaVideo, FaSpinner } from "react-icons/fa";

interface ProductFormVideosProps {
  videos: any[];
  newVideos: File[];
  onVideoSelect: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION = 30; // 30 seconds
const ALLOWED_FORMATS = ["video/mp4", "video/webm", "video/quicktime"];

export default function ProductFormVideos({
  videos,
  newVideos,
  onVideoSelect,
  onRemoveExisting,
  onRemoveNew,
}: ProductFormVideosProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateVideo = async (file: File): Promise<string | null> => {
    // Check file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return `${file.name}: Invalid format. Only MP4, WebM, and MOV are allowed.`;
    }

    // Check file size
    if (file.size > MAX_VIDEO_SIZE) {
      return `${file.name}: File too large. Maximum size is 50MB.`;
    }

    // Check duration
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          resolve(
            `${file.name}: Video too long. Maximum duration is ${MAX_VIDEO_DURATION} seconds.`
          );
        } else {
          resolve(null);
        }
      };

      video.onerror = () => {
        resolve(`${file.name}: Failed to load video metadata.`);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of filesArray) {
        const error = await validateVideo(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      setValidationErrors(errors);

      if (validFiles.length > 0) {
        onVideoSelect(validFiles);
      }

      // Clear validation errors after 5 seconds
      if (errors.length > 0) {
        setTimeout(() => setValidationErrors([]), 5000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
          Product Videos
        </h4>
        <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Max: 50MB | 30s | MP4/WebM/MOV
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Video Validation Errors:
          </p>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing Videos */}
        {videos.map((video, index) => (
          <div key={`existing-${index}`} className="relative group">
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <FaVideo className="text-white text-2xl" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveExisting(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
              title="Remove video"
            >
              <FaTrash size={12} />
            </button>
            {video.is_primary && (
              <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
                Primary
              </span>
            )}
          </div>
        ))}

        {/* New Videos (Pending Upload) */}
        {newVideos.map((file, index) => (
          <div key={`new-${index}`} className="relative group">
            <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark">
              <video
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover"
                muted
                loop
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <FaVideo className="text-white text-2xl" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveNew(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
              title="Remove video"
            >
              <FaTrash size={12} />
            </button>
            <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow">
              New
            </span>
            <span className="absolute top-2 left-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded shadow">
              {(file.size / (1024 * 1024)).toFixed(1)}MB
            </span>
          </div>
        ))}

        {/* Upload Button */}
        <label className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer hover:border-theme-primary hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-all">
          <FaUpload className="text-3xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2" />
          <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark font-medium">
            Upload Videos
          </span>
          <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
            MP4, WebM, MOV
          </span>
          <input
            type="file"
            multiple
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Video Guidelines:</strong> Videos will be compressed during upload
          to ensure optimal performance. Recommended: 720p-1080p, 16:9 or 1:1 aspect
          ratio, H.264 codec.
        </p>
      </div>
    </div>
  );
}