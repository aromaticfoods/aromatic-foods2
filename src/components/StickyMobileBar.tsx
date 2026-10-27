import React from 'react';
import { ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { formatPKR } from '../utils/orderCalculator';

interface StickyMobileBarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCheckout: () => void;
  sellerWhatsApp: string;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({
  cartCount,
  cartTotal,
  onOpenCheckout,
  sellerWhatsApp
}) => {
  const cleanPhone = sellerWhatsApp.replace(/[^\d]/g, '');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-900/15 p-3 shadow-2xl lg:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {cartCount > 0 ? (
          <>
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                {cartCount} {cartCount === 1 ? 'Jar' : 'Jars'} Selected
              </span>
              <span className="text-xl font-black text-amber-950 font-serif leading-none">
                {formatPKR(cartTotal)}
              </span>
            </div>

            <button
              onClick={onOpenCheckout}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-800 to-red-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Complete Order</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-stone-800">Fresh Batch In Stock</span>
            </div>
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Salam Aromatic Foods! I would like to order homemade achar.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
