"use client";

import { useState, useRef } from "react";
import { FaHammer, FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import { useUser } from "../../context/UserContext";

type BuildStatus = "idle" | "loading" | "done" | "error";

export default function BuildTriggerButton() {
  const [status, setStatus] = useState<BuildStatus>("idle");
  const { firebaseUser } = useUser();
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      console.log("[BuildButton] Polling stopped.");
    }
  };

  const startPolling = () => {
    stopPolling();
    console.log("[BuildButton] Starting polling every 5 seconds...");

    pollRef.current = setInterval(async () => {
      console.log("[BuildButton] Polling /api/build/status...");

      try {
        const res = await fetch("/api/build/status");
        const data = await res.json();

        console.log("[BuildButton] Poll response:", data);

        if (data.status === "done") {
          console.log("[BuildButton] Build is done!");
          stopPolling();
          setStatus("done");
          setTimeout(() => setStatus("idle"), 4000);

        } else if (data.status === "failed") {
          console.error("[BuildButton] Build failed according to status file.");
          stopPolling();
          setStatus("error");
          setTimeout(() => setStatus("idle"), 4000);

        } else {
          console.log("[BuildButton] Build still in progress, status:", data.status);
        }

      } catch (err: any) {
        console.warn("[BuildButton] Network error during polling (retrying):", err.message);
      }
    }, 5000);
  };

  const handleBuild = async () => {
    if (!confirm("Trigger a production build? This takes 2-3 minutes.")) return;

    console.log("[BuildButton] Build triggered by user.");
    setStatus("loading");

    try {
      console.log("[BuildButton] Getting Firebase ID token...");
      const token = await firebaseUser?.getIdToken();

      if (!token) {
        console.error("[BuildButton] No Firebase token available. Is user logged in?");
        throw new Error("Not authenticated");
      }

      console.log("[BuildButton] Sending POST to /api/build/trigger...");

      const res = await fetch("/api/build/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("[BuildButton] Trigger response:", res.status, data);

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      console.log("[BuildButton] Build started successfully. Starting poll...");
      startPolling();

    } catch (err: any) {
      console.error("[BuildButton] Error triggering build:", err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const buttonStyles: Record<BuildStatus, string> = {
    idle: "bg-orange-600 hover:bg-orange-700 text-white",
    loading: "bg-orange-600 text-white opacity-80 cursor-not-allowed",
    done: "bg-green-600 text-white cursor-default",
    error: "bg-red-600 text-white cursor-default",
  };

  const buttonLabel: Record<BuildStatus, string> = {
    idle: "Rebuild Site",
    loading: "Building...",
    done: "Build Done",
    error: "Build Failed",
  };

  const ButtonIcon = () => {
    if (status === "loading") return <FaSpinner className="animate-spin" />;
    if (status === "done") return <FaCheck />;
    if (status === "error") return <FaTimes />;
    return <FaHammer />;
  };

  return (
    <button
      onClick={status === "idle" ? handleBuild : undefined}
      disabled={status === "loading"}
      className={`flex items-center gap-2 px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${buttonStyles[status]}`}
    >
      <ButtonIcon />
      {buttonLabel[status]}
    </button>
  );
}