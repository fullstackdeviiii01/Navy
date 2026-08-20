// app/(admin)/components/site-settings/SiteSettingsTabs.tsx
interface Tab {
  id: string;
  label: string;
  icon: any;
  description: string;
}

interface SiteSettingsTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function SiteSettingsTabs({
  tabs,
  activeTab,
  onTabChange,
}: SiteSettingsTabsProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark">
      <div className="border-b border-theme-border-light dark:border-theme-border-dark overflow-x-auto">
        <nav 
          className="flex space-x-1 sm:space-x-2 p-1 sm:p-2 min-w-max"
          role="tablist"
          aria-label="Site settings sections"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap relative after:absolute after:inset-[-4px] after:content-[''] ${
                  activeTab === tab.id
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark'
                }`}
              >
                <Icon size={14} className="sm:w-4 sm:h-4"/>
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-theme-border-light dark:border-theme-border-dark">
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
          {tabs.find(t => t.id === activeTab)?.description}
        </p>
      </div>
    </div>
  );
}