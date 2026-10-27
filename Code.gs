/**
 * Aromatic Foods - Secure Order Backend (Google Apps Script)
 * Setup: Extensions > Apps Script > paste > Deploy as Web app (Execute as: Me, Access: Anyone).
 * Then: Project Settings > Script properties > add OWNER_EMAIL = your email (for new-order alerts).
 * Create a sheet tab "Products" with columns: id | weight | price | inStock (run `npm run export-catalog`, paste CSV).
 * Client posts text/plain JSON. Routes: createOrder (default), trackOrder, recentOrders.
 */
var CFG = {
  FREE_SHIPPING: 2500, SHIPPING: 200, BUNDLE_MIN: 3, BUNDLE_RATE: 0.10,
  MAX_LINES: 30, MAX_QTY: 20, MIN_FILL_MS: 3000, RATE_SECONDS: 60,
  CITIES_MAX: 60, PAYMENTS: ['COD', 'EASYPAISA', 'JAZZCASH', 'BANK']
};
var HEADERS = ['Timestamp','Order ID','Customer Name','WhatsApp / Phone','Email','City','Delivery Address',
  'Items Ordered','Subtotal (PKR)','Shipping (PKR)','Total (PKR)','Payment Method','Order Notes','Order Status',
  'Discount (PKR)','Tracking No','Key','Price Check'];

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function fail_(msg) { return json_({ status: 'error', message: msg }); }

// Neutralise control chars + spreadsheet formula injection.
function safe_(v, max) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function phone_(p) {
  var d = String(p || '').replace(/\D/g, '');
  if (d.indexOf('0092') === 0 && d.length === 14) d = '0' + d.slice(4);
  else if (d.indexOf('92') === 0 && d.length === 12) d = '0' + d.slice(2);
  return /^03\d{9}$/.test(d) ? d : '';
}
function sheet_(name) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sh = doc.getSheetByName(name) || (name === 'Orders' ? doc.getActiveSheet() : doc.insertSheet(name));
  return sh;
}
function ordersSheet_() {
  var sh = sheet_('Orders');
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setBackground('#78350F').setFontColor('#FFFFFF').setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(2, 14, 998, 1).setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(['New / Pending Confirmation','Confirmed','Dispatched','Delivered','Cancelled'], true).build());
  } else if (sh.getRange(1, 15).getValue() === '') {
    sh.getRange(1, 15, 1, 4).setValues([HEADERS.slice(14)]);
  }
  return sh;
}
function prices_() {
  var cache = CacheService.getScriptCache(), hit = cache.get('prices');
  if (hit) return JSON.parse(hit);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Products'), map = {};
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().forEach(function (r) {
      if (r[0]) map[r[0] + '|' + r[1]] = { price: Number(r[2]) || 0, inStock: String(r[3]).toLowerCase() !== 'false' };
    });
  }
  cache.put('prices', JSON.stringify(map), 300);
  return map;
}
function logError_(err, raw) {
  try { sheet_('Errors').appendRow([new Date(), String(err), String(raw || '').slice(0, 500)]); } catch (e) {}
}

function doPost(e) {
  var raw = e && e.postData ? e.postData.contents : '';
  var data;
  try { data = JSON.parse(raw); } catch (err) { return fail_('Invalid request'); }
  try {
    if (data.action === 'trackOrder') return track_(data);
    if (data.action === 'recentOrders') return recent_();
    return create_(data, raw);
  } catch (error) { logError_(error, raw); return fail_('Server error, please order via WhatsApp'); }
}

