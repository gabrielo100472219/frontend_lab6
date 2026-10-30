const SHIPPING = 3.9;

const coupons: Record<string, (total: number) => number> = {
  CAFE10: (total) => total * 0.9,
  ENVIO: (total) => Math.max(total - SHIPPING, 0),
};

export const applyCoupon = (total: number, code: string): number => {
  const coupon = coupons[code.trim().toUpperCase()];
  if (!coupon) {
    throw new Error('Cupón no válido');
  }
  return coupon(total);
};
