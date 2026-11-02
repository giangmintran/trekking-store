import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, CreditCard, Banknote, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, formatVND } from '../lib/api';
import { Order } from '../types';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const { items, subtotal, discountAmount, shippingFee, totalAmount, voucherCode, applyVoucher, removeVoucher, voucherError, clearCart } = useCart();
  const { user } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [province, setProvince] = useState('Hà Nội');
  const [district, setDistrict] = useState('Quận Cầu Giấy');
  const [ward, setWard] = useState('Phường Dịch Vọng Hậu');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BankTransfer'>('BankTransfer');

  // Voucher input in checkout
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Giỏ hàng của bạn đang trống.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        province: province.trim(),
        district: district.trim(),
        ward: ward.trim(),
        paymentMethod: paymentMethod,
        voucherCode: voucherCode || undefined,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const createdOrder = await api.post<Order>('/orders', payload);
      clearCart();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi đặt hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-stone-200">
        <h2 className="text-lg font-bold text-stone-900 mb-2">Giỏ hàng đang trống</h2>
        <p className="text-xs text-stone-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng để thanh toán.</p>
        <button
          onClick={onBack}
          className="bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-800 font-semibold mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại giỏ hàng</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Details */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-8">
          {/* Customer Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center justify-between border-b pb-3">
              <span>1. Thông Tin Nhận Hàng</span>
              {!user && (
                <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Thanh toán không cần tài khoản (Guest)
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Phượt"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Số điện thoại liên hệ *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0912 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Địa chỉ Email nhận thông tin đơn hàng *
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Lào Cai">Lào Cai (Sa Pa)</option>
                  <option value="Lâm Đồng">Lâm Đồng (Đà Lạt)</option>
                  <option value="Yên Bái">Yên Bái (Mù Cang Chải)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Quận / Huyện *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Quận/Huyện"
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Phường / Xã *</label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Phường/Xã"
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Địa chỉ chi tiết (Số nhà, tên đường) *</label>
              <input
                type="text"
                required
                placeholder="Số 18 Phố Duy Tân"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">Ghi chú giao hàng</label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Gọi trước khi giao, giao vào giờ hành chính..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-stone-900 border-b pb-3">
              2. Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'BankTransfer'
                    ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'BankTransfer'}
                  onChange={() => setPaymentMethod('BankTransfer')}
                  className="mt-1 accent-emerald-700"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-xs sm:text-sm text-stone-900">
                      Chuyển Khoản Ngân Hàng Tự Động (Quét Mã VietQR)
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      KHUYÊN DÙNG
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Hệ thống tự động sinh mã VietQR chính xác số tiền và cú pháp giao dịch. Tương thích mọi ứng dụng ngân hàng.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-emerald-700"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-xs sm:text-sm text-stone-900">
                      Thanh Toán Khi Nhận Hàng (COD)
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Nhận hàng, kiểm tra sản phẩm và thanh toán tiền mặt trực tiếp cho nhân viên giao hàng.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Đang tạo đơn hàng...</span>
            ) : (
              <span>Xác Nhận Đặt Hàng ({formatVND(totalAmount)})</span>
            )}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-6">
            <h3 className="font-bold text-base text-stone-900 border-b pb-3">
              Tóm Tắt Đơn Hàng ({items.length} món)
            </h3>

            {/* Items Mini List */}
            <div className="divide-y divide-stone-200 max-h-80 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.variantId} className="py-3 flex gap-3 text-xs">
                  <img src={i.imageUrl} alt={i.productName} className="w-14 h-16 object-cover rounded-lg bg-white border" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 line-clamp-1">{i.productName}</h4>
                      <p className="text-stone-500">{i.color} • Size {i.size} • SL: {i.quantity}</p>
                    </div>
                    <span className="font-bold text-emerald-900">{formatVND(i.price * i.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher apply box */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mã voucher..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="text-xs uppercase font-mono p-2.5 bg-white border rounded-xl flex-1"
                />
                <button
                  type="button"
                  onClick={() => applyVoucher(couponInput)}
                  className="bg-stone-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-stone-800"
                >
                  Áp dụng
                </button>
              </div>
              {voucherCode && (
                <div className="mt-2 text-xs bg-emerald-100 text-emerald-800 p-2 rounded-lg flex justify-between items-center">
                  <span>Mã: <strong>{voucherCode}</strong></span>
                  <button type="button" onClick={removeVoucher} className="text-stone-500 hover:text-red-600">Xóa</button>
                </div>
              )}
              {voucherError && <p className="text-[11px] text-red-600 mt-1">{voucherError}</p>}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 border-t pt-4 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold text-stone-900">{formatVND(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Chiết khấu Voucher:</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">Miễn phí</strong> : formatVND(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 border-t pt-3">
                <span>Tổng cộng:</span>
                <span className="text-emerald-800 text-xl">{formatVND(totalAmount)}</span>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Được mở hộp kiểm tra hàng và thử size trước khi thanh toán.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

