# Aromatic Foods - Achar & Murabba store

React + Vite + Tailwind storefront. Orders go to WhatsApp and to a Google Sheet (Apps Script).

## Before going live
1. Edit `.env.production`:
   - `VITE_SITE_URL` = your final website address (for share preview image)
   - `VITE_META_PIXEL_ID` = your Meta Pixel ID (from Events Manager)
2. Product photos live in `public/products/` (spice pouch photos are crops of the catalog page; replace with real pouch photos when available, same file names).
3. Share-preview banner: `public/og-image.jpg` (1200x630).
4. Products and prices are edited ONLY in `src/data/products.ts`, then redeploy.
5. Google Sheet order receiver: `Code.gs` (already deployed; URL is in `src/config.ts`).

## Run
```
npm install
npm run dev      # local test
npm run build    # production build in /dist
```

Pages: `/` (shop), `/privacy.html`, `/contact.html`.
Meta Pixel events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase (on order), Contact (WhatsApp click).
