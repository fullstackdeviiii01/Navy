// lib/constants/couriers.ts

export interface CourierOption {
  id: string;
  name: string;
  websiteUrl?: string;
}

export const PAKISTAN_COURIERS: CourierOption[] = [
  {
    id: "tcs",
    name: "TCS Express",
    websiteUrl: "https://www.tcsexpress.com/",
  },
  {
    id: "leopards",
    name: "Leopards Courier",
    websiteUrl: "https://www.leopardscourier.com/",
  },
  {
    id: "mnp",
    name: "M&P Express Logistics",
    websiteUrl: "https://www.mulphilog.com/",
  },
  {
    id: "trax",
    name: "Trax Logistics",
    websiteUrl: "https://trax.pk/",
  },
  {
    id: "callcourier",
    name: "Call Courier",
    websiteUrl: "https://callcourier.com.pk/",
  },
  {
    id: "postex",
    name: "PostEx",
    websiteUrl: "https://postex.pk/",
  },
  {
    id: "pakpost",
    name: "Pakistan Post",
    websiteUrl: "https://ep.gov.pk/",
  },
  {
    id: "rider",
    name: "Rider",
    websiteUrl: "https://withrider.com/",
  },
  {
    id: "daewoo",
    name: "Daewoo FastEx",
    websiteUrl: "http://fastex.daewoo.com.pk/",
  },
  {
    id: "blueex",
    name: "BlueEx",
    websiteUrl: "https://www.blue-ex.com/",
  },
  {
    id: "swyft",
    name: "Swyft Logistics",
    websiteUrl: "https://swyftlogistics.com/",
  },
  {
    id: "other",
    name: "Other Courier",
  },
];

export function getCourierWebsiteUrl(carrierName?: string): string | null {
  if (!carrierName) return null;

  const normalized = carrierName.toLowerCase();
  const courier = PAKISTAN_COURIERS.find(
    (c) =>
      normalized.includes(c.id) ||
      normalized.includes(c.name.toLowerCase()) ||
      c.name.toLowerCase().includes(normalized)
  );

  return courier?.websiteUrl || null;
}

// Backward compatibility helper
export const getCourierTrackingUrl = (carrierName?: string, _trackingNumber?: string) =>
  getCourierWebsiteUrl(carrierName);
