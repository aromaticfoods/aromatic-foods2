import React, { useState } from 'react';
import { useLang } from '../i18n';
import { Plus, Minus } from 'lucide-react';
import { Product } from '../data/products';
import { formatPKR } from '../utils/orderCalculator';

interface ProductCardProps {
  product: Product;
  cartItemsMap: Record<string, number>;
  onUpdateQuantity: (productId: string, variantWeight: string, delta: number, price: number) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartItemsMap,
  onUpdateQuantity
}) => {
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ weight: product.weight, price: product.price }];
  const { tr } = useLang();
  const [selectedWeight, setSelectedWeight] = useState(variants[0].weight);
  const selected = variants.find(v => v.weight === selectedWeight) || variants[0];
  const currentQuantity = cartItemsMap[`${product.id}-${selected.weight}`] || 0;

  const handleAdd = () => {
    onUpdateQuantity(product.id, selected.weight, 1, selected.price);
  };

  const handleSubtract = () => {
    onUpdateQuantity(product.id, selected.weight, -1, selected.price);
  };

  return (
    <article className="bg-white rounded-2xl p-3 sm:p-3.5 border border-stone-200/90 hover:border-amber-700/40 shadow-xs hover:shadow-sm transition-all flex items-center gap-3 sm:gap-4">
      {/* Compact Product Image on the Left */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
        <img
          src={product.image}
          alt={tr(product.name)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-stone-900/85 text-white text-[9px] font-semibold tracking-wide backdrop-blur-xs">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Details right next to the image */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm sm:text-base font-bold text-stone-900 font-serif leading-snug truncate">
              {tr(product.name)}
            </h3>
            {variants.length === 1 && (
              <span className="text-[10px] sm:text-[11px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                {selected.weight}
              </span>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1 mt-0.5">
            {tr(product.subtitle)}
          </p>

          {variants.length > 1 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5" role="group" aria-label="Choose size">
              {variants.map(v => (
                <button
                  key={v.weight}
                  type="button"
                  onClick={() => setSelectedWeight(v.weight)}
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border transition-colors ${
                    v.weight === selected.weight
                      ? 'bg-amber-800 text-white border-amber-800'
                      : 'bg-white text-stone-600 border-stone-300 hover:border-amber-700'
                  }`}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add/Quantity Actions */}
        <div className="flex items-center justify-between gap-2 pt-1.5 mt-auto">
          <div>
            <span className="text-sm sm:text-base font-bold text-stone-900 font-serif">
              {formatPKR(selected.price)}
            </span>
          </div>

          <div className="shrink-0">
            {currentQuantity > 0 ? (
              <div className="flex items-center rounded-lg bg-stone-100 border border-stone-300 p-0.5">
                <button
                  type="button"
                  onClick={handleSubtract}
                  className="w-6 h-6 rounded-md bg-white text-stone-700 hover:bg-stone-50 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                  aria-label={`Reduce ${tr(product.name)} quantity`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-stone-900">
                  {currentQuantity}
                </span>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-6 h-6 rounded-md bg-amber-800 text-white hover:bg-amber-900 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                  aria-label={`Increase ${tr(product.name)} quantity`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>{tr("Add")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
