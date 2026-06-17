import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Helper: lấy giá từ item (hỗ trợ cả 'price' lẫn 'basePrice')
  const getPrice = (item) => item.price ?? item.basePrice ?? 0;

  const addToCart = (product, quantity = 1) => {
    // Chuẩn hóa: luôn lưu trường 'price' để Cart.jsx dùng được
    const normalizedProduct = {
      ...product,
      price: product.price ?? product.basePrice ?? 0,
    };
    setCart(prev => {
      const existing = prev.find(i => i.id === normalizedProduct.id);
      if (existing) {
        return prev.map(i =>
          i.id === normalizedProduct.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...normalizedProduct, quantity }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setCart([]);
  const getTotalPrice = () => cart.reduce((sum, i) => sum + getPrice(i) * i.quantity, 0);
  const getTotalItems = () => cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems }}>
      {children}
    </CartContext.Provider>
  );
};
