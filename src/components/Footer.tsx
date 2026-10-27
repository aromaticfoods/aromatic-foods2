import React from 'react';
import { useLang } from '../i18n';
import { STORE_INFO } from '../data/products';
import { MessageCircle, MapPin } from 'lucide-react';
import { trackEvent } from '../utils/pixel';

interface FooterProps {
  sellerWhatsApp: string;
}

export const Footer: React.FC<FooterProps> = ({ sellerWhatsApp }) => {
  const { tr, lang } = useLang();
  const cleanPhone = sellerWhatsApp.replace(/[^\d]/g, '');

  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold font-serif text-white">Aromatic Foods</span>
              <span className="text-xs text-amber-400 font-medium">({STORE_INFO.instagram})</span>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-md">
              {tr("Homemade Preserves, Pickles & Spices. Freshly made & delivered to your door from Multan, Pakistan.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'Footer WhatsApp' })}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>{tr("WhatsApp: 0303-4605255")}</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>{STORE_INFO.location}</span>
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy.html" className="hover:text-stone-300 underline decoration-dotted">{tr("Privacy Policy")}</a>
            <a href="/contact.html" className="hover:text-stone-300 underline decoration-dotted">{tr("Contact Us")}</a>
          </div>
          <p>© {new Date().getFullYear()} Aromatic Foods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
