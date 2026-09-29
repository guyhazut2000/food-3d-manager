/** Max distance (m) from the front of the cart to a product's shelf spot for it to be added to the cart. */
export const PICK_REACH = 1.5;

/** Max distance (m) from the front of the cart to the checkout counter's edge. */
export const CHECKOUT_REACH = 1.2;

/**
 * What the shopper can interact with right now. `slotIndex` is the closest product in reach (the E key target);
 * the checkout counter takes priority over products.
 */
export type Nearby = { slotIndex: number | null; checkout: boolean; productIdsInReach: number[] };

export const NOTHING_NEARBY: Nearby = { slotIndex: null, checkout: false, productIdsInReach: [] };

export function sameNearby(a: Nearby, b: Nearby): boolean {
  return (
    a.slotIndex === b.slotIndex &&
    a.checkout === b.checkout &&
    a.productIdsInReach.length === b.productIdsInReach.length &&
    a.productIdsInReach.every((id, index) => id === b.productIdsInReach[index])
  );
}
