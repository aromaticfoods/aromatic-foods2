/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BundleBox } from './components/BundleBox';
import { ProductShowcase } from './components/ProductShowcase';
import { OrderCheckoutSection } from './components/OrderCheckoutSection';
import { Footer } from './components/Footer';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { StickyMobileBar } from './components/StickyMobileBar';
import { OrderItem, CustomerDetails, calculateSubtotal } from './utils/orderCalculator';
import { PRODUCTS_CATALOG, STORE_INFO } from './data/products';
import { GOOGLE_SCRIPT_URL } from './config';
import { trackEvent } from './utils/pixel';
import { MessageCircle, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export default function App() {
  const SELLER_PHONE = STORE_INFO.whatsapp; // 0303 4605255

  // Product list is fixed in src/data/products.ts (same for every visitor)
  const productsList = PRODUCTS_CATALOG;

  // Mobile active tab ('products' | 'checkout')
  const [activeMobileTab, setActiveMobileTab] = useState<'products' | 'checkout'>('products');

  // Cart items
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    const first = productsList[0] || PRODUCTS_CATALOG[0];
    return [
      {
        id: first.id,
        name: first.name,
        subtitle: first.subtitle,
        weight: first.weight,
        price: first.price,
        quantity: 1,
        image: first.image
      }
    ];
  });

  const googleScriptUrl = GOOGLE_SCRIPT_URL;
  const checkoutTracked = useRef(false);

  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: 'Aromatic Foods Catalog',
      content_type: 'product_group',
      currency: 'PKR'
    });
  }, []);

  // Modals
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    customer: CustomerDetails;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    sheetsResponse: 'synced' | 'failed' | 'simulated';
    waUrl: string;
  } | null>(null);

  const cartItemsMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach(item => {
      map[`${item.id}-${item.weight}`] = item.quantity;
    });
    return map;
  }, [cartItems]);

  const subtotal = calculateSubtotal(cartItems);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (
    productId: string,
    variantWeight: string,
    delta: number,
    priceOverride?: number
  ) => {
    if (delta > 0) {
      const prod = productsList.find(p => p.id === productId);
      if (prod) {
        trackEvent('AddToCart', {
          content_ids: [productId],
          content_name: prod.name,
          content_type: 'product',
          value: (priceOverride || prod.price) * delta,
          currency: 'PKR'
        });
      }
    }
    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === productId && i.weight === variantWeight);

      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((_, idx) => idx !== existingIndex);
        } else {
          const updated = [...prev];
          updated[existingIndex] = { ...item, quantity: newQty };
          return updated;
        }
      } else if (delta > 0) {
        const prod = productsList.find(p => p.id === productId);
        if (!prod) return prev;
        return [
          ...prev,
          {
            id: prod.id,
            name: prod.name,
            subtitle: prod.subtitle,
            weight: variantWeight,
            price: priceOverride || prod.price,
            quantity: delta,
            image: prod.image
          }
        ];
      }
      return prev;
    });
  };

  const handleRemoveItem = (id: string, weight: string) => {
    setCartItems(prev => prev.filter(i => !(i.id === id && i.weight === weight)));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderSuccess = (orderData: {
    orderId: string;
    customer: CustomerDetails;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    total: number;
    sheetsResponse: 'synced' | 'failed' | 'simulated';
    waUrl: string;
  }) => {
    trackEvent(
      'Purchase',
      {
        value: orderData.total,
        currency: 'PKR',
        content_type: 'product',
        content_ids: orderData.items.map(i => i.id),
        num_items: orderData.items.reduce((sum, i) => sum + i.quantity, 0)
      },
      orderData.orderId
    );
    setConfirmedOrder(orderData);
    setIsConfirmationModalOpen(true);
  };

  const handleCheckoutStart = () => {
    if (checkoutTracked.current) return;
    checkoutTracked.current = true;
    trackEvent('InitiateCheckout', {
      value: subtotal,
      currency: 'PKR',
      num_items: totalCount
    });
  };

  const scrollToCheckout = () => {
    handleCheckoutStart();
    setActiveMobileTab('checkout');
    setTimeout(() => {
      const el = document.getElementById('checkout');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Header */}
      <Navbar
        cartCount={totalCount}
        cartSubtotal={subtotal}
        onOpenCart={scrollToCheckout}
        sellerWhatsApp={SELLER_PHONE}
      />

      {/* Main Order Placement Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-5 space-y-4">
        
        {/* Aesthetic Store Intro */}
        <HeroSection
          onExploreClick={() => {
            setActiveMobileTab('products');
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          sellerWhatsApp={SELLER_PHONE}
        />

        <BundleBox products={productsList} onAdd={handleUpdateQuantity} />

        {/* Mobile View Switcher Tab (Only on small screens) */}
        <div className="lg:hidden flex items-center bg-stone-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMobileTab('products')}
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
              activeMobileTab === 'products'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            1. Select Products ({productsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('checkout')}
            className={`flex-1 py-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
              activeMobileTab === 'checkout'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>2. Order & Details</span>
            {totalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-800 text-white text-[10px] font-bold">
                {totalCount}
              </span>
            )}
          </button>
        </div>

        {/* 
          UNIFIED ORDER SYSTEM:
          Cart details & customer order form placed prominently right alongside product selection!
          On Desktop: Two columns side-by-side (Products on left, Order details on right).
          On Mobile: Active tab controls visibility, with sticky order bar.
        */}
        <div id="order-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Product Selection with compact horizontal cards */}
          <div
            id="products-section"
            className={`lg:col-span-7 space-y-4 ${
              activeMobileTab === 'products' ? 'block' : 'hidden lg:block'
            }`}
          >
            <ProductShowcase
              products={productsList}
              cartItemsMap={cartItemsMap}
              onUpdateQuantity={handleUpdateQuantity}
            />
          </div>

          {/* Right Column: Cart Details & Customer Order Form at the top */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-24 space-y-4 ${
              activeMobileTab === 'checkout' ? 'block' : 'hidden lg:block'
            }`}
          >
            <OrderCheckoutSection
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onOrderSuccess={handleOrderSuccess}
              sellerWhatsApp={SELLER_PHONE}
              googleScriptUrl={googleScriptUrl}
              onStartCheckout={handleCheckoutStart}
            />

            {/* Subtle Trust Pillars under checkout */}
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 text-[11px] text-stone-600 space-y-1.5">
              <p className="flex items-center gap-1.5 font-medium text-stone-900">
                <Truck className="w-3.5 h-3.5 text-amber-800" />
                <span>Nationwide Express Delivery (TCS / Leopards)</span>
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Homemade in Multan • From Mama's Kitchen</span>
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Minimal Footer */}
      <Footer
        sellerWhatsApp={SELLER_PHONE}
      />

      {/* Sticky Mobile Checkout Bar */}
      <StickyMobileBar
        cartCount={totalCount}
        cartTotal={subtotal}
        onOpenCheckout={scrollToCheckout}
        sellerWhatsApp={SELLER_PHONE}
      />

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${SELLER_PHONE.replace(/[^\d]/g, '')}?text=${encodeURIComponent("Salam Aromatic Foods! I want to inquire about your products.")}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('Contact', { content_name: 'Floating WhatsApp' })}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 bg-emerald-700 hover:bg-emerald-800 text-white p-3.5 sm:p-4 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/20"
        aria-label="Chat on WhatsApp"
        title="WhatsApp Chat (0303-4605255)"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>


      {/* Confirmation & WhatsApp Launch Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        orderData={confirmedOrder}
        sellerWhatsApp={SELLER_PHONE}
      />



    </div>
  );
}
