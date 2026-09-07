// lib/utils/googleMaps.ts

/**
 * Resolves a Google Maps embed URL from an admin-configured location link or address.
 * Supports:
 * - Full <iframe> HTML snippets pasted by admin
 * - Google Maps embed URLs (/maps/embed)
 * - Standard query links (?q=...)
 * - Place links (/maps/place/...)
 * - Fallback query using company address
 */
export function getGoogleMapsEmbedUrl(
  locationLink?: string,
  fallbackAddress?: string
): string {
  const raw = (locationLink || "").trim();

  // 1. If admin pasted an iframe snippet (e.g. <iframe src="https://www.google.com/maps/embed?..." ...></iframe>)
  if (raw.includes("<iframe") && raw.includes("src=")) {
    const match = raw.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  // 2. If it's already an embed URL
  if (raw.includes("/maps/embed") || raw.includes("output=embed")) {
    return raw;
  }

  // 3. If it contains query param q= (e.g. https://maps.google.com/?q=...)
  if (raw.includes("q=")) {
    try {
      const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
      const q = url.searchParams.get("q");
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    } catch {
      // ignore URL parsing error and continue
    }
  }

  // 4. If it's a place link e.g. https://www.google.com/maps/place/Location+Name/...
  if (raw.includes("/maps/place/")) {
    const afterPlace = raw.split("/maps/place/")[1];
    const placeSegment = afterPlace ? afterPlace.split("/")[0] : "";
    if (placeSegment) {
      const place = decodeURIComponent(placeSegment.replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 5. Shortlink (maps.app.goo.gl or goo.gl/maps) cannot be embedded directly in an iframe
  // due to Google X-Frame-Options: SAMEORIGIN blocking redirects.
  // We use the address for the embed iframe view, while the external button links to the exact shortlink.
  const query =
    !raw.includes("goo.gl") && raw.length > 0 && !raw.startsWith("http")
      ? raw
      : fallbackAddress || "Sahiwal, Punjab, Pakistan";

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
