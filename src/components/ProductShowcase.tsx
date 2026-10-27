import React, { useState, useMemo } from 'react';
import { useLang } from '../i18n';
import { ProductCard } from './ProductCard';
import { Product } from '../data/products';

interface ProductShowcaseProps {
  products: Product[];
  cartItemsMap: Record<string, number>;
  onUpdateQuantity: (productId: string, variantWeight: string, delta: number, price: number) => void;
}

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  products,
  cartItemsMap,
  onUpdateQuantity
}) => {
  const { tr } = useLang();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'murabba' | 'achar' | 'spice'>('all');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Category Pills & Manage button */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
            {tr("Available Homemade Products")}
          </h2>
          <p className="text-[11px] text-stone-500">
            {tr("Select items to add to your order. Cash on delivery all over Pakistan.")}
          </p>
        </div>

      </div>

      {/* Filter Tabs if multiple categories exist */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'murabba', label: 'Fruit Preserves (Murabba)' },
          { id: 'achar', label: 'Pickles (Achar)' },
          { id: 'spice', label: 'Spices (Masala)' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === tab.id
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tr(tab.label)}
          </button>
        ))}
      </div>

      {/* Product list with compact horizontal cards (photo on left, details on right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            cartItemsMap={cartItemsMap}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </div>
  );
};
