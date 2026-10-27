import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/800.css';
import '@fontsource/noto-nastaliq-urdu/400.css';
import '@fontsource/noto-nastaliq-urdu/600.css';
import '@fontsource/noto-nastaliq-urdu/700.css';
import './index.css';
import { initPixel } from './utils/pixel';
import { LangProvider } from './i18n';
import { LivePurchasePopup } from './components/LivePurchasePopup';
import { TrackOrder } from './components/TrackOrder';

initPixel();

createRoot(document.getElementById('root')!).render(<LangProvider><App /><TrackOrder /><LivePurchasePopup /></LangProvider>);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
