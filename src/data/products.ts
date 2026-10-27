export interface ProductVariant {
  weight: string;
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'murabba' | 'achar' | 'spice';
  price: number;
  originalPrice?: number;
  weight: string;
  /** Available sizes. The first one is the default (price/weight above must match it). */
  variants?: ProductVariant[];
  description: string;
  image: string;
  badge?: string;
  inStock: boolean;
}

export const STORE_INFO = {
  name: "Aromatic Foods",
  tagline: "Homemade Preserves, Pickle & Spices",
  instagram: "@aromafoods.store",
  whatsapp: "+92 303 4605255",
  whatsappRaw: "923034605255",
  location: "Canal Bank, 10-km G.T Road, Qadirpur Raan, Multan, Pakistan",
  deliveryNote: "Freshly Made & Delivered to Your Door Nationwide via TCS / Leopards"
};

export const PAKISTANI_CITIES = [
  "Multan",
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Bahawalpur",
  "Sargodha",
  "Hyderabad",
  "Abbottabad",
  "Rahim Yar Khan",
  "Sahiwal",
  "Sheikhupura",
  "Jhelum",
  "Gujrat",
  "Dera Ghazi Khan",
  "Mardan",
  "Sukkur",
  "Muzaffarabad",
  "Mirpur (AJK)",
  "Other City / Village"
];

export const PRODUCTS_CATALOG: Product[] = [
  // ---------- Murabba (fruit preserves) ----------
  {
    id: "mango-preserve",
    name: "Mango Murabba",
    subtitle: "Aam ka Murabba • From Mama's Kitchen",
    category: "murabba",
    price: 650,
    weight: "400g",
    variants: [
      { weight: "400g", price: 650 },
      { weight: "180g", price: 450 }
    ],
    description: "Mango pieces slow-cooked in sweet syrup. Homemade taste, packed in a glass jar.",
    image: "/products/mango-preserve.webp",
    inStock: true
  },
  {
    id: "falsa-berry-preserve",
    name: "Falsa Murabba",
    subtitle: "Falsa ka Murabba • From Mama's Kitchen",
    category: "murabba",
    price: 650,
    weight: "380g",
    variants: [
      { weight: "380g", price: 650 },
      { weight: "180g", price: 450 }
    ],
    description: "Falsa berries preserved in sweet syrup the traditional way. Homemade, in a glass jar.",
    image: "/products/falsa-berry-preserve.webp",
    inStock: true
  },

  // ---------- Achar (pickle) ----------
  {
    id: "glue-berry-pickle",
    name: "Lasoora Achar (Glue Berry Pickle)",
    subtitle: "Seedless • From Mama's Kitchen",
    category: "achar",
    price: 650,
    weight: "300g",
    variants: [
      { weight: "300g", price: 650 },
      { weight: "125g", price: 450 }
    ],
    description: "Seedless lasoora (glue berry) pickle with traditional spices. Homemade, in a glass jar.",
    image: "/products/glue-berry-pickle.webp",
    inStock: true
  },

  // ---------- Spices (100g / 250g pouches) ----------
  {
    id: "spice-chili-powder",
    name: "Chili Powder (Lal Mirch)",
    subtitle: "Freshly ground • Hot flavour",
    category: "spice",
    price: 90,
    weight: "100g",
    variants: [
      { weight: "100g", price: 90 },
      { weight: "250g", price: 230 }
    ],
    description: "Aromatic Foods lal mirch powder, freshly ground. Pouch pack.",
    image: "/products/spice-chili-powder.webp",
    inStock: true
  },
  {
    id: "spice-chili-crushed",
    name: "Chili Crushed (Kuti Lal Mirch)",
    subtitle: "Freshly ground • Hot flavour",
    category: "spice",
    price: 100,
    weight: "100g",
    variants: [
      { weight: "100g", price: 100 },
      { weight: "250g", price: 240 }
    ],
    description: "Aromatic Foods crushed red chili (kuti lal mirch). Pouch pack.",
    image: "/products/spice-chili-crushed.webp",
    inStock: true
  },
  {
    id: "spice-haldi",
    name: "Haldi Powder (Turmeric)",
    subtitle: "Rich yellow • Original flavour",
    category: "spice",
    price: 80,
    weight: "100g",
    variants: [
      { weight: "100g", price: 80 },
      { weight: "250g", price: 200 }
    ],
    description: "Aromatic Foods haldi (turmeric) powder. Pouch pack.",
    image: "/products/spice-haldi.webp",
    inStock: true
  },
  {
    id: "spice-dhaniya",
    name: "Dhaniya Powder (Coriander)",
    subtitle: "Strong aroma • Fresh & clean",
    category: "spice",
    price: 70,
    weight: "100g",
    variants: [
      { weight: "100g", price: 70 },
      { weight: "250g", price: 180 }
    ],
    description: "Aromatic Foods dhaniya (coriander) powder. Pouch pack.",
    image: "/products/spice-dhaniya.webp",
    inStock: true
  },
  {
    id: "spice-garam-masala-powder",
    name: "Garam Masala Powder",
    subtitle: "Hot flavour • Pure aroma",
    category: "spice",
    price: 250,
    weight: "100g",
    variants: [
      { weight: "100g", price: 250 },
      { weight: "250g", price: 620 }
    ],
    description: "Aromatic Foods garam masala powder. Pouch pack.",
    image: "/products/spice-garam-masala-powder.webp",
    inStock: true
  },
  {
    id: "spice-garam-masala-whole",
    name: "Garam Masala Sabut (Whole)",
    subtitle: "Whole spices • Hot flavour",
    category: "spice",
    price: 250,
    weight: "100g",
    variants: [
      { weight: "100g", price: 250 },
      { weight: "250g", price: 620 }
    ],
    description: "Aromatic Foods whole garam masala (sabut). Pouch pack.",
    image: "/products/spice-garam-masala-whole.webp",
    inStock: true
  },
  {
    id: "spice-black-pepper",
    name: "Black Pepper Powder (Kali Mirch)",
    subtitle: "Freshly ground",
    category: "spice",
    price: 390,
    weight: "100g",
    description: "Aromatic Foods kali mirch (black pepper) powder. Pouch pack.",
    image: "/products/spice-black-pepper.webp",
    inStock: true
  }
];

export const TRUST_PILLARS = [
  {
    title: "100% Pure Mustard Oil",
    urdu: "خالص کوہلو سرسوں کا تیل",
    description: "Traditional cold-pressed mustard oil with zero synthetic preservatives."
  },
  {
    title: "Freshly Made in Multan",
    urdu: "ملتان کی گھریلو تیاری",
    description: "Prepared in hygienic small batches and packed in leak-proof jars."
  },
  {
    title: "Nationwide COD",
    urdu: "کیش آن ڈیلیوری",
    description: "Comfortably pay cash to the rider at your doorstep anywhere in Pakistan."
  }
];

export const TESTIMONIALS = [
  {
    name: "Usman Tariq",
    city: "Lahore",
    rating: 5,
    comment: "The Mango Preserve and Lasoora Achar taste exactly like authentic homemade achar. 10/10 recommended!",
    product: "Mango Preserve"
  },
  {
    name: "Dr. Ayesha",
    city: "Islamabad",
    rating: 5,
    comment: "Delivered safely via TCS with bubble wrap. Fresh taste and very reasonable price.",
    product: "Kitchen 3 Cheezen Deal"
  }
];

