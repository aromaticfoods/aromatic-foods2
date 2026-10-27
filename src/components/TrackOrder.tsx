import React, { useState } from 'react';
import { GOOGLE_SCRIPT_URL } from '../config';
import { validatePakistaniPhone, sanitizeText } from '../utils/orderCalculator';
import { useLang } from '../i18n';

export const TrackOrder: React.FC = () => {
  const { lang } = useLang();
  const ur = lang === 'ur';
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = validatePakistaniPhone(phone);
    if (!orderId.trim() || !p.isValid) { setMsg(ur ? 'درست آرڈر ID اور 03XXXXXXXXX نمبر لکھیں' : 'Enter a valid Order ID and 03XXXXXXXXX number'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ action: 'trackOrder', orderId: sanitizeText(orderId, 20), phone: p.cleaned }) });
      const j = await r.json();
      setMsg(j.status === 'success' ? `${j.orderStatus}${j.trackingNo ? ` • TCS/Leopards: ${j.trackingNo}` : ''}` : (ur ? 'آرڈر نہیں ملا' : 'Order not found'));
    } catch { setMsg(ur ? 'ابھی چیک نہیں ہو سکا، واٹس ایپ پر پوچھیں' : 'Could not check right now. Please ask on WhatsApp.'); }
    setBusy(false);
  };

  return (
    <section id="track" className="max-w-xl mx-auto px-4 py-8">
      <h2 className={`text-lg font-bold text-amber-950 mb-2 ${ur ? 'font-urdu' : 'font-serif'}`}>{ur ? 'اپنا آرڈر ٹریک کریں' : 'Track Your Order'}</h2>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="AF-123456" className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" placeholder="03XXXXXXXXX" className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <button disabled={busy} className="rounded-lg bg-stone-900 text-white text-sm font-semibold px-4 py-2 disabled:opacity-60">{busy ? '...' : (ur ? 'چیک کریں' : 'Track')}</button>
      </form>
      {msg && <p role="status" className="mt-2 text-sm text-stone-700">{msg}</p>}
    </section>
  );
};
