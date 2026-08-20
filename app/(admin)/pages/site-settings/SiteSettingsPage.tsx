"use client";

import { useState } from "react";
import { FaHome, FaFileAlt, FaCog, FaDollarSign, FaBuilding } from "react-icons/fa";
import SiteSettingsHeader from "../../components/site-settings/SiteSettingsHeader";
import SiteSettingsTabs from "../../components/site-settings/SiteSettingsTabs";
import HomePageSettings from "../../components/site-settings/HomePageSettings";
import StaticPagesSettings from "../../components/site-settings/StaticPagesSettings";
import DynamicPagesSettings from "../../components/site-settings/DynamicPagesSettings";
import CurrencySettings from "../../components/site-settings/CurrencySettings";
import CompanyInfoSettings from "../../components/site-settings/CompanyInfoSettings";

type TabType = 'home' | 'static' | 'dynamic' | 'currency' | 'company';

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const tabs = [
    {
      id: 'home',
      label: 'Home Page',
      icon: FaHome,
      description: 'Manage home page components and meta data'
    },
    {
      id: 'static',
      label: 'Static Pages',
      icon: FaCog,
      description: 'Configure visibility and meta data for static pages'
    },
    {
      id: 'dynamic',
      label: 'Dynamic Pages',
      icon: FaFileAlt,
      description: 'Create and manage custom content pages'
    },
    // {
    //   id: 'currency',
    //   label: 'Currency',
    //   icon: FaDollarSign,
    //   description: 'Configure currency conversion and exchange rates'
    // },
    {
      id: 'company',
      label: 'Company Info',
      icon: FaBuilding,
      description: 'Manage company information, contact details, and social media links'
    }
  ];

  return (
    <div className="space-y-6">
      <SiteSettingsHeader />

      <SiteSettingsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      {/* Tab Content */}
      <div className="p-6 bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark">
        {activeTab === 'home' && <HomePageSettings />}
        {activeTab === 'static' && <StaticPagesSettings />}
        {activeTab === 'dynamic' && <DynamicPagesSettings />}
        {/* {activeTab === 'currency' && <CurrencySettings />} */}
        {activeTab === 'company' && <CompanyInfoSettings />}
      </div>
    </div>
  );
}