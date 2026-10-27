import React from 'react';
import { MessageCircle } from 'lucide-react';
import { STORE_INFO } from '../data/products';
import { trackEvent } from '../utils/pixel';
import { useLang } from '../i18n';

interface NavbarProps {
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  sellerWhatsApp: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  sellerWhatsApp
}) => {
  const { t, toggle, lang } = useLang();
  const cleanPhone = sellerWhatsApp.replace(/[^\d]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/90 transition-all">
      {/* Subtle Announcement Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="text-amber-400 font-semibold">Aromatic Foods Multan</span>
        <span className="text-stone-500">•</span>
        <span className={lang === 'ur' ? 'font-urdu' : ''}>{t('announce')}</span>
        <span className="hidden sm:inline text-stone-500">•</span>
        <span className={`hidden sm:inline ${lang === 'ur' ? 'font-urdu' : ''}`}>{t('freeDelivery')}</span>
      </div>

      {/* Minimal Aesthetic Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <img
            src="/brand/logo.png"
            alt={STORE_INFO.name}
            className="h-10 sm:h-12 w-auto object-contain"
          />
          <p className="hidden sm:block text-[11px] text-stone-500 border-l border-stone-300 pl-3">
            {t('navSub')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={toggle}
            aria-label="Switch language"
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-300 text-stone-800 hover:bg-stone-100 transition ${lang === 'en' ? 'font-urdu' : ''}`}
          >
            {t('switchTo')}
          </button>

          {/* Direct WhatsApp Chat */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(t('waHello'))}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('Contact', { content_name: 'Navbar WhatsApp' })}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">{t('whatsapp')}</span>
          </a>

          {/* Cart Count Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all shadow-xs"
          >
            <span>{t('order')}</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold text-[11px]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
