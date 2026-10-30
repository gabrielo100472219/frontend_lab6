import type { CartItem, Coffee } from './model';
import { addToCart, cartTotal, finalPrice, formatPrice, removeFromCart } from './cart';
import { coffees } from './test-data';

const [ethiopia, colombia, brazil] = coffees;

describe('cart', () => {
  describe('formatPrice', () => {
    it('debería mostrar dos decimales y el símbolo del euro cuando el precio tiene un decimal', () => {
      // Arrange
      const price = 14.9;

      // Act
      const result = formatPrice(price);

      // Assert
      expect(result).toBe('14.90 €');
    });

    it('debería añadir ".00" cuando el precio es un número entero', () => {
      // Arrange
      const price = 10;

      // Act
      const result = formatPrice(price);

      // Assert
      expect(result).toBe('10.00 €');
    });
  });

  describe('finalPrice', () => {
    it('debería aplicar el descuento cuando el café tiene descuento', () => {
      // Arrange
      const coffee = ethiopia;

      // Act
      const result = finalPrice(coffee);

      // Assert
      expect(result).toBeCloseTo(13.41);
    });

    it('debería devolver el precio tal cual cuando el café no tiene descuento', () => {
      // Arrange
      const coffee = colombia;

      // Act
      const result = finalPrice(coffee);

      // Assert
      expect(result).toBe(12.9);
    });

    it('debería devolver el precio tal cual cuando el descuento es 0', () => {
      // Arrange
      const coffee: Coffee = { ...colombia, discount: 0 };

      // Act
      const result = finalPrice(coffee);

      // Assert
      expect(result).toBe(12.9);
    });
  });

  describe('addToCart', () => {
    it('debería añadir el café con cantidad 1 cuando el carrito está vacío', () => {
      // Arrange
      const cart: CartItem[] = [];

      // Act
      const result = addToCart(cart, brazil.id);

      // Assert
      expect(result).toEqual([{ coffeeId: brazil.id, quantity: 1 }]);
    });

    it('debería sumar 1 a la cantidad cuando el café ya está en el carrito', () => {
      // Arrange
      const cart: CartItem[] = [
        { coffeeId: ethiopia.id, quantity: 2 },
        { coffeeId: brazil.id, quantity: 1 },
      ];

      // Act
      const result = addToCart(cart, ethiopia.id);

      // Assert
      expect(result).toEqual([
        { coffeeId: ethiopia.id, quantity: 3 },
        { coffeeId: brazil.id, quantity: 1 },
      ]);
    });

    it('no debería modificar el carrito que recibe cuando el café ya está en él', () => {
      // Arrange
      const cart: CartItem[] = [{ coffeeId: ethiopia.id, quantity: 1 }];
      const original = structuredClone(cart);

      // Act
      const result = addToCart(cart, ethiopia.id);

      // Assert
      expect(cart).toEqual(original);
      expect(result).not.toBe(cart);
    });

    it('no debería modificar el carrito que recibe cuando el café es nuevo', () => {
      // Arrange
      const cart: CartItem[] = [{ coffeeId: ethiopia.id, quantity: 1 }];
      const original = structuredClone(cart);

      // Act
      const result = addToCart(cart, brazil.id);

      // Assert
      expect(cart).toEqual(original);
      expect(result).not.toBe(cart);
    });
  });

  describe('removeFromCart', () => {
    it('debería quitar el café indicado y dejar los demás', () => {
      // Arrange
      const cart: CartItem[] = [
        { coffeeId: ethiopia.id, quantity: 2 },
        { coffeeId: colombia.id, quantity: 1 },
        { coffeeId: brazil.id, quantity: 3 },
      ];

      // Act
      const result = removeFromCart(cart, colombia.id);

      // Assert
      expect(result).toEqual([
        { coffeeId: ethiopia.id, quantity: 2 },
        { coffeeId: brazil.id, quantity: 3 },
      ]);
    });

    it('no debería modificar el carrito que recibe', () => {
      // Arrange
      const cart: CartItem[] = [
        { coffeeId: ethiopia.id, quantity: 2 },
        { coffeeId: colombia.id, quantity: 1 },
      ];
      const original = structuredClone(cart);

      // Act
      const result = removeFromCart(cart, colombia.id);

      // Assert
      expect(cart).toEqual(original);
      expect(result).not.toBe(cart);
    });
  });

  describe('cartTotal', () => {
    it('debería devolver 0 cuando el carrito está vacío', () => {
      // Arrange
      const cart: CartItem[] = [];

      // Act
      const result = cartTotal(cart, coffees);

      // Assert
      expect(result).toBe(0);
    });

    it('debería sumar precio final por cantidad cuando hay 2 × Etiopía y 1 × Brasil', () => {
      // Arrange
      const cart: CartItem[] = [
        { coffeeId: ethiopia.id, quantity: 2 },
        { coffeeId: brazil.id, quantity: 1 },
      ];

      // Act
      const result = cartTotal(cart, coffees);

      // Assert
      expect(result).toBeCloseTo(37.32);
    });

    it('debería contar como 0 un coffeeId que no existe en el catálogo', () => {
      // Arrange
      const cart: CartItem[] = [
        { coffeeId: brazil.id, quantity: 1 },
        { coffeeId: 999, quantity: 5 },
      ];

      // Act
      const result = cartTotal(cart, coffees);

      // Assert
      expect(result).toBeCloseTo(10.5);
    });
  });
});
