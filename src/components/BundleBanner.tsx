import React from 'react';
import { Gift } from 'lucide-react';
import { useLang } from '../i18n';
import { BUNDLE_MIN_ITEMS } from '../utils/orderCalculator';

export const BundleBanner: React.FC<{ units: number }> = ({ units }) => {
  const { lang } = useLang();
  const left = Math.max(0, BUNDLE_MIN_ITEMS - units);
  const pct = Math.min(100, Math.round((units / BUNDLE_MIN_ITEMS) * 100));
  const ur = lang === 'ur';
  const text = left === 0
    ? (ur ? 'مبارک ہو! آپ کو 10٪ بنڈل ڈسکاؤنٹ مل گیا 🎉' : 'Bundle unlocked! 10% discount applied 🎉')
    : (ur ? `${left} مزید چیز شامل کریں اور 10٪ ڈسکاؤنٹ پائیں` : `Add ${left} more item${left > 1 ? 's' : ''} to unlock 10% bundle discount`);
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2" role="status">
      <div className={`flex items-center gap-2 text-xs font-semibold text-amber-900 ${ur ? 'font-urdu' : ''}`}>
        <Gift className="w-4 h-4" /> <span>{text}</span>
      </div>
      <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
        <div className="h-full bg-amber-600 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
