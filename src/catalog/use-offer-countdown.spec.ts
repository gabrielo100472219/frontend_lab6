import { act, renderHook } from '@testing-library/react';
import { useOfferCountdown } from './use-offer-countdown';

describe('useOfferCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería empezar en los segundos indicados y sin terminar', () => {
    // Arrange
    const seconds = 5;

    // Act
    const { result } = renderHook(() => useOfferCountdown(seconds));

    // Assert
    expect(result.current).toEqual({ left: 5, finished: false });
  });

  it('debería bajar uno por segundo', () => {
    // Arrange
    const { result } = renderHook(() => useOfferCountdown(5));

    // Act
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Assert
    expect(result.current.left).toBe(4);

    // Act
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Assert
    expect(result.current.left).toBe(2);
  });

  it('no debería cambiar antes de que pase un segundo completo', () => {
    // Arrange
    const { result } = renderHook(() => useOfferCountdown(5));

    // Act
    act(() => {
      vi.advanceTimersByTime(999);
    });

    // Assert
    expect(result.current.left).toBe(5);
  });

  it('debería quedarse en 0 con finished: true cuando pasan más segundos de los indicados', () => {
    // Arrange
    const { result } = renderHook(() => useOfferCountdown(3));

    // Act
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    // Assert
    expect(result.current).toEqual({ left: 0, finished: true });
  });

  it('debería llamar a clearInterval al desmontar', () => {
    // Arrange
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useOfferCountdown(5));

    // Act
    unmount();

    // Assert
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
