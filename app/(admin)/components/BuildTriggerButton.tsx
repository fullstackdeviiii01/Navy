"use client";

import { useState, useRef } from "react";
import { FaHammer, FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import { useUser } from "../../context/UserContext";

type BuildStatus = "idle" | "loading" | "done" | "error";

export default function BuildTriggerButton() {
  const [status, setStatus] = useState<BuildStatus>("idle");
  const { authUser } = useUser();
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();

    pollRef.current = setInterval(async () => {

      try {
        const res = await fetch("/api/build/status");
        const data = await res.json();


        if (data.status === "done") {
          stopPolling();
          setStatus("done");
          setTimeout(() => setStatus("idle"), 4000);

        } else if (data.status === "failed") {
          console.error("[BuildButton] Build failed according to status file.");
          stopPolling();
          setStatus("error");
          setTimeout(() => setStatus("idle"), 4000);

        } else {
        }

      } catch (err: any) {
        console.warn("[BuildButton] Network error during polling (retrying):", err.message);
      }
    }, 5000);
  };

  const handleBuild = async () => {
    if (!confirm("Trigger a production build? This takes 2-3 minutes.")) return;

    setStatus("loading");

    try {
      const token = await authUser?.getIdToken();

      if (!token) {
        console.error("[BuildButton] No auth token available. Is user logged in?");
        throw new Error("Not authenticated");
      }


      const res = await fetch("/api/build/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      startPolling();

    } catch (err: any) {
      console.error("[BuildButton] Error triggering build:", err.message);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const buttonStyles: Record<BuildStatus, string> = {
    idle: "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-xs",
    loading: "bg-neutral-900/80 dark:bg-neutral-100/80 text-white dark:text-neutral-900 cursor-not-allowed",
    done: "bg-emerald-600 text-white cursor-default",
    error: "bg-rose-600 text-white cursor-default",
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