function create_(d, raw) {
  var cache = CacheService.getScriptCache();
  // Bot filters: honeypot + too-fast submit
  if (d.hp) return json_({ status: 'success', orderId: 'AF-000000' });
  if (Number(d.elapsedMs) < CFG.MIN_FILL_MS) return fail_('Please try again');

  var key = safe_(d.key, 64);
  if (!key) return fail_('Missing key');
  var prev = cache.get('k_' + key);               // idempotent retry -> same answer, no new row
  if (prev) return json_(JSON.parse(prev));

  var phone = phone_(d.phone);
  if (!phone) return fail_('Invalid phone (use 03XXXXXXXXX)');
  var name = safe_(d.customerName, 80), address = safe_(d.address, 300), city = safe_(d.city, CFG.CITIES_MAX);
  if (name.length < 2 || address.length < 5 || !city) return fail_('Missing details');
  var payment = CFG.PAYMENTS.indexOf(d.paymentMethod) > -1 ? d.paymentMethod : 'COD';
  if (cache.get('rl_' + phone)) return fail_('Please wait a minute before ordering again');

  var lines = Array.isArray(d.lines) ? d.lines.slice(0, CFG.MAX_LINES) : [];
  if (!lines.length) return fail_('Cart is empty');
  var map = prices_(), verified = Object.keys(map).length > 0, subtotal = 0, units = 0, parts = [];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i], qty = Math.floor(Number(l.qty));
    if (!(qty >= 1 && qty <= CFG.MAX_QTY)) return fail_('Invalid quantity');
    var id = safe_(l.id, 60), weight = safe_(l.weight, 30), price;
    if (verified) {
      var p = map[id + '|' + weight];
      if (!p || !p.inStock) return fail_('Item unavailable: ' + safe_(l.name, 60));
      price = p.price;
    } else { price = Math.max(0, Number(l.price) || 0); }
    subtotal += price * qty; units += qty;
    parts.push(safe_(l.name, 60) + ' [' + weight + '] (x' + qty + ')');
  }
  var discount = (d.bundle === true && units >= CFG.BUNDLE_MIN) ? Math.round(subtotal * CFG.BUNDLE_RATE) : 0;
  var net = subtotal - discount, shipping = net >= CFG.FREE_SHIPPING ? 0 : CFG.SHIPPING, total = net + shipping;
  var orderId = 'AF-' + Math.floor(100000 + Math.random() * 900000);

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ordersSheet_().appendRow([
      Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyy-MM-dd HH:mm:ss'), orderId, name, phone,
      safe_(d.email, 100) || 'N/A', city, address, parts.join('; '), subtotal, shipping, total, payment,
      safe_(d.orderNotes, 300), 'New / Pending Confirmation', discount, '', key,
      verified ? 'Verified' : 'UNVERIFIED - add Products sheet'
    ]);
  } finally { lock.releaseLock(); }

  var res = { status: 'success', orderId: orderId, subtotal: subtotal, discount: discount, shipping: shipping, total: total };
  cache.put('k_' + key, JSON.stringify(res), 21600);
  cache.put('rl_' + phone, '1', CFG.RATE_SECONDS);
  var owner = PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  if (owner) {
    try { MailApp.sendEmail(owner, 'New order ' + orderId + ' - Rs. ' + total,
      name + ' | ' + phone + ' | ' + city + '\n' + parts.join('\n') + '\nTotal: Rs. ' + total + ' (' + payment + ')'); }
    catch (err) { logError_(err, orderId); }
  }
  return json_(res);
}

function track_(d) {
  var cache = CacheService.getScriptCache(), phone = phone_(d.phone), id = safe_(d.orderId, 20);
  var rk = 'tr_' + phone, n = Number(cache.get(rk) || 0);
  if (!phone || !id || n >= 5) return fail_('Not found');
  cache.put(rk, String(n + 1), 60);
  var sh = ordersSheet_(), rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 16).getValues() : [];
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][1]) === id && phone_(rows[i][3]) === phone)
      return json_({ status: 'success', orderStatus: rows[i][13], trackingNo: rows[i][15] || '' });
  }
  return fail_('Not found');
}

function recent_() {   // Anonymised: first name + city + product only. Hidden until 5+ real orders.
  var sh = ordersSheet_(), last = sh.getLastRow();
  if (last < 6) return json_({ status: 'success', items: [] });
  var start = Math.max(2, last - 9);
  var items = sh.getRange(start, 1, last - start + 1, 14).getValues().filter(function (r) { return r[13] !== 'Cancelled'; })
    .map(function (r) { return { name: String(r[2]).split(' ')[0].replace(/^'/, ''), city: r[5], product: String(r[7]).split(' [')[0].replace(/^'/, '') }; });
  return json_({ status: 'success', items: items });
}

function doGet() { return json_({ status: 'active', service: 'Aromatic Foods Order Webhook' }); }

// Run once from the editor to enable the daily backup.
function installBackupTrigger() {
  ScriptApp.newTrigger('dailyBackup').timeBased().everyDays(1).atHour(3).create();
}
function dailyBackup() {
  var f = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId());
  f.makeCopy('Aromatic Foods Orders backup ' + Utilities.formatDate(new Date(), 'Asia/Karachi', 'yyyy-MM-dd'));
}
