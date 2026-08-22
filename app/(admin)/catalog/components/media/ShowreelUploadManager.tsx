// app/(admin)/catalog/components/media/ShowreelUploadManager.tsx
"use client";

import { useState, useEffect } from "react";
import { FaUpload, FaTrash, FaVideo } from "react-icons/fa";

interface ShowreelUploadManagerProps {
  videos: any[];
  newVideos: File[];
  onVideoSelect: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_DURATION = 30;
const ALLOWED_FORMATS = ["video/mp4", "video/webm", "video/quicktime"];

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
    <div className="relative group rounded-xl overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 aspect-video">
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
        <FaVideo className="text-white text-xl" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
        title="Remove video"
      >
        <FaTrash size={11} />
      </button>
      <span className="absolute bottom-2 left-2 bg-theme-hover-light text-white text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-xs">
        New ({(file.size / (1024 * 1024)).toFixed(1)}MB)
      </span>
    </div>
  );
}

export default function ShowreelUploadManager({
  videos,
  newVideos,
  onVideoSelect,
  onRemoveExisting,
  onRemoveNew,
}: ShowreelUploadManagerProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateVideo = async (file: File): Promise<string | null> => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const errors: string[] = [];
      const validFiles: File[] = [];
      for (const file of filesArray) {
        const error = await validateVideo(file);
        if (error) errors.push(error);
        else validFiles.push(file);
      }
      setValidationErrors(errors);
      if (validFiles.length > 0) onVideoSelect(validFiles);
      if (errors.length > 0) setTimeout(() => setValidationErrors([]), 5000);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Product Videos & Showreels
          </h4>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Short cinematic clips showing illumination and textures (Max 50MB, &lt;30s).
          </p>
        </div>
        <span className="text-xs font-mono text-theme-text-muted-light">
          {videos.length + newVideos.length} Videos
        </span>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-xs font-medium text-red-800 dark:text-red-200 mb-1">Video Validation Errors:</p>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-0.5">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {/* Existing Videos */}
        {videos.map((video, index) => (
          <div
            key={`existing-${index}`}
            className="relative group rounded-xl overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 aspect-video"
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
              <FaVideo className="text-white text-xl" />
            </div>
            <button
              type="button"
              onClick={() => onRemoveExisting(index)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"
              title="Delete video"
            >
              <FaTrash size={11} />
            </button>
          </div>
        ))}

        {/* New Upload Previews */}
        {newVideos.map((file, index) => (
          <NewVideoPreview
            key={`new-video-${index}-${file.name}-${file.lastModified}`}
            file={file}
            onRemove={() => onRemoveNew(index)}
          />
        ))}

        {/* Upload Box */}
        <label className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl cursor-pointer hover:border-theme-hover-light dark:hover:border-theme-hover-dark hover:bg-theme-hover-light/5 transition-all text-theme-text-muted-light hover:text-theme-hover-light group">
          <FaUpload className="text-xl mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-[11px] uppercase tracking-wider font-semibold">
            Upload Video
          </span>
          <span className="text-[9px] text-theme-text-muted-light mt-0.5 font-mono">
            MP4, WebM, MOV (&lt;30s)
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
    </div>
  );
}
