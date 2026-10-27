import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'ur';

const DICT = {
  en: {
    announce: '100% Homemade Pickles & Fruit Preserves',
    freeDelivery: 'Free Delivery above Rs. 2,500',
    navSub: 'Multan • Homemade Achar & Murabba',
    order: 'Order',
    whatsapp: 'WhatsApp',
    badge: "Multani Homemade Flavors • From Mama's Kitchen",
    heroTitle: 'Achar, Murabba & Spices',
    heroSub: 'Homemade achar and murabba in glass jars, plus freshly ground masala in pouch packs. Made in Multan, delivered all over Pakistan with cash on delivery.',
    shopNow: 'Shop Now',
    waOrder: 'Order on WhatsApp',
    cod: 'Nationwide Cash on Delivery',
    pack: 'Hygienic Leak-Proof Packaging',
    city: 'Multan, Pakistan',
    waHello: 'Salam Aromatic Foods! I want to inquire about your homemade products.',
    switchTo: 'اردو'
  },
  ur: {
    announce: '۱۰۰٪ گھر کے بنے اچار اور مربے',
    freeDelivery: '2,500 روپے سے اوپر ڈیلیوری مفت',
    navSub: 'ملتان • گھر کا اچار اور مربہ',
    order: 'آرڈر',
    whatsapp: 'واٹس ایپ',
    badge: 'ملتانی گھریلو ذائقے • امی کے کچن سے',
    heroTitle: 'اچار، مربہ اور مصالحے',
    heroSub: 'شیشے کے جار میں گھر کا بنا اچار اور مربہ، اور پاؤچ میں تازہ پسا مصالحہ۔ ملتان میں تیار، پورے پاکستان میں کیش آن ڈیلیوری۔',
    shopNow: 'ابھی خریدیں',
    waOrder: 'واٹس ایپ پر آرڈر کریں',
    cod: 'پورے پاکستان میں کیش آن ڈیلیوری',
    pack: 'صاف ستھری لیک پروف پیکنگ',
    city: 'ملتان، پاکستان',
    waHello: 'السلام علیکم آروماٹک فوڈز! مجھے آپ کی گھریلو مصنوعات کے بارے میں معلومات چاہیے۔',
    switchTo: 'English'
  }
} as const;

export type TKey = keyof typeof DICT.en;

