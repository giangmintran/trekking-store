import React, { useEffect, useState } from 'react';
import { ShoppingBag, Star, ShieldCheck, Check, Truck, RefreshCw, Ruler, AlertCircle, MessageSquare } from 'lucide-react';
import { api, formatVND } from '../lib/api';
import { ProductDetail } from '../types';
import { useCart } from '../context/CartContext';
import { SizeChartModal } from '../components/SizeChartModal';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected State
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'material' | 'care' | 'reviews'>('desc');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // New review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get<ProductDetail>(`/products/${slug}`);
        setProduct(res);

        // Auto select first image
        const thumb = res.images.find((i) => i.isThumbnail) || res.images[0];
        if (thumb) setActiveImage(thumb.url);

        // Auto select first variant color and size
        if (res.variants && res.variants.length > 0) {
          const firstInStock = res.variants.find((v) => v.stockQuantity > 0) || res.variants[0];
          setSelectedColor(firstInStock.colorName);
          setSelectedSize(firstInStock.size);
        }
      } catch (err: any) {
        setError(err.message || 'Không tìm thấy thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/4" />
            <div className="h-32 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-stone-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-stone-900 mb-1">Không tìm thấy sản phẩm</h2>
        <p className="text-xs text-stone-500 mb-6">{error || 'Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.'}</p>
        <button
          onClick={() => onNavigate('catalog')}
          className="bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  // Get unique colors and sizes
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.colorName))).map((colorName) => {
    const v = product.variants.find((x) => x.colorName === colorName);
    return { name: colorName, hex: v?.colorHex || '#000000' };
  });

  // Filter sizes available for the selected color
  const sizesForColor = product.variants
    .filter((v) => v.colorName === selectedColor)
    .map((v) => ({
      size: v.size,
      stock: v.stockQuantity,
      sku: v.sku,
    }));

  // Selected variant
  const currentVariant = product.variants.find(
    (v) => v.colorName === selectedColor && v.size === selectedSize
  );

  const isOutOfStock = !currentVariant || currentVariant.stockQuantity <= 0;
  const isLowStock = currentVariant && currentVariant.stockQuantity > 0 && currentVariant.stockQuantity <= 5;

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;

    addToCart({
      variantId: currentVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: currentVariant.sku,
      size: currentVariant.size,
      color: currentVariant.colorName,
      colorHex: currentVariant.colorHex,
      price: currentVariant.price,
      originalPrice: currentVariant.originalPrice,
      quantity,
      imageUrl: activeImage || product.images[0]?.url || '',
      stockQuantity: currentVariant.stockQuantity,
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await api.post(`/products/${product.id}/reviews`, {
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        purchasedVariant: currentVariant ? `${currentVariant.colorName} - Size ${currentVariant.size}` : undefined,
      });

      setReviewSuccess('Cảm ơn bạn đã gửi đánh giá!');
      setReviewComment('');
      setReviewName('');

      // Refresh product data
      const updated = await api.get<ProductDetail>(`/products/${slug}`);
      setProduct(updated);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8">
        <button onClick={() => onNavigate('home')} className="hover:text-emerald-800">Trang chủ</button>
        <span>/</span>
        <button onClick={() => onNavigate('catalog', `category=${product.categorySlug}`)} className="hover:text-emerald-800">
          {product.categoryName}
        </button>
        <span>/</span>
        <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/4.5] bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 relative shadow-inner">
            <img
              src={activeImage || product.images[0]?.url}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.originalPrice && product.originalPrice > product.basePrice && (
              <span className="absolute top-4 left-4 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                Giảm {Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    activeImage === img.url ? 'border-emerald-700 shadow-md scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.altText || product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Options */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {product.brand || 'Trekking Pro'}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-500">{product.categoryName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-3 text-xs text-stone-600">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span className="font-bold text-stone-800">5.0</span>
              <span>({product.reviews.length} đánh giá thực tế từ trekker)</span>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
              {formatVND(currentVariant?.price || product.basePrice)}
            </span>
            {(currentVariant?.originalPrice || product.originalPrice) && (
              <span className="text-sm text-stone-400 line-through">
                {formatVND(currentVariant?.originalPrice || product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-stone-800">Màu sắc:</span>
              <span className="text-emerald-800 font-semibold">{selectedColor}</span>
            </div>
            <div className="flex gap-2.5">
              {uniqueColors.map((col) => (
                <button
                  key={col.name}
                  onClick={() => {
                    setSelectedColor(col.name);
                    const availableSizes = product.variants.filter((v) => v.colorName === col.name);
                    if (availableSizes.length > 0) {
                      setSelectedSize(availableSizes[0].size);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    selectedColor === col.name
                      ? 'border-emerald-700 bg-emerald-50/50 text-emerald-900 font-bold shadow-sm ring-1 ring-emerald-700'
                      : 'border-stone-200 hover:border-stone-400 text-stone-700'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-800">Kích cỡ (Size):</span>
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Bảng chọn size</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {sizesForColor.map((s) => {
                const isSelected = selectedSize === s.size;
                const isAvail = s.stock > 0;
                return (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    disabled={!isAvail}
                    className={`min-w-[48px] px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/30'
                        : isAvail
                        ? 'bg-stone-50 border-stone-200 text-stone-800 hover:border-emerald-600'
                        : 'bg-stone-100 border-stone-200 text-stone-300 line-through cursor-not-allowed'
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Realtime Stock Indicator */}
            <div className="text-xs pt-1">
              {isOutOfStock ? (
                <span className="text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Kích cỡ này tạm thời hết hàng trong kho.
                </span>
              ) : isLowStock ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Cảnh báo: Chỉ còn lại <strong>{currentVariant?.stockQuantity}</strong> sản phẩm trong kho!
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Còn hàng sẵn sàng giao ({currentVariant?.stockQuantity} cái)
                </span>
              )}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-3 hover:bg-stone-200 text-stone-700 transition"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-stone-900">{quantity}</span>
              <button
                onClick={() => {
                  if (currentVariant && quantity < currentVariant.stockQuantity) {
                    setQuantity(quantity + 1);
                  }
                }}
                disabled={currentVariant ? quantity >= currentVariant.stockQuantity : true}
                className="px-3.5 py-3 hover:bg-stone-200 text-stone-700 transition disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{isOutOfStock ? 'Hết Hàng' : 'Thêm Vào Giỏ Hàng'}</span>
            </button>
          </div>

          {/* Quick Commitments */}
          <div className="border-t border-stone-200 pt-5 space-y-2 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Giao hàng hỏa tốc trong 2 giờ tại Hà Nội & TP.HCM</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Được mở hàng kiểm tra và thử size trước khi thanh toán</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Bảo hành chính hãng 12 tháng phụ kiện khóa kéo và đường may</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-t border-stone-200 pt-10">
        <div className="flex border-b border-stone-200 gap-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'desc' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Mô Tả Chi Tiết
          </button>
          <button
            onClick={() => setActiveTab('material')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'material' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Chất Liệu & Công Nghệ
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'care' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Hướng Dẫn Bảo Quản
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Đánh Giá ({product.reviews.length})</span>
          </button>
        </div>

        <div className="py-6 text-sm text-stone-700 leading-relaxed max-w-3xl">
          {activeTab === 'desc' && (
            <div className="space-y-4 whitespace-pre-line">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'material' && (
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-stone-900">Thông số kỹ thuật chất liệu:</h4>
              <p><strong>Thành phần vải:</strong> {product.material || 'Nylon Ripstop cao cấp kết hợp màng thở chống thấm.'}</p>
              <p><strong>Khả năng chống thấm:</strong> Áp lực cột nước 15.000mm - 20.000mm.</p>
              <p><strong>Đặc tính:</strong> Mau khô sau 20-30 phút, chống trầy xước cành gai dã ngoại, cản gió giữ ấm cơ thể.</p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-stone-900">Cách giặt & chăm sóc trang phục Outdoor:</h4>
              <p>{product.careGuide || 'Nên giặt tay bằng nước lạnh hoặc chất tẩy rửa chuyên dụng cho vải Gore-Tex. Tránh dùng nước xả vải và không sấy ở nhiệt độ cao.'}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {product.reviews.length === 0 ? (
                  <p className="text-stone-500 italic text-xs">Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ!</p>
                ) : (
                  product.reviews.map((r) => (
                    <div key={r.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-xs">{r.customerName}</span>
                        <span className="text-[11px] text-stone-400">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-500' : 'text-stone-300'}`}
                          />
                        ))}
                      </div>
                      {r.purchasedVariant && (
                        <div className="text-[11px] text-emerald-800 font-medium">
                          Đã mua: {r.purchasedVariant}
                        </div>
                      )}
                      <p className="text-xs text-stone-700">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="p-6 bg-white border border-stone-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-sm text-stone-900">Để lại đánh giá của bạn</h4>
                {reviewSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200">
                    {reviewSuccess}
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold block mb-1">Mức độ hài lòng</label>
                  <div className="flex gap-1.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="p-1 hover:scale-125 transition"
                      >
                        <Star className={`w-5 h-5 ${s <= reviewRating ? 'fill-amber-500' : 'text-stone-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Họ tên của bạn</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Nhận xét thực tế khi sử dụng</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Độ chống thấm nước, khả năng thông khí, cảm giác khi leo núi..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                >
                  {reviewSubmitting ? 'Đang gửi...' : 'Gửi Nhận Xét'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
      />
    </div>
  );
};
