import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType?: string; // 'ao' | 'quan' | 'giay'
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, categoryType = 'ao' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-stone-900 mb-1">Bảng Hướng Dẫn Chọn Size Chuẩn Outdoor</h3>
        <p className="text-xs text-stone-500 mb-6">
          Kích cỡ được thiết kế riêng theo vóc dáng người Việt Nam, có độ trừ hao để mặc thêm áo giữ nhiệt bên trong.
        </p>

        {/* Apparel Size Table */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-emerald-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Bảng Size Áo Khoác & Áo Thun Trekking (Nam & Nữ)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3 border-b">Size</th>
                    <th className="p-3 border-b">Chiều cao (cm)</th>
                    <th className="p-3 border-b">Cân nặng (kg)</th>
                    <th className="p-3 border-b">Vòng ngực (cm)</th>
                    <th className="p-3 border-b">Dài áo (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">S</td>
                    <td className="p-3">155 - 165</td>
                    <td className="p-3">50 - 58</td>
                    <td className="p-3">88 - 92</td>
                    <td className="p-3">66</td>
                  </tr>
                  <tr className="hover:bg-stone-50 bg-emerald-50/40">
                    <td className="p-3 font-bold text-emerald-800">M</td>
                    <td className="p-3">165 - 172</td>
                    <td className="p-3">58 - 66</td>
                    <td className="p-3">92 - 96</td>
                    <td className="p-3">69</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">L</td>
                    <td className="p-3">170 - 178</td>
                    <td className="p-3">67 - 75</td>
                    <td className="p-3">96 - 102</td>
                    <td className="p-3">72</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">XL</td>
                    <td className="p-3">175 - 183</td>
                    <td className="p-3">75 - 84</td>
                    <td className="p-3">102 - 108</td>
                    <td className="p-3">75</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">XXL</td>
                    <td className="p-3">180 - 190</td>
                    <td className="p-3">85 - 95</td>
                    <td className="p-3">108 - 114</td>
                    <td className="p-3">78</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-emerald-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              2. Bảng Size Quần Trekking Tháo Ống
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-stone-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3 border-b">Size</th>
                    <th className="p-3 border-b">Vòng bụng (cm)</th>
                    <th className="p-3 border-b">Chiều dài quần (cm)</th>
                    <th className="p-3 border-b">Cân nặng gợi ý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">M</td>
                    <td className="p-3">74 - 80</td>
                    <td className="p-3">98</td>
                    <td className="p-3">56 - 65 kg</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">L</td>
                    <td className="p-3">80 - 86</td>
                    <td className="p-3">101</td>
                    <td className="p-3">65 - 74 kg</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="p-3 font-bold text-emerald-800">XL</td>
                    <td className="p-3">86 - 92</td>
                    <td className="p-3">104</td>
                    <td className="p-3">74 - 84 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
            <strong>Mẹo leo núi:</strong> Khi chọn áo khoác ngoài chống gió hoặc giày leo núi, bạn nên chọn lớn hơn 0.5 - 1 size so với đồ mặc hàng ngày để có thể đeo tất dày và tránh đau đầu ngón chân khi xuống dốc dã ngoại.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition"
          >
            Đã hiểu, quay lại xem sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

