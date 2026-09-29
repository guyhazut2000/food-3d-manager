/** What the shopper can interact with right now (press E): the checkout counter takes priority over products. */
export type Nearby = { slotIndex: number | null; checkout: boolean };

export const NOTHING_NEARBY: Nearby = { slotIndex: null, checkout: false };
