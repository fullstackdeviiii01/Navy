// EmailConfigurationTabs.tsx

interface Tab {
  id: string;
  label: string;
  icon: any;
}

interface EmailConfigurationTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function EmailConfigurationTabs({ tabs, activeTab, onTabChange }: EmailConfigurationTabsProps) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-theme-border-light dark:border-theme-border-dark overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            aria-label="Email configuration buttons"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark"
            }`}
          >
            <Icon className="text-xs sm:text-sm flex-shrink-0" />
            <span className="text-xs sm:text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}