const UR: Record<string, string> = {
 "Mango Murabba": "آم کا مربہ",
 "Falsa Murabba": "فالسے کا مربہ",
 "Lasoora Achar (Glue Berry Pickle)": "لسوڑے کا اچار (بغیر گٹھلی)",
 "Chili Powder (Lal Mirch)": "لال مرچ پاؤڈر",
 "Chili Crushed (Kuti Lal Mirch)": "کٹی لال مرچ",
 "Haldi Powder (Turmeric)": "ہلدی پاؤڈر",
 "Dhaniya Powder (Coriander)": "دھنیا پاؤڈر",
 "Garam Masala Powder": "گرم مصالحہ پاؤڈر",
 "Garam Masala Sabut (Whole)": "گرم مصالحہ ثابت",
 "Black Pepper Powder (Kali Mirch)": "کالی مرچ پاؤڈر",
 "Aam ka Murabba • From Mama's Kitchen": "امی کے کچن سے • آم کا مربہ",
 "Falsa ka Murabba • From Mama's Kitchen": "امی کے کچن سے • فالسے کا مربہ",
 "Seedless • From Mama's Kitchen": "بغیر گٹھلی • امی کے کچن سے",
 "Freshly ground • Hot flavour": "تازہ پسا • تیز ذائقہ",
 "Rich yellow • Original flavour": "گہرا پیلا • اصل ذائقہ",
 "Strong aroma • Fresh & clean": "تیز خوشبو • تازہ اور صاف",
 "Hot flavour • Pure aroma": "تیز ذائقہ • خالص خوشبو",
 "Whole spices • Hot flavour": "ثابت مصالحے • تیز ذائقہ",
 "Freshly ground": "تازہ پسا ہوا",
 "Available Homemade Products": "دستیاب گھریلو مصنوعات",
 "Select items to add to your order. Cash on delivery all over Pakistan.": "آرڈر کے لیے چیزیں چنیں۔ پورے پاکستان میں کیش آن ڈیلیوری۔",
 "All Items": "تمام اشیاء",
 "Fruit Preserves (Murabba)": "پھلوں کے مربے",
 "Pickles (Achar)": "اچار",
 "Spices (Masala)": "مصالحے",
 "Add": "شامل کریں",
 "Clear": "صاف کریں",
 "No product selected yet. Click \"+ Add\" on any item above.": "ابھی کوئی چیز منتخب نہیں۔ اوپر \"شامل کریں\" دبائیں۔",
 "Full Name *": "پورا نام *",
 "WhatsApp / Mobile Number *": "واٹس ایپ / موبائل نمبر *",
 "City *": "شہر *",
 "Delivery Address *": "ڈیلیوری ایڈریس *",
 "Payment Option *": "ادائیگی کا طریقہ *",
 "Cash on Delivery": "کیش آن ڈیلیوری",
 "EasyPaisa / JazzCash": "ایزی پیسہ / جاز کیش",
 "Subtotal:": "سب ٹوٹل:",
 "Delivery:": "ڈیلیوری:",
 "Total Amount:": "کل رقم:",
 "Order Place Karein (WhatsApp Par Bhejein)": "آرڈر کریں (واٹس ایپ پر بھیجیں)",
 "Nationwide COD": "پورے پاکستان میں COD",
 "FREE": "مفت",
 "✓ Free Delivery Unlocked!": "✓ مفت ڈیلیوری مل گئی!",
 "Selected Products": "منتخب مصنوعات",
 "e.g. Muhammad Usman": "مثلاً محمد عثمان",
 "House #, Street, Colony or Mohalla...": "مکان نمبر، گلی، کالونی یا محلہ...",
 "Homemade Preserves, Pickles & Spices. Freshly made & delivered to your door from Multan, Pakistan.": "گھر کے بنے مربے، اچار اور مصالحے۔ ملتان سے تازہ تیار اور آپ کے دروازے تک۔",
 "Privacy Policy": "پرائیویسی پالیسی",
 "Contact Us": "ہم سے رابطہ",
 "WhatsApp: 0303-4605255": "واٹس ایپ: 0303-4605255",
 "All rights reserved.": "جملہ حقوق محفوظ ہیں۔",
 "Build Your Box": "اپنا باکس بنائیں",
 "Pick 3 or more items and get 10% off": "3 یا زیادہ چیزیں چنیں اور 10٪ رعایت پائیں",
 "Your box is empty — tap items to add": "باکس خالی ہے — چیزوں پر ٹیپ کریں",
 "Add Box to Order": "باکس آرڈر میں شامل کریں",
 "Box added to your order ✓": "باکس آپ کے آرڈر میں شامل ہو گیا ✓",
 "Box total": "باکس کی رقم",
 "You save": "آپ کی بچت"
};

interface LangCtx { lang: Lang; t: (k: TKey) => string; tr: (s: string) => string; toggle: () => void; }
const Ctx = createContext<LangCtx>({ lang: 'en', t: k => DICT.en[k], tr: s => s, toggle: () => {} });

const KEY = 'af_lang';

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try { return localStorage.getItem(KEY) === 'ur' ? 'ur' : 'en'; } catch { return 'en'; }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.classList.toggle('lang-ur', lang === 'ur');
    try { localStorage.setItem(KEY, lang); } catch { /* storage blocked */ }
  }, [lang]);

  const toggle = useCallback(() => setLang(l => (l === 'en' ? 'ur' : 'en')), []);
  const value = useMemo<LangCtx>(() => ({ lang, toggle, t: k => DICT[lang][k], tr: s => (lang === 'ur' ? UR[s] ?? s : s) }), [lang, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useLang = () => useContext(Ctx);
