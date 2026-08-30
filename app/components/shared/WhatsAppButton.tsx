// app/components/shared/WhatsAppButton.tsx
"use client";

import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  phoneNumber?: string;
}

export default function WhatsAppButton({
  phoneNumber = "923009692765",
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <aside
      aria-label="Direct WhatsApp Chat"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 print:hidden"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center justify-center p-3 sm:px-4 sm:py-3 rounded-full sm:rounded-none bg-[#241910] dark:bg-[#1A130D] text-[#F3EBDC] border border-[#A8752B]/70 hover:border-[#D4A359] hover:bg-[#2F2116] shadow-2xl transition-all duration-300 active:scale-95 gap-0 sm:gap-2.5"
      >
        {/* WhatsApp Icon */}
        <div className="flex items-center justify-center w-5 h-5 text-[#25D366] shrink-0">
          <FaWhatsapp className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>

        {/* Clean Label - hidden on mobile, visible on sm and up */}
        <span className="hidden sm:inline text-xs font-mono uppercase tracking-[0.18em] text-[#F3EBDC] group-hover:text-[#D4A359] transition-colors font-medium whitespace-nowrap">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
