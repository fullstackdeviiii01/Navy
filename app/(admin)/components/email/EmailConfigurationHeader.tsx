// EmailConfigurationHeader.tsx
"use client";

import { FaServer, FaEnvelope, FaCog } from "react-icons/fa";

interface EmailConfigurationHeaderProps {
  title: string;
  description: string;
}

export default function EmailConfigurationHeader({ title, description }: EmailConfigurationHeaderProps) {
  return (
    <div className="space-y-1 sm:space-y-2">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        {description}
      </p>
    </div>
  );
}