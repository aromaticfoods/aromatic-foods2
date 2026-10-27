export interface OrderItem {
  id: string;
  name: string;
  urduName?: string;
  subtitle?: string;
  weight: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  paymentMethod: 'COD' | 'EASYPAISA' | 'JAZZCASH' | 'BANK';
  orderNotes?: string;
}

export const FREE_SHIPPING_THRESHOLD = 2500;
export const STANDARD_SHIPPING_FEE = 200;

export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0);
}

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function calculateOrderTotal(subtotal: number, shipping: number): number {
  return subtotal + shipping;
}

export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

export function validatePakistaniPhone(phone: string): { isValid: boolean; cleaned: string; formatted: string } {
  if (!phone) return { isValid: false, cleaned: '', formatted: '' };
  
  const digits = phone.replace(/[^\d]/g, '');
  let cleaned = digits;
  if (cleaned.startsWith('92') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('0092') && cleaned.length === 14) {
    cleaned = '0' + cleaned.slice(4);
  }

  const isValid = /^03\d{9}$/.test(cleaned);
  const formatted = isValid ? `${cleaned.slice(0, 4)}-${cleaned.slice(4)}` : phone;

  return { isValid, cleaned, formatted };
}

/**
 * Pre-formatted WhatsApp order message sent directly to the seller (0303-4605255).
 */
export function generateWhatsAppMessage(
  orderId: string,
  customer: CustomerDetails,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number,
  discount = 0
): string {
  const activeItems = items.filter(i => i.quantity > 0);
  const itemsText = activeItems
    .map(i => `• ${i.name} (${i.weight}) x ${i.quantity} = ${formatPKR(i.price * i.quantity)}`)
    .join('\n');

  const shippingText = shipping === 0 ? 'FREE Delivery' : formatPKR(shipping);
  const paymentText =
    customer.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' :
    customer.paymentMethod === 'EASYPAISA' ? 'EasyPaisa' :
    customer.paymentMethod === 'JAZZCASH' ? 'JazzCash' : 'Bank Transfer';

  return `*Salam Aromatic Foods!* 🌿
I just placed an order on your store. Please confirm my order:

🧾 *Order ID:* ${orderId}
👤 *Name:* ${customer.fullName}
📱 *Phone:* ${customer.phone}
${customer.email ? `📧 *Email:* ${customer.email}\n` : ''}📍 *Delivery Address:* ${customer.address}
🏙️ *City:* ${customer.city}

🛒 *Items Ordered:*
${itemsText}

━━━━━━━━━━━━━━━━━
💰 *Subtotal:* ${formatPKR(subtotal)}
${discount > 0 ? `🎁 *Bundle Discount (10%):* -${formatPKR(discount)}\n` : ''}🚚 *Delivery:* ${shippingText}
🏷️ *Grand Total:* *${formatPKR(total)}*
💳 *Payment Mode:* ${paymentText}
${customer.orderNotes ? `📝 *Special Instructions:* ${customer.orderNotes}\n` : ''}━━━━━━━━━━━━━━━━━
Please confirm dispatch and tracking details. Thank you!`;
}

export function createSheetsPayload(
  orderId: string,
  customer: CustomerDetails,
  items: OrderItem[],
  subtotal: number,
  shipping: number,
  total: number
) {
  const activeItems = items.filter(i => i.quantity > 0);
  const itemSummary = activeItems
    .map(i => `${i.name} [${i.weight}] (x${i.quantity})`)
    .join('; ');

  return {
    timestamp: new Date().toISOString(),
    orderId,
    customerName: customer.fullName,
    phone: customer.phone,
    email: customer.email || 'N/A',
    city: customer.city,
    address: customer.address,
    items: itemSummary,
    subtotal,
    shipping,
    total,
    paymentMethod: customer.paymentMethod,
    orderNotes: customer.orderNotes || '',
    status: 'Pending Dispatch'
  };
}

// ---- Bundle discount & input hygiene ----
export const BUNDLE_MIN_ITEMS = 3;
export const BUNDLE_DISCOUNT_RATE = 0.1;

/** 10% off the product subtotal when a bundle box has 3+ units. Never applied to shipping. */
export function calculateBundleDiscount(items: OrderItem[], isBundle: boolean): number {
  if (!isBundle) return 0;
  const units = items.reduce((n, i) => n + (i.quantity || 0), 0);
  return units >= BUNDLE_MIN_ITEMS ? Math.round(calculateSubtotal(items) * BUNDLE_DISCOUNT_RATE) : 0;
}

/** Strips control characters, collapses whitespace and caps length (for Sheets / WhatsApp text). */
export function sanitizeText(value: string, max = 200): string {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Request body for Code.gs. The server re-calculates all prices; client totals are informational only. */
export function createOrderRequest(
  orderId: string,
  customer: CustomerDetails,
  items: OrderItem[],
  extras: { key: string; hp: string; elapsedMs: number; bundle?: boolean }
) {
  return {
    action: 'createOrder',
    orderId,
    key: extras.key,
    hp: extras.hp,
    elapsedMs: extras.elapsedMs,
    bundle: !!extras.bundle,
    customerName: sanitizeText(customer.fullName, 80),
    phone: customer.phone,
    email: sanitizeText(customer.email || '', 100),
    city: sanitizeText(customer.city, 60),
    address: sanitizeText(customer.address, 300),
    paymentMethod: customer.paymentMethod,
    orderNotes: sanitizeText(customer.orderNotes || '', 300),
    lines: items
      .filter(i => i.quantity > 0)
      .map(i => ({ id: i.id, name: i.name, weight: i.weight, qty: i.quantity, price: i.price }))
  };
}
