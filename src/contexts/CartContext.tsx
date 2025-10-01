import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  price: number;
  quantity: number;
  weight?: {
    value: string;
    price: number;
  };
  inStock: boolean;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, weight?: string) => void;
  updateQuantity: (id: string, quantity: number, weight?: string) => void;
  clearCart: () => void;
  isInCart: (id: string, weight?: string) => boolean;
  getCartItemQuantity: (id: string, weight?: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rice-bloom-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('rice-bloom-cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const getItemKey = (id: string, weight?: string) => {
    return weight ? `${id}-${weight}` : `${id}`;
  };

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!newItem.inStock) {
      toast({
        title: "محصول ناموجود",
        description: "این محصول در حال حاضر موجود نیست.",
        variant: "destructive",
      });
      return;
    }

    setItems(currentItems => {
      const itemKey = getItemKey(newItem.id, newItem.weight?.value);
      const existingItemIndex = currentItems.findIndex(item => 
        getItemKey(item.id, item.weight?.value) === itemKey
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        
        toast({
          title: "محصول به‌روزرسانی شد",
          description: `تعداد ${newItem.name} در سبد خرید به‌روزرسانی شد.`,
        });
        
        return updatedItems;
      } else {
        // New item, add to cart
        const cartItem: CartItem = {
          ...newItem,
          quantity
        };
        
        toast({
          title: "به سبد خرید اضافه شد",
          description: `${newItem.name} به سبد خرید شما اضافه شد.`,
        });
        
        return [...currentItems, cartItem];
      }
    });
  };

  const removeItem = (id: string, weight?: string) => {
    setItems(currentItems => {
      const itemKey = getItemKey(id, weight);
      const updatedItems = currentItems.filter(item => 
        getItemKey(item.id, item.weight?.value) !== itemKey
      );
      
      toast({
        title: "از سبد خرید حذف شد",
        description: "محصول از سبد خرید شما حذف شد.",
      });
      
      return updatedItems;
    });
  };

  const updateQuantity = (id: string, quantity: number, weight?: string) => {
    if (quantity <= 0) {
      removeItem(id, weight);
      return;
    }

    setItems(currentItems => {
      const itemKey = getItemKey(id, weight);
      const updatedItems = currentItems.map(item => {
        if (getItemKey(item.id, item.weight?.value) === itemKey) {
          return { ...item, quantity };
        }
        return item;
      });
      
      return updatedItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "سبد خرید خالی شد",
      description: "تمام محصولات از سبد خرید حذف شدند.",
    });
  };

  const isInCart = (id: string, weight?: string): boolean => {
    const itemKey = getItemKey(id, weight);
    return items.some(item => getItemKey(item.id, item.weight?.value) === itemKey);
  };

  const getCartItemQuantity = (id: string, weight?: string): number => {
    const itemKey = getItemKey(id, weight);
    const item = items.find(item => getItemKey(item.id, item.weight?.value) === itemKey);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};