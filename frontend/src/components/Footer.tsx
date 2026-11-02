import React from 'react';
import { Compass, Mail, Phone, MapPin, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 border-t border-stone-800">
      {/* Guarantees Bar */}
      <div className="border-b border-stone-800 py-10 bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Giao Hàng Toàn Quốc</h4>
              <p className="text-stone-400 text-xs mt-1">Miễn phí giao hàng cho tất cả đơn hàng từ 1.000.000đ</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Đổi Trả Trong 30 Ngày</h4>
              <p className="text-stone-400 text-xs mt-1">Đổi size miễn phí, thủ tục đổi trả nhanh chóng tại nhà</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-base">Bảo Hành Chống Thấm</h4>
              <p className="text-stone-400 text-xs mt-1">Cam kết chính hãng, bảo hành ép seam và đường may 12 tháng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">TREKKING STORE</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Chuyên cung cấp trang phục và thiết bị dã ngoại, leo núi, cắm trại kỹ thuật cao phục vụ các cung trekking khắc nghiệt nhất Việt Nam.
          </p>
          <div className="text-xs text-stone-400 space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Số 18 Phố Duy Tân, Cầu Giấy, Hà Nội</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Hotline: 0909 123 456 (8h00 - 22h00)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>hotro@trekkingstore.vn</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Danh Mục Sản Phẩm</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li><a href="#ao" className="hover:text-emerald-400 transition">Áo khoác gió chống nước Gore-Tex</a></li>
            <li><a href="#thun" className="hover:text-emerald-400 transition">Áo thun mau khô Quick-Dry UPF 50+</a></li>
            <li><a href="#quan" className="hover:text-emerald-400 transition">Quần trekking tháo ống 2 trong 1</a></li>
            <li><a href="#giay" className="hover:text-emerald-400 transition">Giày leo núi đế gai Vibram</a></li>
            <li><a href="#balo" className="hover:text-emerald-400 transition">Balo trợ lực dã ngoại 45L+5L</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Hỗ Trợ Khách Hàng</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li><a href="#guide" className="hover:text-emerald-400 transition">Bảng quy đổi kích cỡ (Size Chart)</a></li>
            <li><a href="#care" className="hover:text-emerald-400 transition">Hướng dẫn bảo quản đồ Gore-Tex</a></li>
            <li><a href="#shipping" className="hover:text-emerald-400 transition">Chính sách giao nhận & kiểm hàng</a></li>
            <li><a href="#returns" className="hover:text-emerald-400 transition">Chính sách đổi trả & bảo hành</a></li>
            <li><a href="#payment" className="hover:text-emerald-400 transition">Phương thức thanh toán VietQR / COD</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Bản Tin Trekking & Khuyến Mãi</h4>
          <p className="text-xs text-stone-400 mb-3">
            Đăng ký để nhận cẩm nang leo núi Tây Bắc và mã giảm giá 10% cho đơn hàng đầu tiên.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="bg-stone-800 text-xs text-white px-3 py-2 rounded-lg border border-stone-700 flex-1 focus:outline-none focus:border-emerald-500"
            />
            <button className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">
        © 2026 Trekking Store. Xây dựng trên nền tảng C# ASP.NET Core 8 Web API & SQL Server.
      </div>
    </footer>
  );
};

