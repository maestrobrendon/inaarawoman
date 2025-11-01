import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem } from '../types';

interface CustomMeasurements {
  bust: string;
  waist: string;
  hips: string;
  length: string;
  height?: string;
}

// Extended CartItem type with custom measurements
export interface ExtendedCartItem extends CartItem {
  customMeasurements?: CustomMeasurements;
}

interface CartContextType {
  items: ExtendedCartItem[];
  addItem: (item: ExtendedCartItem) => void;
  removeItem: (productId: string, size: string, color: string, colorHex?: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number, colorHex?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ExtendedCartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: ExtendedCartItem) => {
    setItems((prevItems) => {
      // For custom sizes, each item is unique (don't merge quantities)
      // Custom items are unique by: product + size + color + measurements
      if (newItem.size === 'Custom' && newItem.customMeasurements) {
        // Store customMeasurements in a variable to help TypeScript narrow the type
        const newMeasurements = newItem.customMeasurements;
        
        // Check if exact same custom item exists (same product, color, and measurements)
        const existingCustomItem = prevItems.find(
          (item) =>
            item.product.id === newItem.product.id &&
            item.size === 'Custom' &&
            item.color.name === newItem.color.name &&
            item.customMeasurements &&
            item.customMeasurements.bust === newMeasurements.bust &&
            item.customMeasurements.waist === newMeasurements.waist &&
            item.customMeasurements.hips === newMeasurements.hips &&
            item.customMeasurements.length === newMeasurements.length
        );

        // If exact same custom item exists, increase quantity
        if (existingCustomItem) {
          return prevItems.map((item) => {
            if (
              item.product.id === newItem.product.id &&
              item.size === 'Custom' &&
              item.color.name === newItem.color.name &&
              item.customMeasurements &&
              item.customMeasurements.bust === newMeasurements.bust &&
              item.customMeasurements.waist === newMeasurements.waist &&
              item.customMeasurements.hips === newMeasurements.hips &&
              item.customMeasurements.length === newMeasurements.length
            ) {
              return { ...item, quantity: item.quantity + newItem.quantity };
            }
            return item;
          });
        }

        // Otherwise, add as new unique custom item
        return [...prevItems, newItem];
      }

      // For standard sizes, check if item already exists (product + size + color)
      const existingItem = prevItems.find(
        (item) =>
          item.product.id === newItem.product.id &&
          item.size === newItem.size &&
          item.color.name === newItem.color.name &&
          item.color.hex === newItem.color.hex &&
          !item.customMeasurements // Only merge if it's not a custom size
      );

      if (existingItem) {
        // Increase quantity of existing item
        return prevItems.map((item) =>
          item.product.id === newItem.product.id &&
          item.size === newItem.size &&
          item.color.name === newItem.color.name &&
          item.color.hex === newItem.color.hex &&
          !item.customMeasurements
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }

      // Add as new item
      return [...prevItems, newItem];
    });
  };

  const removeItem = (productId: string, size: string, color: string, colorHex?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product.id === productId && 
            item.size === size && 
            item.color.name === color &&
            (!colorHex || item.color.hex === colorHex)
          )
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number, colorHex?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size, color, colorHex);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && 
        item.size === size && 
        item.color.name === color &&
        (!colorHex || item.color.hex === colorHex)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}