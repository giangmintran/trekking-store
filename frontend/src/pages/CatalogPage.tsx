import React, { useEffect, useState } from 'react';
import { Filter, X, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { api } from '../lib/api';
import { Category, ProductListItem } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CatalogPageProps {
  initialQuery?: string;
  onSelectProduct: (slug: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ initialQuery = '', onSelectProduct }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Parse initial query params if present
  useEffect(() => {
    if (initialQuery) {
      const params = new URLSearchParams(initialQuery);
      if (params.get('category')) setCategoryFilter(params.get('category')!);
      if (params.get('search')) setSearchTerm(params.get('search')!);
    }
  }, [initialQuery]);

  // Load categories
  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(console.error);
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let minPrice: number | undefined;
        let maxPrice: number | undefined;

        if (priceRange === 'under500') {
          maxPrice = 500000;
        } else if (priceRange === '500to1000') {
          minPrice = 500000;
          maxPrice = 1000000;
        } else if (priceRange === '1000to1500') {
          minPrice = 1000000;
          maxPrice = 1500000;
        } else if (priceRange === 'over1500') {
          minPrice = 1500000;
        }

        const res = await api.get<{ items: ProductListItem[]; totalItems: number }>('/products', {
          search: searchTerm,
          category: categoryFilter,
          size: selectedSize,
          color: selectedColor,
          minPrice,
          maxPrice,
          sort: sortOption,
          page,
          pageSize: 12,
        });

        setProducts(res.items);
        setTotalItems(res.totalItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryFilter, searchTerm, selectedSize, selectedColor, priceRange, sortOption, page]);

  const clearAllFilters = () => {
    setCategoryFilter('');
    setSearchTerm('');
    setSelectedSize('');
    setSelectedColor('');
    setPriceRange('');
    setSortOption('featured');
    setPage(1);
  };

  const hasActiveFilters = Boolean(categoryFilter || searchTerm || selectedSize || selectedColor || priceRange);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            {categoryFilter
              ? categories.find((c) => c.slug === categoryFilter)?.name || 'Bộ Sưu Tập'
              : searchTerm
              ? `Kết quả tìm kiếm cho "${searchTerm}"`
              : 'Tất Cả Sản Phẩm Trekking'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Hiển thị {products.length} trong tổng số {totalItems} sản phẩm
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ Lọc</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            )}
          </button>

          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="bg-transparent font-medium text-stone-700 focus:outline-none"
            >
              <option value="featured">Sắp xếp: Nổi Bật</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="newest">Hàng Mới Nhất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              Bộ Lọc Tìm Kiếm
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-emerald-800 hover:underline font-semibold"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Search Box */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">Tìm kiếm từ khóa</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Áo gió, quần leo núi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">Danh mục</label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCategoryFilter('');
                  setPage(1);
                }}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition ${
                  categoryFilter === '' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategoryFilter(c.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition ${
                    categoryFilter === c.slug ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">Khoảng giá</label>
            <div className="space-y-1 text-xs text-stone-600">
              {[
                { id: '', label: 'Tất cả mức giá' },
                { id: 'under500', label: 'Dưới 500.000đ' },
                { id: '500to1000', label: '500.000đ - 1.000.000đ' },
                { id: '1000to1500', label: '1.000.000đ - 1.500.000đ' },
                { id: 'over1500', label: 'Trên 1.500.000đ' },
              ].map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer py-1 px-1 rounded hover:bg-stone-50">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === p.id}
                    onChange={() => {
                      setPriceRange(p.id);
                      setPage(1);
                    }}
                    className="accent-emerald-700"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">Kích cỡ (Size)</label>
            <div className="flex flex-wrap gap-1.5">
              {['S', 'M', 'L', 'XL', 'XXL', '40', '41', '42', '45L'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedSize(selectedSize === s ? '' : s);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                    selectedSize === s
                      ? 'bg-emerald-800 text-white border-emerald-800 font-bold shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-2">Màu sắc</label>
            <div className="flex flex-wrap gap-1.5">
              {['Xanh Rêu', 'Đen Nhám', 'Xám Tro', 'Cam', 'Khaki', 'Xanh Navy'].map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    setSelectedColor(selectedColor === col ? '' : col);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs transition border ${
                    selectedColor === col
                      ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-12 text-center">
              <p className="text-base font-semibold text-stone-700 mb-2">Không tìm thấy sản phẩm nào</p>
              <p className="text-xs text-stone-400 mb-6 max-w-sm mx-auto">
                Hãy thử chọn bộ lọc khác hoặc tìm kiếm với từ khóa ngắn gọn hơn.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={(slug) => onSelectProduct(slug)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="font-bold text-sm">Bộ Lọc Sản Phẩm</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2">Danh mục</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2">Khoảng giá</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg"
              >
                <option value="">Tất cả mức giá</option>
                <option value="under500">Dưới 500.000đ</option>
                <option value="500to1000">500.000đ - 1.000.000đ</option>
                <option value="1000to1500">1.000.000đ - 1.500.000đ</option>
                <option value="over1500">Trên 1.500.000đ</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs border border-stone-300 rounded-lg"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2 text-xs bg-emerald-800 text-white rounded-lg font-bold"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

