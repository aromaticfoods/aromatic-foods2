import React from 'react';
import { ShieldCheck, Truck, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { useLang } from '../i18n';
import { trackEvent } from '../utils/pixel';

interface HeroSectionProps {
  onExploreClick: () => void;
  sellerWhatsApp: string;
}

const BADGES = [
  { src: '/products/mango-preserve.webp', label: 'Mango Murabba', pos: 'top-2 right-[6%]', delay: '0s' },
  { src: '/products/glue-berry-pickle.webp', label: 'Gluey Berry Achar', pos: 'top-24 right-[26%]', delay: '1.2s' },
  { src: '/products/spice-haldi.webp', label: 'Haldi', pos: 'bottom-2 right-[10%]', delay: '2.4s' }
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick, sellerWhatsApp }) => {
  const { t, lang } = useLang();
  const phone = sellerWhatsApp.replace(/[^\d]/g, '');

  return (
    <section className="hero-bg relative overflow-hidden border-b border-stone-200/80">
      {/* Background particles (CSS only, disabled for reduced-motion) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="hero-dot" style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 5) * 1.3}s`, animationDuration: `${9 + (i % 4) * 2}s` }} />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[260px]">
        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200/80">
            <Sparkles className="w-3 h-3 text-amber-800" />
            <span className={lang === 'ur' ? 'font-urdu' : ''}>{t('badge')}</span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight ${lang === 'ur' ? 'font-urdu leading-[1.9]' : 'font-serif'}`}>
            Aromatic Foods — {t('heroTitle')}
          </h1>
          <p className={`text-sm text-stone-700 leading-relaxed ${lang === 'ur' ? 'font-urdu' : ''}`}>{t('heroSub')}</p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={onExploreClick} className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition">
              {t('shopNow')}
            </button>
            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(t('waHello'))}`}
              target="_blank" rel="noopener noreferrer"
              onClick={() => trackEvent('Contact', { content_name: 'Hero WhatsApp' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span className={lang === 'ur' ? 'font-urdu' : ''}>{t('waOrder')}</span>
            </a>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600 pt-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-800" />{t('city')}</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-emerald-700" />{t('cod')}</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-700" />{t('pack')}</span>
          </div>
        </div>

        {/* Floating product badges (hidden on phones to keep it light) */}
        <div aria-hidden="true" className="hidden md:block absolute inset-0 pointer-events-none">
          {BADGES.map(b => (
            <div key={b.label} className={`hero-float absolute ${b.pos}`} style={{ animationDelay: b.delay }}>
              <img src={b.src} alt="" loading="lazy" width={88} height={88} className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover shadow-lg ring-4 ring-white/80" />
              <span className="block mt-1 text-center text-[10px] font-semibold text-amber-900 bg-white/90 rounded-full px-2 py-0.5">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
