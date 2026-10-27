// Central site configuration.
// Google Sheets order receiver (Apps Script Web App URL)
export const GOOGLE_SCRIPT_URL =
  (import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined) ||
  'https://script.google.com/macros/s/AKfycbyHhXob3bxR2-TlL4F4aoEGJ6qfGoRN8kag9XOFs3cPw2wdqMpaBej1Q60r5-VejVlxTw/exec';

// Meta (Facebook) Pixel ID. Leave empty to disable tracking.
// Set it in .env.production (VITE_META_PIXEL_ID) or in your hosting dashboard.
export const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || '';
