/** Fictional marketing examples only. Never used for real business decisions or API writes. */
export const sampleSale = {
  vendor: 'Tola’s everyday store',
  owner: 'Tola',
  customer: 'Amaka Bello',
  product: 'Everyday adire tote',
  variant: 'Indigo & cream',
  unitPriceKobo: 1_200_000,
  minimumUnitPriceKobo: 1_100_000,
  quantity: 2,
  stock: 12,
  deliveryFeeKobo: 150_000,
  delivery: 'Yaba, Lagos · 2–3 working days',
  orderId: 'INV-DEMO-014',
} as const;

export function sampleMoney(kobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function checkSampleOffer(offerKobo: number) {
  if (!Number.isSafeInteger(offerKobo) || offerKobo <= 0)
    throw new RangeError('Use a positive integer kobo amount.');
  const minimumKobo = sampleSale.minimumUnitPriceKobo * sampleSale.quantity;
  return {
    needsApproval: offerKobo < minimumKobo,
    minimumKobo,
    shortfallKobo: Math.max(0, minimumKobo - offerKobo),
  };
}
