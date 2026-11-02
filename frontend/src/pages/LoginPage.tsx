import React, { useState } from 'react';
import { Compass, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { User as UserType } from '../types';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post<UserType>('/auth/login', { email, password });
      login(res.token, res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    setEmail('admin@trekking.vn');
    setPassword('Admin@123');
  };

  const handleQuickCustomer = () => {
    setEmail('customer@gmail.com');
    setPassword('Customer@123');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-stone-900">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-stone-500">Trekking Store - Outdoor Gear Portal</p>
        </div>

        {/* Demo Quick Login buttons */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Đăng nhập nhanh mẫu (Quick Demo)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleQuickAdmin}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold py-1.5 rounded-lg transition"
            >
              👑 Quản Trị Viên (Admin)
            </button>
            <button
              type="button"
              onClick={handleQuickCustomer}
              className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold py-1.5 rounded-lg transition"
            >
              👤 Khách Hàng (User)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-md"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="text-center text-xs text-stone-500 pt-2 border-t">
          <span>Chưa có tài khoản? </span>
          <button
            onClick={onNavigateRegister}
            className="text-emerald-800 font-bold hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
};

