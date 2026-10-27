import React, { useState } from 'react';
import { Gift, Minus, Plus } from 'lucide-react';
import { Product } from '../data/products';
import { useLang } from '../i18n';
import { BUNDLE_MIN_ITEMS, BUNDLE_DISCOUNT_RATE, formatPKR } from '../utils/orderCalculator';

interface Props {
  products: Product[];
  onAdd: (productId: string, variantWeight: string, delta: number, price: number) => void;
}

const MAX_UNITS = 12;
const base = (p: Product) => p.variants?.[0] ?? { weight: p.weight, price: p.price };

export const BundleBox: React.FC<Props> = ({ products, onAdd }) => {
  const { tr, lang } = useLang();
  const [box, setBox] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const ur = lang === 'ur';
  const stock = products.filter(p => p.inStock);
  const units = Object.values(box).reduce((a, b) => a + b, 0);
  const total = stock.reduce((s, p) => s + base(p).price * (box[p.id] || 0), 0);
  const save = units >= BUNDLE_MIN_ITEMS ? Math.round(total * BUNDLE_DISCOUNT_RATE) : 0;
  const change = (id: string, d: number) => { setDone(false); setBox(b => { const n = Math.max(0, (b[id] || 0) + d); if (d > 0 && units >= MAX_UNITS) return b; const c = { ...b, [id]: n }; if (!n) delete c[id]; return c; }); };
  const addBox = () => {
    stock.forEach(p => { const q = box[p.id] || 0; if (q > 0) onAdd(p.id, base(p).weight, q, base(p).price); });
    setBox({}); setDone(true);
  };

  return (
    <section id="bundle-box" className="my-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-amber-800" />
        <div>
          <h2 className={`text-base font-bold text-amber-950 ${ur ? 'font-urdu' : 'font-serif'}`}>{tr('Build Your Box')}</h2>
          <p className={`text-[11px] text-stone-600 ${ur ? 'font-urdu' : ''}`}>{tr('Pick 3 or more items and get 10% off')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stock.map(p => {
          const q = box[p.id] || 0;
          return (
            <div key={p.id} className={`rounded-xl border bg-white p-2 flex flex-col gap-1.5 ${q ? 'border-amber-500 ring-1 ring-amber-400' : 'border-stone-200'}`}>
              <img src={p.image} alt={tr(p.name)} loading="lazy" width={120} height={120} className="w-full h-20 object-cover rounded-lg" />
              <p className={`text-[11px] font-semibold text-stone-900 leading-tight line-clamp-2 ${ur ? 'font-urdu' : ''}`}>{tr(p.name)}</p>
              <p className="text-[11px] text-stone-500">{base(p).weight} • {formatPKR(base(p).price)}</p>
              <div className="flex items-center justify-between mt-auto">
                <button type="button" aria-label="Remove one" onClick={() => change(p.id, -1)} disabled={!q} className="w-7 h-7 rounded-lg border border-stone-300 flex items-center justify-center disabled:opacity-30"><Minus className="w-3.5 h-3.5" /></button>
                <span className="text-sm font-bold w-6 text-center">{q}</span>
                <button type="button" aria-label="Add one" onClick={() => change(p.id, 1)} className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2" role="status">
        <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden"><div className="h-full bg-amber-600 transition-[width] duration-500" style={{ width: `${Math.min(100, (units / BUNDLE_MIN_ITEMS) * 100)}%` }} /></div>
        <p className={`text-xs text-stone-700 ${ur ? 'font-urdu' : ''}`}>
          {units === 0 ? tr('Your box is empty — tap items to add')
            : <>{tr('Box total')}: <strong>{formatPKR(total)}</strong>{save > 0 && <> • {tr('You save')}: <strong className="text-emerald-700">{formatPKR(save)}</strong></>}</>}
        </p>
        <button type="button" onClick={addBox} disabled={units < BUNDLE_MIN_ITEMS} className={`w-full py-2.5 rounded-xl bg-amber-800 text-white text-sm font-bold disabled:opacity-40 ${ur ? 'font-urdu' : ''}`}>
          {done ? tr('Box added to your order ✓') : `${tr('Add Box to Order')} (${units}/${BUNDLE_MIN_ITEMS}+)`}
        </button>
      </div>
    </section>
  );
};
