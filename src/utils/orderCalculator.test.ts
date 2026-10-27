import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubtotal,
  calculateShipping,
  calculateOrderTotal,
  formatPKR,
  validatePakistaniPhone,
  generateWhatsAppMessage,
  createSheetsPayload
} from './orderCalculator.ts';
import type { OrderItem, CustomerDetails } from './orderCalculator.ts';

test('calculateSubtotal sums up price * quantity accurately', () => {
  const items: OrderItem[] = [
    { id: '1', name: 'Mango Murabba', urduName: 'عام کا مربہ', weight: '500g', price: 850, quantity: 2, image: '' },
    { id: '2', name: 'Lasoora Achar', urduName: 'لسوڑا اچار', weight: '500g', price: 750, quantity: 1, image: '' }
  ];
  // 850 * 2 = 1700 + 750 = 2450
  assert.equal(calculateSubtotal(items), 2450);
});

test('calculateShipping applies standard shipping fee under threshold', () => {
  assert.equal(calculateShipping(0), 0);
  assert.equal(calculateShipping(1500), 200);
  assert.equal(calculateShipping(2499), 200);
});

test('calculateShipping gives free shipping at or above Rs. 2500 threshold', () => {
  assert.equal(calculateShipping(2500), 0);
  assert.equal(calculateShipping(3200), 0);
});

test('calculateOrderTotal calculates total with shipping included', () => {
  assert.equal(calculateOrderTotal(2450, 200), 2650);
  assert.equal(calculateOrderTotal(2600, 0), 2600);
});

test('formatPKR formats currency with Pakistani standard commas', () => {
  assert.equal(formatPKR(850), 'Rs. 850');
  assert.equal(formatPKR(2500), 'Rs. 2,500');
  assert.equal(formatPKR(125000), 'Rs. 125,000');
});

test('validatePakistaniPhone validates various Pakistani phone formats', () => {
  // Standard 11 digit 03xx
  const v1 = validatePakistaniPhone('03001234567');
  assert.equal(v1.isValid, true);
  assert.equal(v1.cleaned, '03001234567');
  assert.equal(v1.formatted, '0300-1234567');

  // With spaces and hyphens
  const v2 = validatePakistaniPhone('0321 987-6543');
  assert.equal(v2.isValid, true);
  assert.equal(v2.cleaned, '03219876543');

  // With +92 country code
  const v3 = validatePakistaniPhone('+92 345 1122334');
  assert.equal(v3.isValid, true);
  assert.equal(v3.cleaned, '03451122334');

  // Invalid formats
  assert.equal(validatePakistaniPhone('123456').isValid, false);
  assert.equal(validatePakistaniPhone('04231234567').isValid, false); // PTCL landline prefix
  assert.equal(validatePakistaniPhone('').isValid, false);
});

test('generateWhatsAppMessage creates appetizing structured message', () => {
  const customer: CustomerDetails = {
    fullName: 'Hamza Khan',
    phone: '0300-1234567',
    city: 'Lahore',
    address: 'House 42, Street 5, Gulberg III',
    paymentMethod: 'COD'
  };
  const items: OrderItem[] = [
    { id: '1', name: 'Mango Murabba', urduName: '', weight: '500g', price: 850, quantity: 2, image: '' }
  ];
  const msg = generateWhatsAppMessage('AF-1092', customer, items, 1700, 200, 1900);
  assert.match(msg, /Salam Aromatic Foods!/);
  assert.match(msg, /AF-1092/);
  assert.match(msg, /Hamza Khan/);
  assert.match(msg, /Mango Murabba/);
  assert.match(msg, /Rs\. 1,900/);
});

test('createSheetsPayload produces correct payload object', () => {
  const customer: CustomerDetails = {
    fullName: 'Ayesha Siddiqui',
    phone: '0333-7654321',
    email: 'ayesha@example.com',
    city: 'Karachi',
    address: 'Clifton Block 4',
    paymentMethod: 'COD',
    orderNotes: 'Please deliver after 2 PM'
  };
  const items: OrderItem[] = [
    { id: 'm1', name: 'Kashmiri Apple Murabba', urduName: '', weight: '1kg', price: 1800, quantity: 1, image: '' }
  ];
  const payload = createSheetsPayload('AF-9988', customer, items, 1800, 200, 2000);
  assert.equal(payload.orderId, 'AF-9988');
  assert.equal(payload.customerName, 'Ayesha Siddiqui');
  assert.equal(payload.city, 'Karachi');
  assert.equal(payload.total, 2000);
  assert.equal(payload.orderNotes, 'Please deliver after 2 PM');
});

import { calculateBundleDiscount, sanitizeText, createOrderRequest } from './orderCalculator.ts';

const two = (q: number): OrderItem[] => [{ id: 'a', name: 'A', weight: '500g', price: 1000, quantity: q, image: '' }];

test('bundle discount: 10% only for bundle with 3+ units', () => {
  assert.equal(calculateBundleDiscount(two(3), true), 300);
  assert.equal(calculateBundleDiscount(two(2), true), 0);
  assert.equal(calculateBundleDiscount(two(3), false), 0);
});

test('sanitizeText strips control chars and caps length', () => {
  assert.equal(sanitizeText('  a\u0000b\n\nc  ', 10), 'a b c');
  assert.equal(sanitizeText('x'.repeat(500), 50).length, 50);
});

test('createOrderRequest carries lines + anti-bot fields', () => {
  const c: CustomerDetails = { fullName: 'Ali', phone: '0303-4605255', city: 'Multan', address: 'Street 1, Multan', paymentMethod: 'COD' };
  const r = createOrderRequest('AF-1', c, two(2), { key: 'k1', hp: '', elapsedMs: 9000, bundle: false });
  assert.equal(r.lines.length, 1);
  assert.equal(r.lines[0].qty, 2);
  assert.equal(r.key, 'k1');
});
