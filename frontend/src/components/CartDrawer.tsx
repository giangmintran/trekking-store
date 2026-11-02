import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatVND } from '../lib/api';

interface CartDrawerProps {
  onCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExplore }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    voucherCode,
    voucherError,
    applyVoucher,
    removeVoucher,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = 1000000;
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyVoucher = async () => {
    if (!inputCode.trim()) return;
    setLoadingVoucher(true);
    await applyVoucher(inputCode.trim());
    setLoadingVoucher(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              <h2 className="font-bold text-lg text-stone-900">Giỏ Hàng Trekking</h2>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {items.length} món
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-emerald-50/70 p-3.5 border-b border-emerald-100 text-xs">
            <div className="flex items-center justify-between font-medium text-emerald-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-700" />
                {remainingForFreeShip > 0 ? (
                  <>Mua thêm <strong className="text-emerald-800">{formatVND(remainingForFreeShip)}</strong> để được Miễn Phí Vận Chuyển</>
                ) : (
                  <strong className="text-emerald-800">Bạn đã đủ điều kiện Freeship toàn quốc! 🎉</strong>
                )}
              </span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-base text-stone-800 mb-1">Giỏ hàng đang trống</h4>
                <p className="text-xs text-stone-400 max-w-xs mb-6">
                  Bạn chưa chọn món đồ trekking nào. Hãy khám phá ngay các sản phẩm dã ngoại chất lượng cao!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExplore();
                  }}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Khám Phá Sản Phẩm Ngay
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="py-4 flex gap-3.5">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-24 object-cover rounded-xl bg-stone-100 border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-stone-900 line-clamp-1">
                        {item.productName}
                      </h4>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>Màu: <strong>{item.color}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="font-mono">{item.size}</strong></span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-emerald-800 mt-1">
                        {formatVND(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Counter */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.variantId)}
                        className="text-stone-400 hover:text-red-600 p-1 transition"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              {/* Voucher Input */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Nhập mã CHAOBANMOI..."
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs uppercase font-mono bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    disabled={loadingVoucher || !inputCode.trim()}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-40"
                  >
                    {loadingVoucher ? '...' : 'Áp Dụng'}
                  </button>
                </div>

                {voucherCode && (
                  <div className="flex items-center justify-between text-xs bg-emerald-100/70 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg">
                    <span>Mã đã áp dụng: <strong>{voucherCode}</strong> (-{formatVND(discountAmount)})</span>
                    <button onClick={removeVoucher} className="text-stone-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {voucherError && (
                  <p className="text-[11px] text-red-600">{voucherError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-stone-900">{formatVND(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">Miễn phí</strong> : formatVND(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-emerald-800 text-lg">{formatVND(totalAmount)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
              >
                <span>Tiến Hành Đặt Hàng</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

