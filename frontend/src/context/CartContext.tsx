import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  voucherCode: string;
  voucherError: string;
  applyVoucher: (code: string) => Promise<boolean>;
  removeVoucher: () => void;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  subtotal: 0,
  discountAmount: 0,
  shippingFee: 0,
  totalAmount: 0,
  voucherCode: '',
  voucherError: '',
  applyVoucher: async () => false,
  removeVoucher: () => {},
  totalItemsCount: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('trekking_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    localStorage.setItem('trekking_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === newItem.variantId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + newItem.quantity, newItem.stockQuantity);
        return prev.map((i) =>
          i.variantId === newItem.variantId ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: number) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variantId === variantId) {
          const validQty = Math.min(quantity, i.stockQuantity);
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setVoucherCode('');
    setDiscountAmount(0);
    setVoucherError('');
  };

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const applyVoucher = async (code: string): Promise<boolean> => {
    setVoucherError('');
    if (!code.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      return false;
    }

    try {
      const res = await api.post<{ isValid: boolean; message: string; discountAmount: number; code: string }>(
        '/vouchers/validate',
        { code, orderAmount: subtotal }
      );

      if (res.isValid) {
        setVoucherCode(res.code);
        setDiscountAmount(res.discountAmount);
        return true;
      } else {
        setVoucherError(res.message);
        setVoucherCode('');
        setDiscountAmount(0);
        return false;
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Không thể kiểm tra mã giảm giá.');
      return false;
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setDiscountAmount(0);
    setVoucherError('');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        voucherCode,
        voucherError,
        applyVoucher,
        removeVoucher,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

