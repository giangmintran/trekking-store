export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  subCategories?: Category[];
  productCount?: number;
}

export interface Variant {
  id: number;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isThumbnail: boolean;
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  purchasedVariant?: string;
  createdAt: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  brand?: string;
  basePrice: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isNew: boolean;
  availableSizes: string[];
  availableColors: string[];
  totalStock: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  brand?: string;
  material?: string;
  careGuide?: string;
  sizeGuide?: string;
  basePrice: number;
  originalPrice?: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  isFeatured: boolean;
  isNew: boolean;
  images: ProductImage[];
  variants: Variant[];
  reviews: Review[];
}

export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  imageUrl: string;
  stockQuantity: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'Admin' | 'Staff' | 'Customer';
  token: string;
}

export interface OrderItemDetail {
  id: number;
  variantId: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  province: string;
  district: string;
  ward: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  vietQrUrl?: string;
  items: OrderItemDetail[];
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  position: string;
  sortOrder: number;
}

