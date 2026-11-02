import React, { useEffect, useState } from 'react';
import { Compass, ArrowRight, ShieldCheck, Flame, Sparkles, Mountain, Layers, Eye } from 'lucide-react';
import { api } from '../lib/api';
import { Banner, Category, ProductListItem } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bannersRes, catsRes, prodsRes] = await Promise.all([
          api.get<Banner[]>('/products/banners'),
          api.get<Category[]>('/categories'),
          api.get<{ items: ProductListItem[] }>('/products?pageSize=8'),
        ]);

        setBanners(bannersRes);
        setCategories(catsRes);
        setProducts(prodsRes.items);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroBanner = banners[0] || {
    title: 'Chinh Phục Mọi Đỉnh Cao Cùng Trekking Pro',
    subtitle: 'Trang phục dã ngoại công nghệ Gore-Tex & Quick-Dry giảm đến 30%',
    imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1600&auto=format&fit=crop',
    linkUrl: '/san-pham',
  };

  return (
    <div className="space-y-16">
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex items-center bg-stone-900 mx-4 sm:mx-6 lg:mx-8 mt-4">
        <img
          src={heroBanner.imageUrl}
          alt={heroBanner.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />

        <div className="relative max-w-2xl p-8 sm:p-14 text-white space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>MÙA TREKKING TÂY BẮC 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {heroBanner.title}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
            {heroBanner.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-900/50 transition flex items-center gap-2 group"
            >
              <span>Xem Bộ Sưu Tập</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('catalog', 'category=ao-trekking')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm px-6 py-3.5 rounded-xl backdrop-blur-md transition"
            >
              Áo Gió Chống Nước
            </button>
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-stone-900">Danh Mục Chuyên Dụng</h2>
          <p className="text-xs text-stone-500 mt-1">Được kiểm nghiệm thực tế trên các cung Fansipan, Tà Xùa, Lảo Thẩn</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('catalog', `category=${cat.slug}`)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-bold text-sm sm:text-base group-hover:text-emerald-300 transition leading-snug">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Khám phá</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Sản Phẩm Nổi Bật</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Trang Phục Bán Chạy Nhất</h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-stone-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(slug) => onSelectProduct(slug)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Technology Highlight Section */}
      <section className="bg-stone-900 text-white py-16 mx-4 sm:mx-6 lg:mx-8 rounded-3xl overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
              CÔNG NGHỆ CHẤT LIỆU ĐỈNH CAO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Gore-Tex 3 Lớp & Quick-Dry Thoát Khí Siêu Tốc
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Mỗi sợi vải được thiết kế để chống lại sự khắc nghiệt của thời tiết nhiệt đới gió mùa: màng thở 1 tỷ lỗ siêu nhỏ trên mỗi cm² ngăn hạt mưa lớn lọt vào nhưng cho phép hơi ẩm mồ hôi thoát ra dễ dàng.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-stone-800 bg-stone-800/50 p-4 rounded-xl">
                <Mountain className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm">Chống Nước 20.000mm</h4>
                <p className="text-xs text-stone-400 mt-1">Chịu được mưa rào xối xả liên tục suốt 6 giờ</p>
              </div>
              <div className="border border-stone-800 bg-stone-800/50 p-4 rounded-xl">
                <Layers className="w-6 h-6 text-emerald-400 mb-2" />
                <h4 className="font-bold text-sm">Chống Xước Ripstop</h4>
                <p className="text-xs text-stone-400 mt-1">Sợi nylon gia cường ô vuông chống gai rừng</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-stone-800">
            <img
              src="https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop"
              alt="Gore-Tex Fabric detail"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

