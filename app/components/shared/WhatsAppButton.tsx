// app/components/shared/WhatsAppButton.tsx
"use client";

import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  phoneNumber?: string;
}

export default function WhatsAppButton({
  phoneNumber = "923130538686",
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <aside
      aria-label="Direct WhatsApp Chat"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 print:hidden"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group flex items-center gap-2.5 px-4 py-3 bg-[#241910] dark:bg-[#1A130D] text-[#F3EBDC] border border-[#A8752B]/70 hover:border-[#D4A359] hover:bg-[#2F2116] shadow-2xl transition-all duration-300 active:scale-95"
      >
        {/* WhatsApp Icon */}
        <div className="flex items-center justify-center w-5 h-5 text-[#25D366] shrink-0">
          <FaWhatsapp className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>

        {/* Clean Label */}
        <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#F3EBDC] group-hover:text-[#D4A359] transition-colors font-medium">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
}
