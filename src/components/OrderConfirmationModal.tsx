import React from 'react';
import {
  CheckCircle,
  MessageCircle,
  X,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { OrderItem, CustomerDetails, formatPKR, generateWhatsAppMessage } from '../utils/orderCalculator';
import { STORE_INFO } from '../data/products';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    customer: CustomerDetails;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    sheetsResponse: 'synced' | 'failed' | 'simulated';
    waUrl?: string;
  } | null;
  sellerWhatsApp: string;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderData,
  sellerWhatsApp
}) => {
  if (!isOpen || !orderData) return null;

  const { orderId, customer, items, subtotal, shipping, total, waUrl } = orderData;
  const cleanSellerPhone = sellerWhatsApp.replace(/[^\d]/g, '') || STORE_INFO.whatsappRaw;
  const finalWaUrl = waUrl || `https://wa.me/${cleanSellerPhone}?text=${encodeURIComponent(
    generateWhatsAppMessage(orderId, customer, items, subtotal, shipping, total)
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2.5">
            <CheckCircle className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif">
            Order Saved & Ready to Send!
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Order ID: <strong className="font-mono text-stone-200">{orderId}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Primary Action Button */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-center">
            <p className="font-bold text-emerald-950 text-sm">
              Send Your Pre-Written Message on WhatsApp
            </p>
            <p className="text-emerald-800 text-xs">
              All details (Name, Address, Items & Total) are fetched and pre-typed into WhatsApp. Click below to send directly to Aromatic Foods!
            </p>
            <a
              href={finalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Open WhatsApp & Send Message</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>

          {/* Customer & Address Details */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 space-y-1.5 text-stone-700">
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Delivery Details
            </p>
            <p><strong>Name:</strong> {customer.fullName}</p>
            <p><strong>Phone / WhatsApp:</strong> {customer.phone}</p>
            <p><strong>Address:</strong> {customer.address}, {customer.city}</p>
            <p><strong>Payment:</strong> {customer.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : customer.paymentMethod}</p>
            {customer.orderNotes && <p><strong>Notes:</strong> {customer.orderNotes}</p>}
          </div>

          {/* Ordered Items Breakdown */}
          <div className="space-y-2">
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
              Selected Items ({items.length})
            </p>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-3 bg-white">
              {items.map(item => (
                <div key={`${item.id}-${item.weight}`} className="py-1.5 flex justify-between">
                  <span>{item.name} ({item.weight}) × {item.quantity}</span>
                  <span className="font-bold text-stone-900">{formatPKR(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="pt-2 flex justify-between text-stone-500">
                <span>Subtotal:</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery:</span>
                <span>{shipping === 0 ? 'FREE' : formatPKR(shipping)}</span>
              </div>
              <div className="pt-2 font-bold text-stone-900 flex justify-between text-sm border-t border-stone-200">
                <span>Total Amount:</span>
                <span className="text-amber-900 font-serif text-base">{formatPKR(total)}</span>
              </div>
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100">
            <span>Order ID: {orderId}</span>
            <button onClick={onClose} className="font-bold text-stone-600 hover:text-stone-900">
              Done / Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
