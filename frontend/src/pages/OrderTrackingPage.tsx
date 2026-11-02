import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Calendar } from 'lucide-react';
import { api, formatVND } from '../lib/api';
import { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const [orderCode, setOrderCode] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !phoneOrEmail.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await api.post<Order>('/orders/track', {
        orderCode: orderCode.trim(),
        phoneOrEmail: phoneOrEmail.trim(),
      });
      setOrder(res);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'Pending', label: 'Chờ xác nhận', desc: 'Đơn hàng đang chờ nhân viên kiểm duyệt kho' },
    { key: 'Confirmed', label: 'Đã xác nhận', desc: 'Đã đóng gói và bàn giao đơn vị vận chuyển' },
    { key: 'Shipping', label: 'Đang giao hàng', desc: 'Shipper đang trên đường giao đến bạn' },
    { key: 'Delivered', label: 'Đã giao hàng', desc: 'Đơn hàng đã hoàn tất thành công' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Confirmed': return 1;
      case 'Shipping': return 2;
      case 'Delivered': return 3;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Tra Cứu Tiến Trình Đơn Hàng
        </h1>
        <p className="text-xs text-stone-500 mt-2">
          Nhập mã đơn hàng và số điện thoại hoặc email lúc đặt hàng để theo dõi trạng thái giao hàng tức thì.
        </p>
      </div>

      {/* Tracking Search Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm mb-10">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Mã đơn hàng
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: TRK-20261102-001"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              className="w-full text-xs p-3 font-mono uppercase bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Số điện thoại hoặc Email
            </label>
            <input
              type="text"
              required
              placeholder="0912 345 678 hoặc email@..."
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Đang tìm...' : 'Tra cứu'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-8 animate-fade-in">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-stone-900">{order.orderCode}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 block">Tổng thanh toán:</span>
              <span className="text-lg font-bold text-emerald-800">{formatVND(order.totalAmount)}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.orderStatus === 'Cancelled' ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
              <h4 className="font-bold text-red-900 text-sm">Đơn hàng này đã bị hủy</h4>
              <p className="text-xs text-red-700">Tồn kho của sản phẩm đã được tự động hoàn lại vào hệ thống.</p>
            </div>
          ) : (
            <div className="relative py-4">
              <div className="grid grid-cols-4 gap-2">
                {steps.map((st, idx) => {
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div key={st.key} className="flex flex-col items-center text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition mb-2 ${
                          isDone
                            ? 'bg-emerald-800 text-white shadow-md'
                            : 'bg-stone-100 text-stone-400 border border-stone-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <h5 className={`text-xs font-bold ${isCurrent ? 'text-emerald-800' : 'text-stone-700'}`}>
                        {st.label}
                      </h5>
                      <p className="text-[10px] text-stone-400 mt-0.5 hidden sm:block max-w-[120px]">
                        {st.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shipping & Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <span className="text-stone-400 block">Người nhận hàng:</span>
              <span className="font-bold text-stone-900">{order.customerName} - {order.customerPhone}</span>
            </div>
            <div>
              <span className="text-stone-400 block">Mã vận đơn:</span>
              <span className="font-mono font-bold text-emerald-800">{order.trackingNumber || 'Đang cập nhật'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-stone-400 block">Địa chỉ nhận hàng:</span>
              <span className="font-medium text-stone-800">
                {order.shippingAddress}, {order.ward}, {order.district}, {order.province}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider mb-3">Sản phẩm trong đơn</h4>
            <div className="divide-y divide-stone-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-semibold text-stone-900">{item.productName}</h5>
                    <span className="text-stone-500">Màu {item.color} • Size {item.size} • Số lượng: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-stone-900">{formatVND(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

