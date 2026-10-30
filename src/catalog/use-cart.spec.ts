import { act, renderHook } from '@testing-library/react';
import { useCart } from './use-cart';
import { coffees } from './test-data';

const [ethiopia, , brazil] = coffees;

describe('useCart', () => {
  it('debería empezar con el carrito vacío, 0 unidades y total 0', () => {
    // Arrange

    // Act
    const { result } = renderHook(() => useCart(coffees));

    // Assert
    expect(result.current.cart).toEqual([]);
    expect(result.current.units).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('debería tener 2 unidades y total 21 cuando se añade Brasil dos veces en dos act', () => {
    // Arrange
    const { result } = renderHook(() => useCart(coffees));

    // Act
    act(() => {
      result.current.add(brazil);
    });
    act(() => {
      result.current.add(brazil);
    });

    // Assert
    expect(result.current.units).toBe(2);
    expect(result.current.total).toBeCloseTo(21);
  });

  it('debería quedarse en 0 unidades cuando se añade un café y se vacía el carrito', () => {
    // Arrange
    const { result } = renderHook(() => useCart(coffees));
    act(() => {
      result.current.add(ethiopia);
    });

    // Act
    act(() => {
      result.current.clear();
    });

    // Assert
    expect(result.current.units).toBe(0);
    expect(result.current.cart).toEqual([]);
  });

  it('debería tener 2 unidades cuando se añaden dos cafés dentro del mismo act', () => {
    // Arrange
    const { result } = renderHook(() => useCart(coffees));

    // Act
    act(() => {
      result.current.add(brazil);
      result.current.add(brazil);
    });

    // Assert
    expect(result.current.units).toBe(2);
  });
});
