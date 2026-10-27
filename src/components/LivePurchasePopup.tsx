import React, { useEffect, useState } from 'react';
import { GOOGLE_SCRIPT_URL } from '../config';
import { useLang } from '../i18n';

interface Recent { name: string; city: string; product: string }

// Shows REAL recent orders only (first name + city + product). Stays hidden if the server has < 5 orders.
export const LivePurchasePopup: React.FC = () => {
  const { lang } = useLang();
  const [items, setItems] = useState<Recent[]>([]);
  const [idx, setIdx] = useState(-1);
  const [closed, setClosed] = useState(() => { try { return sessionStorage.getItem('af_pop') === '1'; } catch { return false; } });

  useEffect(() => {
    if (closed || !GOOGLE_SCRIPT_URL.startsWith('http')) return;
    const ctl = new AbortController();
    fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'recentOrders' }), signal: ctl.signal })
      .then(r => r.json())
      .then(j => { if (j.status === 'success' && Array.isArray(j.items)) setItems(j.items.slice(0, 8)); })
      .catch(() => { /* popups are optional */ });
    return () => ctl.abort();
  }, [closed]);

  useEffect(() => {
    if (closed || items.length === 0) return;
    let i = 0;
    const show = () => { setIdx(i % items.length); i++; setTimeout(() => setIdx(-1), 5000); };
    const first = setTimeout(show, 6000);
    const loop = setInterval(show, 14000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, [items, closed]);

  if (closed || idx < 0 || !items[idx]) return null;
  const o = items[idx];
  return (
    <div role="status" aria-live="polite" className="fixed left-3 bottom-20 sm:bottom-4 z-50 max-w-[280px] rounded-xl bg-white shadow-lg border border-stone-200 p-3 text-xs text-stone-800">
      <button aria-label="Close" onClick={() => { setClosed(true); try { sessionStorage.setItem('af_pop', '1'); } catch { /* ignore */ } }} className="absolute top-1 right-2 text-stone-400">×</button>
      <p className={lang === 'ur' ? 'font-urdu' : ''}>
        <strong>{o.name}</strong> {lang === 'ur' ? `(${o.city}) نے آرڈر کیا:` : `from ${o.city} ordered`} <strong>{o.product}</strong>
      </p>
    </div>
  );
};
