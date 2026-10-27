import React from 'react';
import { TRUST_PILLARS, TESTIMONIALS } from '../data/products';
import { ShieldCheck, HeartHandshake, CheckCircle2, Star, HelpCircle } from 'lucide-react';

export const TrustAndReviewsSection: React.FC = () => {
  return (
    <div className="space-y-16 py-16 bg-[#FFFDF9] border-b border-amber-900/10">
      
      {/* 4 Core Pillars of Purity */}
      <section id="why-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
            Our Quality Promise • دیسی خالص معیار
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-serif">
            Why Pakistani Households Trust Aromatic Foods
          </h2>
          <p className="text-stone-600 text-sm">
            We don't mass-manufacture in industrial vats. Every jar is traditionally cured like home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((pillar, index) => (
            <div
              key={index}
              className="p-6 rounded-3xl bg-white border border-amber-900/10 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-xl">
                {index === 0 ? '🌿' : index === 1 ? '✨' : index === 2 ? '🏺' : '🚚'}
              </div>
              <div>
                <p className="text-xs font-serif font-bold text-amber-800">{pillar.urdu}</p>
                <h3 className="text-base font-bold text-amber-950 mt-0.5">{pillar.title}</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
            Verified Customer Feedback • خریداروں کی رائے
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-950 font-serif">
            Loved Across Pakistan
          </h2>
          <p className="text-stone-600 text-sm">
            Over 12,000 satisfied foodies enjoying authentic dadi amma recipes every day.
          </p>
        </div>

        <div role="region" aria-label="Customer reviews" tabIndex={0} className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 [&>div]:snap-start [&>div]:shrink-0 [&>div]:w-[85%] md:[&>div]:w-[360px]">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-amber-50/50 border border-amber-900/10 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500 gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Buyer ✓
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-950">{t.name}</h4>
                  <p className="text-[11px] text-stone-500">{t.city}</p>
                </div>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100/70 px-2 py-1 rounded-md">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-1">
          <h3 className="text-2xl font-bold text-amber-950 font-serif">
            Frequently Asked Questions (عمومی سوالات)
          </h3>
          <p className="text-xs text-stone-500">Everything you need to know about our packaging & delivery</p>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
            <h4 className="font-bold text-amber-950 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>How long does the achar and murabba stay fresh?</span>
            </h4>
            <p className="text-stone-600 pl-6 leading-relaxed">
              Because our achars are preserved in 100% pure cold-pressed mustard oil with natural spices, they have a natural shelf life of <strong>12 to 18 months</strong>. Keep the oil level covering the pickle pieces and always use a dry spoon. Murabbas stay fresh for 10-12 months.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
            <h4 className="font-bold text-amber-950 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>Will the glass jars break during courier transit?</span>
            </h4>
            <p className="text-stone-600 pl-6 leading-relaxed">
              We pack each glass jar with multi-layer air bubble wrap, leak-proof airtight induction seals, and heavy-duty 5-ply corrugated cardboard boxes. In the rare event of damage, we offer a <strong>100% Free Instant Replacement</strong>!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
            <h4 className="font-bold text-amber-950 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>How does Cash on Delivery (COD) work?</span>
            </h4>
            <p className="text-stone-600 pl-6 leading-relaxed">
              You do not need to pay in advance. When the delivery rider from TCS, Leopards, or Trax arrives at your address with your package, simply hand over the exact cash amount and collect your fresh parcel!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
