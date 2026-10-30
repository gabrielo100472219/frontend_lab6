import { applyCoupon } from './coupon';

describe('applyCoupon', () => {
  it('debería descontar un 10 % cuando el código es "CAFE10"', () => {
    // Arrange
    const total = 37.32;

    // Act
    const result = applyCoupon(total, 'CAFE10');

    // Assert
    expect(result).toBeCloseTo(33.588);
  });

  it('debería restar 3,90 € cuando el código es "ENVIO"', () => {
    // Arrange
    const total = 20;

    // Act
    const result = applyCoupon(total, 'ENVIO');

    // Assert
    expect(result).toBeCloseTo(16.1);
  });

  it.each([2, 3.9])('debería dejar el total en 0 cuando "ENVIO" se aplica a %d €', (total) => {
    // Arrange

    // Act
    const result = applyCoupon(total, 'ENVIO');

    // Assert
    expect(result).toBe(0);
  });

  it.each([' cafe10 ', 'cafe10', 'Cafe10', '  CaFe10  '])(
    'debería aceptar "%s" como "CAFE10" (sin distinguir mayúsculas ni espacios)',
    (code) => {
      // Arrange
      const total = 100;

      // Act
      const result = applyCoupon(total, code);

      // Assert
      expect(result).toBeCloseTo(90);
    }
  );

  it('debería aceptar " envio " como "ENVIO"', () => {
    // Arrange
    const total = 10;

    // Act
    const result = applyCoupon(total, ' envio ');

    // Assert
    expect(result).toBeCloseTo(6.1);
  });

  it.each(['GRATIS', '', 'CAFE 10', 'CAFE100'])(
    'debería lanzar "Cupón no válido" cuando el código es "%s"',
    (code) => {
      // Arrange
      const total = 20;

      // Act
      const apply = () => applyCoupon(total, code);

      // Assert
      expect(apply).toThrow('Cupón no válido');
    }
  );
});
