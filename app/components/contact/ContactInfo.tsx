"use client";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";

interface ContactInfoProps {
  settings: any;
}

export default function ContactInfo({ settings }: ContactInfoProps) {
  if (!settings) return null;

  // Get today's working hours
  const getTodayHours = () => {
    if (!settings.working_hours) return null;
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    const todayHours = settings.working_hours[today];
    if (!todayHours) return null;
    return todayHours.is_open
      ? `${todayHours.open} - ${todayHours.close}`
      : "Closed";
  };

  const todayHours = getTodayHours();

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-6">
        <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
          Contact Information
        </h3>

        <div className="space-y-4">
          {settings.company_email && (
            <div className="flex items-start gap-3">
              <FaEnvelope className="text-blue-600 mt-1 flex-shrink-0" aria-hidden="true"/>
              <div>
                <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Email
                </p>
                <a
                  href={`mailto:${settings.company_email}`}
                  aria-label={`Send email to ${settings.company_email}`}
                  className="text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                >
                  {settings.company_email}
                </a>
              </div>
            </div>
          )}

          {settings.company_phone && (
            <div className="flex items-start gap-3">
              <FaPhone className="text-blue-600 mt-1 flex-shrink-0" aria-hidden="true"/>
              <div>
                <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Phone
                </p>
                <a
                  href={`tel:${settings.company_phone}`}
                  aria-label={`Call ${settings.company_phone}`}
                  className="text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {settings.company_phone}
                </a>
              </div>
            </div>
          )}

          {settings.company_address && (
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-blue-600 mt-1 flex-shrink-0" aria-hidden="true"/>
              <div>
                <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Address
                </p>
                {settings.company_location_link ? (
                  <a
                    href={settings.company_location_link}
                    aria-label={`View ${settings.company_address} on map`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-text-primary-light dark:text-theme-text-primary-dark hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {settings.company_address}
                  </a>
                ) : (
                  <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {settings.company_address}
                  </p>
                )}
              </div>
            </div>
          )}

          {todayHours && (
            <div className="flex items-start gap-3">
              <FaClock className="text-blue-600 mt-1 flex-shrink-0" aria-hidden="true"/>
              <div>
                <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Today's Hours
                </p>
                <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {todayHours}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {settings.company_location_link &&
        settings.company_location_link.includes("maps") && (
          <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark overflow-hidden">
            <iframe
              src={settings.company_location_link}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map showing location of ${settings.company_address || 'our office'}`}
            ></iframe>
          </div>
        )}
    </div>
  );
}
