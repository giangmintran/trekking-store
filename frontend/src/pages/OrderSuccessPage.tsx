import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, Compass, QrCode, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatVND } from '../lib/api';

interface OrderSuccessPageProps {
  order: Order;
  onNavigate: (page: string, param?: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  const [copiedField, setCopiedField] = useState('');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const isBankTransfer = order.paymentMethod === 'BankTransfer';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        {/* Header Success Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Cảm ơn bạn đã lựa chọn Trekking Store. Mã đơn hàng của bạn là:
          </p>
          <div className="inline-block bg-stone-100 border border-stone-300 px-4 py-2 rounded-xl font-mono text-sm sm:text-base font-bold text-stone-900 tracking-wider">
            {order.orderCode}
          </div>
        </div>

        {/* VietQR Payment Box (If BankTransfer) */}
        {isBankTransfer && (
          <div className="bg-emerald-50/60 border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-base border-b border-emerald-200/60 pb-3">
              <QrCode className="w-5 h-5 text-emerald-700" />
              <span>Quét Mã VietQR Chuyển Khoản Nhanh 24/7</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Image */}
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
                {order.vietQrUrl ? (
                  <img
                    src={order.vietQrUrl}
                    alt={`VietQR ${order.orderCode}`}
                    className="max-w-[240px] w-full h-auto rounded-lg shadow"
                  />
                ) : (
                  <div className="p-8 text-center text-xs text-stone-400">Đang tải mã QR...</div>
                )}
                <span className="text-[11px] text-stone-500 mt-2 font-medium">
                  Mở app ngân hàng bất kỳ để quét mã
                </span>
              </div>

              {/* Bank Details Table */}
              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-stone-900 text-sm">MB Bank (Quân Đội)</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Số tài khoản:</span>
                    <span className="font-bold text-stone-900 text-sm font-mono">0987654321</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard('0987654321', 'stk')}
                    className="text-emerald-700 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                  >
                    {copiedField === 'stk' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'stk' ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Số tiền chính xác:</span>
                    <span className="font-bold text-emerald-800 text-sm font-mono">{formatVND(order.totalAmount)}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(String(order.totalAmount), 'amount')}
                    className="text-emerald-700 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                  >
                    {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'amount' ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-white p-3 rounded-xl border border-stone-200 flex justify-between items-center">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Nội dung chuyển tiền:</span>
                    <span className="font-bold text-stone-900 text-xs font-mono">THANH TOAN DON {order.orderCode}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`THANH TOAN DON ${order.orderCode}`, 'syntax')}
                    className="text-emerald-700 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 flex items-center gap-1 font-semibold"
                  >
                    {copiedField === 'syntax' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedField === 'syntax' ? 'Đã sao chép' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Summary */}
        <div className="space-y-4 pt-4 border-t border-stone-200">
          <h3 className="font-bold text-sm text-stone-900">Chi Tiết Đơn Hàng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <span className="text-stone-400 block">Khách hàng:</span>
              <span className="font-bold text-stone-900">{order.customerName} ({order.customerPhone})</span>
            </div>
            <div>
              <span className="text-stone-400 block">Email xác nhận:</span>
              <span className="font-bold text-stone-900">{order.customerEmail}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-stone-400 block">Địa chỉ nhận hàng:</span>
              <span className="font-semibold text-stone-800">
                {order.shippingAddress}, {order.ward}, {order.district}, {order.province}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block">Phương thức thanh toán:</span>
              <span className="font-bold text-emerald-800">
                {order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản VietQR' : 'Thanh toán COD'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block">Tổng tiền:</span>
              <span className="font-bold text-emerald-800 text-sm">{formatVND(order.totalAmount)}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-stone-200 border-t pt-2">
            {order.items?.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-stone-900">{item.productName}</h5>
                  <span className="text-stone-500">Màu {item.color} • Size {item.size} • SL: {item.quantity}</span>
                </div>
                <span className="font-bold text-stone-900">{formatVND(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => onNavigate('tracking')}
            className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-2xl transition text-xs flex items-center justify-center gap-2"
          >
            <span>Tra Cứu Trạng Thái Đơn Hàng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-3.5 px-6 rounded-2xl transition text-xs"
          >
            Tiếp Tục Mua Sắm
          </button>
        </div>
      </div>
    </div>
  );
};

