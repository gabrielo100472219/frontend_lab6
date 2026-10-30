import React from 'react';
import type { Coffee } from './model';
import { useCart } from './use-cart';

type CartContextValue = ReturnType<typeof useCart>;

const CartContext = React.createContext<CartContextValue | null>(null);

interface Props {
  coffees?: Coffee[];
  children: React.ReactNode;
}

export const CartProvider: React.FC<Props> = ({ coffees = [], children }) => {
  const cart = useCart(coffees);
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

export const useCartContext = (): CartContextValue => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext debe usarse dentro de un CartProvider');
  }
  return context;
};
