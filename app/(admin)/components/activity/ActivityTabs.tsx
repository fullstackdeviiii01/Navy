// components/activity/ActivityTabs.tsx
"use client"

interface ActivityTabsProps {
  activeTab: "logins" | "activities"
  onTabChange: (tab: "logins" | "activities") => void
  loginCount: number
  activityCount: number
}

export default function ActivityTabs({
  activeTab,
  onTabChange,
  loginCount,
  activityCount,
}: ActivityTabsProps) {
  return (
    <div className="border-b border-theme-border-light dark:border-theme-border-dark overflow-x-auto">
      <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
        <button
          onClick={() => onTabChange("logins")}
          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "logins"
              ? "border-theme-primary text-theme-primary dark:text-theme-primary"
              : "border-transparent text-theme-text-muted-light hover:text-theme-hover-light hover:border-theme-border-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-secondary-dark"
          }`}
          aria-current={activeTab === "logins" ? "true" : undefined}
        >
          Login Activity ({loginCount})
        </button>
        <button
          onClick={() => onTabChange("activities")}
          className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
            activeTab === "activities"
              ? "border-theme-primary text-theme-primary dark:text-theme-primary"
              : "border-transparent text-theme-text-muted-light hover:text-theme-hover-light hover:border-theme-border-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-secondary-dark"
          }`}
          aria-current={activeTab === "activities" ? "true" : undefined}
        >
          User Activities ({activityCount})
        </button>
      </nav>
    </div>
  )
}