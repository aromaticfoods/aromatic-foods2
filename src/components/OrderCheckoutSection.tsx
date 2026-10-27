import React, { useState, useRef } from 'react';
import { useLang } from '../i18n';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  OrderItem,
  CustomerDetails,
  calculateSubtotal,
  calculateShipping,
  calculateOrderTotal,
  formatPKR,
  validatePakistaniPhone,
  generateWhatsAppMessage,
  createSheetsPayload,
  createOrderRequest,
  calculateBundleDiscount,
  sanitizeText,
  FREE_SHIPPING_THRESHOLD
} from '../utils/orderCalculator';
import { BundleBanner } from './BundleBanner';
import { PAKISTANI_CITIES, STORE_INFO } from '../data/products';

interface OrderCheckoutSectionProps {
  cartItems: OrderItem[];
  onUpdateQuantity: (id: string, weight: string, delta: number, price?: number) => void;
  onRemoveItem: (id: string, weight: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (orderData: {
    orderId: string;
    customer: CustomerDetails;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    sheetsResponse: 'synced' | 'failed' | 'simulated';
    waUrl: string;
  }) => void;
  sellerWhatsApp: string;
  googleScriptUrl: string;
  onStartCheckout?: () => void;
}

export const OrderCheckoutSection: React.FC<OrderCheckoutSectionProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  sellerWhatsApp,
  googleScriptUrl,
  onStartCheckout
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Multan');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'EASYPAISA' | 'JAZZCASH' | 'BANK'>('COD');
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tr, lang } = useLang();
  const [hp, setHp] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMsg, setGiftMsg] = useState('');
  const mountedAt = useRef(Date.now());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Calculations
  const subtotal = calculateSubtotal(cartItems);
  const discount = calculateBundleDiscount(cartItems, true);
  const net = subtotal - discount;
  const units = cartItems.reduce((n, i) => n + (i.quantity || 0), 0);
  const shipping = calculateShipping(net);
  const grandTotal = calculateOrderTotal(net, shipping);

  const phoneValidation = validatePakistaniPhone(phone);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - net);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Apna naam enter karein';
    }

    if (!phone.trim()) {
      errors.phone = 'WhatsApp / phone number lazmi hai';
    } else if (!phoneValidation.isValid) {
      errors.phone = 'Sahi Pakistani number enter karein (e.g. 0303 1234567)';
    }

    if (!address.trim() || address.trim().length < 5) {
      errors.address = 'Mukammal delivery address likhein';
    }

    if (cartItems.length === 0) {
      errors.cart = 'Pehle kam az kam aik product select karein!';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateOrderId = () => {
    return 'AF-' + Math.floor(100000 + Math.random() * 900000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const orderId = generateOrderId();
    const customer: CustomerDetails = {
      fullName: sanitizeText(fullName, 80),
      phone: phoneValidation.formatted || phone.trim(),
      city,
      address: sanitizeText(address, 300),
      paymentMethod,
      orderNotes: sanitizeText((isGift ? `GIFT: ${sanitizeText(giftMsg, 120)} | ` : '') + orderNotes, 300)
    };

    const payload = createSheetsPayload(orderId, customer, cartItems, subtotal, shipping, grandTotal);

    // Save order locally in browser
    try {
      const existing = JSON.parse(localStorage.getItem('aromatic_foods_orders') || '[]');
      existing.unshift(payload);
      localStorage.setItem('aromatic_foods_orders', JSON.stringify(existing));
    } catch (err) {
      console.warn('Storage log error', err);
    }

    let sheetsStatus: 'synced' | 'failed' | 'simulated' = 'simulated';

    // Submit to the secure backend (server re-calculates prices; same key = no duplicate row on retry)
    if (googleScriptUrl && googleScriptUrl.startsWith('http')) {
      try {
        const body = createOrderRequest(orderId, customer, cartItems, {
          key: crypto.randomUUID(),
          hp,
          elapsedMs: Date.now() - mountedAt.current,
          bundle: discount > 0
        });
        const res = await fetch(googleScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(8000)
        });
        const out = await res.json();
        sheetsStatus = out.status === 'success' ? 'synced' : 'failed';
      } catch (err) {
        console.error('Order submission error', err);
        sheetsStatus = 'failed'; // WhatsApp order still goes through below
      }
    }

    // Format pre-written WhatsApp message with all customer and order details
    const cleanSellerPhone = sellerWhatsApp.replace(/[^\d]/g, '') || STORE_INFO.whatsappRaw;
    const rawMessage = generateWhatsAppMessage(orderId, customer, cartItems, subtotal, shipping, grandTotal, discount);
    const waUrl = `https://wa.me/${cleanSellerPhone}?text=${encodeURIComponent(rawMessage)}`;

    setIsSubmitting(false);

    // Trigger parent success modal & direct WhatsApp launch
    onOrderSuccess({
      orderId,
      customer,
      items: cartItems,
      subtotal: net,
      shipping,
      total: grandTotal,
      sheetsResponse: sheetsStatus,
      waUrl
    });

    // Auto-open WhatsApp with the ready message
    try {
      window.open(waUrl, '_blank');
    } catch {
      window.location.href = waUrl;
    }
  };

  return (
    <div id="checkout" className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
            Order & Customer Details
          </h2>
          <p className="text-[11px] text-stone-500">
            Enter details to confirm order via Cash on Delivery & WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-[11px] font-medium text-stone-700">
          <Truck className="w-3.5 h-3.5 text-amber-800" />
          <span>{tr("Nationwide COD")}</span>
        </div>
      </div>

      {/* Cart Items Summary inside Checkout Card */}
      <div className="bg-[#FAF8F5] rounded-xl p-3 border border-stone-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-200/60 font-semibold text-stone-800">
          <span>{tr("Selected Products")} ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-[11px] text-stone-400 hover:text-red-600 flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" />
              <span>{tr("Clear")}</span>
            </button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.weight}`} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-stone-200/40 last:border-b-0">
                <div className="flex items-center gap-2 truncate">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-md object-cover border border-stone-200 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-stone-900 truncate text-[11px]">{item.name}</p>
                    <p className="text-[10px] text-stone-500">{item.weight} • {formatPKR(item.price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-md bg-white border border-stone-300 p-0.5">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.weight, -1, item.price)}
                      className="w-4 h-4 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-4 text-center font-bold text-[10px] text-stone-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.weight, 1, item.price)}
                      className="w-4 h-4 flex items-center justify-center bg-stone-900 text-white rounded"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="font-bold text-stone-900 min-w-[50px] text-right text-[11px]">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-center text-stone-400 text-xs">
            <ShoppingBag className="w-5 h-5 mx-auto mb-1 opacity-40" />
            <p className="text-[11px]">{tr("No product selected yet. Click \"+ Add\" on any item above.")}</p>
          </div>
        )}

        {/* Free Shipping Progress Indicator */}
        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-600">
          <span>
            {net >= FREE_SHIPPING_THRESHOLD ? (
              <strong className="text-emerald-700 font-semibold">{tr("✓ Free Delivery Unlocked!")}</strong>
            ) : (
              <span>{lang === 'ur' ? <>مفت ڈیلیوری کے لیے <strong>{formatPKR(amountNeededForFreeShipping)}</strong> مزید شامل کریں</> : <>Add <strong>{formatPKR(amountNeededForFreeShipping)}</strong> more for Free Delivery</>}</span>
            )}
          </span>
          <span className="text-stone-500">
            {tr("Delivery:")} {shipping === 0 ? <strong className="text-emerald-700">{tr("FREE")}</strong> : 'Rs. 200'}
          </span>
        </div>
      </div>

      {/* Customer Input Form */}
      <form onSubmit={handlePlaceOrder} onFocus={onStartCheckout} className="space-y-3">
        <input type="text" name="website" value={hp} onChange={e => setHp(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
        <BundleBanner units={units} />
        <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-800">
            <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} /> 🎁 Gift order / تحفے کا آرڈر
          </label>
          {isGift && <input value={giftMsg} onChange={e => setGiftMsg(e.target.value)} maxLength={120} placeholder="Gift message (optional) — add receiver's name & address above" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs" />}
        </div>
        {formErrors.cart && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formErrors.cart}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-800 mb-1">
            {tr("Full Name *")}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder={tr("e.g. Muhammad Usman")}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 transition-all ${
              formErrors.fullName ? 'border-red-400' : 'border-stone-300'
            }`}
          />
          {formErrors.fullName && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.fullName}</p>}
        </div>

        {/* WhatsApp Phone */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-stone-800">
              {tr("WhatsApp / Mobile Number *")}
            </label>
            {phone && (
              <span className={`text-[10px] font-medium ${phoneValidation.isValid ? 'text-emerald-700' : 'text-amber-700'}`}>
                {phoneValidation.isValid ? '✓ Valid Number' : 'Enter 11 digits (03xx)'}
              </span>
            )}
          </div>
          <input
            type="tel"
            required
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="0303 1234567"
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 transition-all ${
              formErrors.phone ? 'border-red-400' : 'border-stone-300'
            }`}
          />
          {formErrors.phone && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.phone}</p>}
        </div>

        {/* City and Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-stone-800 mb-1">
              {tr("City *")}
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 font-medium"
            >
              {PAKISTANI_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-stone-800 mb-1">
              {tr("Delivery Address *")}
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder={tr("House #, Street, Colony or Mohalla...")}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-800 transition-all ${
                formErrors.address ? 'border-red-400' : 'border-stone-300'
              }`}
            />
            {formErrors.address && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.address}</p>}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-800 mb-1">
            {tr("Payment Option *")}
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer bg-white transition-all ${
              paymentMethod === 'COD' ? 'border-amber-800 ring-1 ring-amber-800 bg-amber-50/30' : 'border-stone-200'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="text-amber-800"
              />
              <span className="font-semibold text-stone-900 text-[11px]">{tr("Cash on Delivery")}</span>
            </label>

            <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer bg-white transition-all ${
              paymentMethod === 'EASYPAISA' ? 'border-amber-800 ring-1 ring-amber-800 bg-amber-50/30' : 'border-stone-200'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="EASYPAISA"
                checked={paymentMethod === 'EASYPAISA'}
                onChange={() => setPaymentMethod('EASYPAISA')}
                className="text-amber-800"
              />
              <span className="font-semibold text-stone-900 text-[11px]">{tr("EasyPaisa / JazzCash")}</span>
            </label>
          </div>
        </div>

        {/* Total calculation bar */}
        <div className="pt-2 border-t border-stone-200 space-y-1 text-xs">
          <div className="flex justify-between text-stone-600 text-[11px]">
            <span>{tr("Subtotal:")}</span>
            <span>{formatPKR(subtotal)}{discount > 0 && <strong className="text-emerald-700"> − {formatPKR(discount)} (10% bundle)</strong>}</span>
          </div>
          <div className="flex justify-between text-stone-600 text-[11px]">
            <span>{tr("Delivery:")}</span>
            <span>{shipping === 0 ? <strong className="text-emerald-700">{tr("FREE")}</strong> : formatPKR(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-100 font-serif">
            <span>{tr("Total Amount:")}</span>
            <span className="text-base text-amber-900 font-bold">{formatPKR(grandTotal)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || cartItems.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{tr("Order Place Karein (WhatsApp Par Bhejein)")}</span>
          </button>
          <p className="text-center text-[10px] text-stone-500 mt-1.5">
            Button dabane se details save ho kar WhatsApp par typed message me redirect hongi.
          </p>
        </div>

      </form>
    </div>
  );
};
