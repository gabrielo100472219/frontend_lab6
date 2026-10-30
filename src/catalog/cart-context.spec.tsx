import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCartContext } from './cart-context';
import { coffees } from './test-data';

const [ethiopia, , brazil] = coffees;

describe('CartProvider + useCartContext', () => {
  it('debería empezar con el carrito vacío cuando se usa dentro del provider', () => {
    // Arrange

    // Act
    const { result } = renderHook(() => useCartContext(), { wrapper: CartProvider });

    // Assert
    expect(result.current.cart).toEqual([]);
    expect(result.current.units).toBe(0);
  });

  it('debería calcular el total con los cafés que recibe el provider', () => {
    // Arrange
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider coffees={coffees}>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCartContext(), { wrapper });

    // Act
    act(() => {
      result.current.add(ethiopia);
      result.current.add(brazil);
    });

    // Assert
    expect(result.current.units).toBe(2);
    expect(result.current.total).toBeCloseTo(23.91);
  });

  it('debería compartir el mismo carrito entre dos componentes dentro del mismo provider', () => {
    // Arrange
    const { result } = renderHook(
      () => ({ header: useCartContext(), catalog: useCartContext() }),
      { wrapper: CartProvider }
    );

    // Act
    act(() => {
      result.current.catalog.add(brazil);
    });

    // Assert
    expect(result.current.header.units).toBe(1);
  });

  it('debería lanzar un error cuando se usa sin el provider', () => {
    // Arrange

    // Act
    const renderWithoutProvider = () => renderHook(() => useCartContext());

    // Assert
    expect(renderWithoutProvider).toThrow('useCartContext debe usarse dentro de un CartProvider');
  });
});
