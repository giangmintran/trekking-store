import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
  Tag,
  TrendingUp,
  AlertTriangle,
  Clock,
  Printer,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { api, formatVND } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  lowStockProductsCount: number;
  recentOrders: any[];
  lowStockItems: any[];
  revenueChart: any[];
}

export const AdminDashboardPage: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { isAdmin, isStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'inventory' | 'vouchers'>('dashboard');

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Orders Tab
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any | null>(null);

  // Products Tab
  const [products, setProducts] = useState<any[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSlug, setNewProductSlug] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(500000);
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCategory, setNewProductCategory] = useState(1);
  const [newProductImage, setNewProductImage] = useState('https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop');

  // Inventory Tab
  const [inventory, setInventory] = useState<any[]>([]);
  const [adjustModalVariant, setAdjustModalVariant] = useState<any | null>(null);
  const [adjustQtyChange, setAdjustQtyChange] = useState(10);
  const [adjustReason, setAdjustReason] = useState('Nhập hàng từ xưởng may');

  // Vouchers Tab
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('');
  const [newVoucherDesc, setNewVoucherDesc] = useState('');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState(50000);

  const fetchStats = async () => {
    try {
      const res = await api.get<DashboardStats>('/admin/dashboard');
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get<any[]>('/admin/orders', {
        status: orderStatusFilter || undefined,
        search: orderSearch || undefined,
      });
      setOrders(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get<any[]>('/admin/products');
      setProducts(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await api.get<any[]>('/admin/inventory');
      setInventory(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res = await api.get<any[]>('/admin/vouchers');
      setVouchers(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAdmin || isStaff) {
      fetchStats();
    }
  }, [isAdmin, isStaff]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'inventory') fetchInventory();
    if (activeTab === 'vouchers') fetchVouchers();
  }, [activeTab, orderStatusFilter, orderSearch]);

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchOrders();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleAdjustInventory = async () => {
    if (!adjustModalVariant) return;
    try {
      await api.post('/admin/inventory/adjust', {
        variantId: adjustModalVariant.id,
        quantityChange: Number(adjustQtyChange),
        reason: adjustReason,
      });
      setAdjustModalVariant(null);
      fetchInventory();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Lỗi điều chỉnh tồn kho');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', {
        name: newProductName,
        slug: newProductSlug || newProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: newProductDesc,
        basePrice: Number(newProductPrice),
        categoryId: Number(newProductCategory),
        imageUrls: [newProductImage],
        variants: [
          { sku: `${newProductSlug.toUpperCase()}-S`, size: 'S', colorName: 'Xanh Rêu', colorHex: '#4A5D4E', price: Number(newProductPrice), stockQuantity: 20 },
          { sku: `${newProductSlug.toUpperCase()}-M`, size: 'M', colorName: 'Xanh Rêu', colorHex: '#4A5D4E', price: Number(newProductPrice), stockQuantity: 25 },
          { sku: `${newProductSlug.toUpperCase()}-L`, size: 'L', colorName: 'Xanh Rêu', colorHex: '#4A5D4E', price: Number(newProductPrice), stockQuantity: 30 }
        ]
      });
      setIsAddProductOpen(false);
      setNewProductName('');
      setNewProductSlug('');
      setNewProductDesc('');
      fetchProducts();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo sản phẩm');
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/vouchers', {
        code: newVoucherCode.toUpperCase(),
        description: newVoucherDesc,
        discountType: 'FixedAmount',
        discountValue: Number(newVoucherDiscount),
        minOrderValue: 300000,
        usageLimit: 100,
      });
      setIsAddVoucherOpen(false);
      setNewVoucherCode('');
      setNewVoucherDesc('');
      fetchVouchers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo mã giảm giá');
    }
  };

  if (!isAdmin && !isStaff) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-3xl border border-stone-200">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-stone-900 mb-1">Yêu Cầu Quyền Quản Trị</h2>
        <p className="text-xs text-stone-500 mb-6">
          Bạn cần đăng nhập với tài khoản Quản trị viên (Admin) hoặc Nhân viên (Staff) để truy cập cổng này.
        </p>
        <button
          onClick={onNavigateHome}
          className="bg-stone-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-stone-800 transition"
        >
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-stone-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              ADMIN PORTAL
            </span>
            <span className="text-xs text-stone-500">C# ASP.NET Core & SQL Server</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">
            Hệ Thống Quản Trị Trekking Store
          </h1>
        </div>

        <button
          onClick={onNavigateHome}
          className="text-xs font-semibold text-emerald-800 hover:text-emerald-700 flex items-center gap-1.5"
        >
          <span>Quay lại Trang Mua Sắm</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-6 mt-6 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 py-3 px-2 border-b-2 transition shrink-0 ${
            activeTab === 'dashboard' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tổng Quan (Dashboard)</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-3 px-2 border-b-2 transition shrink-0 ${
            activeTab === 'orders' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Quản Lý Đơn Hàng</span>
          {stats && stats.pendingOrders > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {stats.pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 py-3 px-2 border-b-2 transition shrink-0 ${
            activeTab === 'products' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Sản Phẩm & Biến Thể</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 py-3 px-2 border-b-2 transition shrink-0 ${
            activeTab === 'inventory' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Kho Hàng & Cảnh Báo</span>
          {stats && stats.lowStockProductsCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {stats.lowStockProductsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 py-3 px-2 border-b-2 transition shrink-0 ${
            activeTab === 'vouchers' ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Mã Giảm Giá (Voucher)</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8 pt-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Doanh Thu Đã Thu</span>
                <span className="text-xl font-extrabold text-stone-900 mt-1 block">{formatVND(stats.totalRevenue)}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Tổng Đơn Hàng</span>
                <span className="text-xl font-extrabold text-stone-900 mt-1 block">{stats.totalOrders} đơn</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Đơn Chờ Xác Nhận</span>
                <span className="text-xl font-extrabold text-amber-700 mt-1 block">{stats.pendingOrders} đơn</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Sắp Hết Hàng (≤ 5)</span>
                <span className="text-xl font-extrabold text-red-700 mt-1 block">{stats.lowStockProductsCount} SKU</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue 7 Days */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-stone-900">Doanh Thu 7 Ngày Gần Nhất</h3>
              <div className="space-y-3">
                {stats.revenueChart.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="w-14 font-mono text-stone-500">{d.date}</span>
                    <div className="flex-1 mx-3 bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-700 h-2 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, (d.revenue / (stats.totalRevenue || 1)) * 100))}%` }}
                      />
                    </div>
                    <span className="font-bold text-stone-900 w-28 text-right">{formatVND(d.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Low stock alerts */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  Cảnh Báo Hết Hàng Cần Nhập
                </h3>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-xs text-emerald-800 hover:underline font-semibold"
                >
                  Xem tất cả kho
                </button>
              </div>

              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {stats.lowStockItems.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Không có mặt hàng nào sắp hết kho.</p>
                ) : (
                  stats.lowStockItems.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <h5 className="font-semibold text-stone-900">{item.productName}</h5>
                        <span className="text-stone-400 font-mono">{item.sku} • {item.color} - Size {item.size}</span>
                      </div>
                      <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                        Còn {item.stockQuantity} cái
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs p-2 border rounded-xl"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ xác nhận</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="Shipping">Đang giao hàng</option>
                <option value="Delivered">Đã hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Tìm mã đơn, tên, sđt..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border rounded-xl"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase">
                  <tr>
                    <th className="p-4">Mã Đơn</th>
                    <th className="p-4">Khách Hàng</th>
                    <th className="p-4">Sản Phẩm</th>
                    <th className="p-4">Tổng Tiền</th>
                    <th className="p-4">Thanh Toán</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50">
                      <td className="p-4 font-mono font-bold text-stone-900">{o.orderCode}</td>
                      <td className="p-4">
                        <div className="font-semibold text-stone-900">{o.customerName}</div>
                        <div className="text-stone-400">{o.customerPhone}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{o.itemsCount} món</span>
                      </td>
                      <td className="p-4 font-bold text-emerald-800">{formatVND(o.totalAmount)}</td>
                      <td className="p-4">
                        <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          o.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          o.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          o.orderStatus === 'Shipping' ? 'bg-purple-100 text-purple-800' :
                          o.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {o.orderStatus === 'Pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'Confirmed')}
                              className="bg-emerald-800 text-white px-2 py-1 rounded text-[11px] font-semibold hover:bg-emerald-700"
                            >
                              Xác nhận
                            </button>
                          )}
                          {o.orderStatus === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'Shipping')}
                              className="bg-blue-700 text-white px-2 py-1 rounded text-[11px] font-semibold hover:bg-blue-600"
                            >
                              Giao hàng
                            </button>
                          )}
                          {o.orderStatus === 'Shipping' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')}
                              className="bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-semibold hover:bg-emerald-600"
                            >
                              Hoàn thành
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrderForInvoice(o)}
                            className="p-1 text-stone-600 hover:text-stone-900 border rounded"
                            title="In hóa đơn / Phiếu đóng hàng"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & VARIANTS */}
      {activeTab === 'products' && (
        <div className="space-y-6 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-stone-900">Danh Sách Sản Phẩm Trekking</h3>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Sản Phẩm Mới</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase">
                  <tr>
                    <th className="p-4">Ảnh</th>
                    <th className="p-4">Tên Sản Phẩm</th>
                    <th className="p-4">Danh Mục</th>
                    <th className="p-4">Giá Cơ Bản</th>
                    <th className="p-4">Số Biến Thể</th>
                    <th className="p-4">Tổng Tồn Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="p-4">
                        <img src={p.thumbnail} alt={p.name} className="w-12 h-14 object-cover rounded-lg border bg-stone-100" />
                      </td>
                      <td className="p-4 font-bold text-stone-900">{p.name}</td>
                      <td className="p-4">{p.categoryName}</td>
                      <td className="p-4 font-bold text-emerald-800">{formatVND(p.basePrice)}</td>
                      <td className="p-4">{p.variantsCount} biến thể</td>
                      <td className="p-4 font-bold text-stone-800">{p.totalStock} sản phẩm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-stone-900">Quản Lý Tồn Kho Theo SKU</h3>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase">
                  <tr>
                    <th className="p-4">Mã SKU</th>
                    <th className="p-4">Sản Phẩm</th>
                    <th className="p-4">Màu Sắc</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Tồn Kho Hiện Tại</th>
                    <th className="p-4">Cảnh Báo</th>
                    <th className="p-4">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-700">
                  {inventory.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50">
                      <td className="p-4 font-mono font-bold text-stone-900">{inv.sku}</td>
                      <td className="p-4 font-semibold text-stone-800">{inv.productName}</td>
                      <td className="p-4">{inv.colorName}</td>
                      <td className="p-4 font-mono">{inv.size}</td>
                      <td className="p-4 font-bold text-stone-900">{inv.stockQuantity} cái</td>
                      <td className="p-4">
                        {inv.isLowStock ? (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold text-[10px]">
                            SẮP HẾT HÀNG
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[10px]">Đầy đủ</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setAdjustModalVariant(inv)}
                          className="bg-stone-900 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-stone-800"
                        >
                          Điều chỉnh kho
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-stone-900">Danh Sách Mã Khuyến Mãi (Vouchers)</h3>
            <button
              onClick={() => setIsAddVoucherOpen(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Mã Khuyến Mãi Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {vouchers.map((v) => (
              <div key={v.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {v.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'}`}>
                    {v.isActive ? 'ĐANG DÙNG' : 'TẠM TẮT'}
                  </span>
                </div>
                <p className="text-xs text-stone-600">{v.description}</p>
                <div className="text-xs text-stone-400 pt-2 border-t flex justify-between">
                  <span>Đã dùng: {v.usedCount}/{v.usageLimit}</span>
                  <span>Đơn tối thiểu: {formatVND(v.minOrderValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adjust Inventory Modal */}
      {adjustModalVariant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h4 className="font-bold text-base text-stone-900">Điều Chỉnh Tồn Kho</h4>
            <p className="text-xs text-stone-500">
              SKU: <strong className="font-mono text-stone-800">{adjustModalVariant.sku}</strong> ({adjustModalVariant.productName})
            </p>

            <div>
              <label className="text-xs font-semibold block mb-1">Số lượng thay đổi (+ để nhập, - để xuất)</label>
              <input
                type="number"
                value={adjustQtyChange}
                onChange={(e) => setAdjustQtyChange(Number(e.target.value))}
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Lý do điều chỉnh</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustModalVariant(null)}
                className="flex-1 py-2 text-xs border rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleAdjustInventory}
                className="flex-1 py-2 text-xs bg-emerald-800 text-white rounded-xl font-bold"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Printable Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="text-center border-b pb-4">
              <h2 className="font-extrabold text-xl text-stone-900">TREKKING STORE</h2>
              <p className="text-xs text-stone-500">PHIẾU ĐÓNG HÀNG & HÓA ĐƠN GIAO HÀNG</p>
              <span className="font-mono font-bold text-sm text-emerald-800 mt-1 block">
                {selectedOrderForInvoice.orderCode}
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-stone-700">
              <p><strong>Khách hàng:</strong> {selectedOrderForInvoice.customerName} ({selectedOrderForInvoice.customerPhone})</p>
              <p><strong>Địa chỉ:</strong> {selectedOrderForInvoice.shippingAddress}, {selectedOrderForInvoice.ward}, {selectedOrderForInvoice.district}, {selectedOrderForInvoice.province}</p>
              <p><strong>Thanh toán:</strong> {selectedOrderForInvoice.paymentMethod}</p>
            </div>

            <div className="border-t pt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b font-bold text-stone-700">
                    <th className="py-1">Mặt hàng</th>
                    <th className="py-1 text-center">SL</th>
                    <th className="py-1 text-right">Đơn giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedOrderForInvoice.items.map((i: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1.5">{i.productName} ({i.color} - {i.size})</td>
                      <td className="py-1.5 text-center">{i.quantity}</td>
                      <td className="py-1.5 text-right font-bold">{formatVND(i.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-sm">
              <span>Tổng thu:</span>
              <span className="text-emerald-800 text-base">{formatVND(selectedOrderForInvoice.totalAmount)}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="flex-1 py-2.5 text-xs border rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 text-xs bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateProduct} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-bold text-base text-stone-900">Thêm Sản Phẩm Trekking Mới</h4>
            <div>
              <label className="text-xs font-semibold block mb-1">Tên sản phẩm *</label>
              <input
                type="text"
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Ví dụ: Áo Gió Siêu Nhẹ Kháng Nước"
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Giá bán cơ bản (VNĐ) *</label>
              <input
                type="number"
                required
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(Number(e.target.value))}
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Mô tả sản phẩm</label>
              <textarea
                rows={3}
                value={newProductDesc}
                onChange={(e) => setNewProductDesc(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="flex-1 py-2 text-xs border rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs bg-emerald-800 text-white rounded-xl font-bold"
              >
                Lưu Sản Phẩm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

