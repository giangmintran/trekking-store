import React, { useState } from 'react';
import { Compass, ShoppingBag, Search, User, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate: (page: string, param?: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigate('catalog', `search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Banner Bar */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ • Đổi trả linh hoạt trong 30 ngày</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-700 transition">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-stone-900 block leading-tight">
                TREKKING<span className="text-emerald-700">STORE</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-stone-500 block">
                Outdoor & Hiking Gear
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-emerald-700 transition ${activePage === 'home' ? 'text-emerald-700 font-bold' : ''}`}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => onNavigate('catalog', 'category=ao-trekking')}
              className="hover:text-emerald-700 transition"
            >
              Áo Dã Ngoại
            </button>
            <button
              onClick={() => onNavigate('catalog', 'category=quan-trekking')}
              className="hover:text-emerald-700 transition"
            >
              Quần Leo Núi
            </button>
            <button
              onClick={() => onNavigate('catalog', 'category=giay-leo-nui')}
              className="hover:text-emerald-700 transition"
            >
              Giày Bám Đá
            </button>
            <button
              onClick={() => onNavigate('catalog', 'category=balo-phu-kien')}
              className="hover:text-emerald-700 transition"
            >
              Balo & Phụ Kiện
            </button>
            <button
              onClick={() => onNavigate('tracking')}
              className={`hover:text-emerald-700 transition ${activePage === 'tracking' ? 'text-emerald-700 font-bold' : ''}`}
            >
              Tra Cứu Đơn
            </button>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Tìm áo gió, quần tháo ống..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-stone-100 hover:bg-stone-200/80 focus:bg-white rounded-full border border-transparent focus:border-emerald-600 focus:outline-none transition"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-stone-900 text-stone-100 px-3 py-1.5 rounded-lg hover:bg-stone-800 transition font-medium"
              >
                <span>Quản Trị (Admin)</span>
              </button>
            )}

            {/* User Account */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-emerald-700 font-medium py-1 px-2 rounded-lg hover:bg-stone-100 transition"
                  title="Tài khoản cá nhân"
                >
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="hidden xl:inline max-w-[120px] truncate">{user.fullName}</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-stone-500 hover:text-red-600 px-1 py-0.5"
                  title="Đăng xuất"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 text-sm text-stone-700 hover:text-emerald-700 font-medium py-1.5 px-3 rounded-lg hover:bg-stone-100 transition"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-700 hover:text-emerald-700 rounded-lg hover:bg-stone-100 transition"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-emerald-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-stone-100 rounded-lg border border-stone-200 focus:outline-none focus:border-emerald-600"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            </form>
            <div className="flex flex-col gap-2 font-medium text-sm text-stone-700 pt-2">
              <button
                onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 rounded-lg hover:bg-stone-100"
              >
                Trang Chủ
              </button>
              <button
                onClick={() => { onNavigate('catalog', 'category=ao-trekking'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 rounded-lg hover:bg-stone-100"
              >
                Áo Trekking & Dã Ngoại
              </button>
              <button
                onClick={() => { onNavigate('catalog', 'category=quan-trekking'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 rounded-lg hover:bg-stone-100"
              >
                Quần Leo Núi
              </button>
              <button
                onClick={() => { onNavigate('catalog', 'category=giay-leo-nui'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 rounded-lg hover:bg-stone-100"
              >
                Giày Bám Đá Vibram
              </button>
              <button
                onClick={() => { onNavigate('catalog', 'category=balo-phu-kien'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 rounded-lg hover:bg-stone-100"
              >
                Balo & Phụ Kiện
              </button>
              <button
                onClick={() => { onNavigate('tracking'); setMobileMenuOpen(false); }}
                className="text-left py-2 px-3 rounded-lg hover:bg-stone-100 text-emerald-800 font-bold"
              >
                Tra Cứu Đơn Hàng
              </button>
              {isAdmin && (
                <button
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                  className="text-left py-2 px-3 rounded-lg bg-stone-900 text-white font-bold"
                >
                  Trang Quản Trị Hệ Thống (Admin)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

