import React from 'react';
import { ShoppingBag, Star, Sparkles } from 'lucide-react';
import { ProductListItem } from '../types';
import { formatVND } from '../lib/api';

interface ProductCardProps {
  product: ProductListItem;
  onSelect: (slug: string) => void;
  onQuickAdd?: (product: ProductListItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const discountPercent = product.originalPrice && product.originalPrice > product.basePrice
    ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelect(product.slug)}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
        <img
          src={product.thumbnailUrl || 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.isNew && (
            <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              MỚI
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {product.totalStock <= 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
              TẠM HẾT HÀNG
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-emerald-800">{product.categoryName}</span>
            <span className="text-stone-400">{product.brand}</span>
          </div>

          <h3 className="font-semibold text-sm text-stone-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-stone-500 text-xs line-clamp-1 mb-2">
              {product.shortDescription}
            </p>
          )}

          {/* Color & Size quick info */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {product.availableColors.slice(0, 3).map((col, idx) => (
              <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                {col}
              </span>
            ))}
            {product.availableSizes.slice(0, 3).map((s, idx) => (
              <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-base text-stone-900">
              {formatVND(product.basePrice)}
            </div>
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <div className="text-xs text-stone-400 line-through">
                {formatVND(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product.slug);
            }}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-emerald-700 hover:text-white text-stone-700 flex items-center justify-center transition shadow-sm"
            title="Xem chi tiết & chọn size"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

