import type { Category, Product } from "../products/types";

export type Shelf = { x: number; z: number; width: number; depth: number; height: number; category: Category };

/** One product's column on one face of a shelf; `x` is the shelf's front edge on that face. */
export type ProductSlot = { product: Product; x: number; z: number; face: -1 | 1; columnWidth: number };

export const STORE_HALF_SIZE = 15;

const AISLE_CATEGORIES: Category[] = ["produce", "dairy", "bakery", "pantry"];

export const SHELVES: Shelf[] = [-7.5, -2.5, 2.5, 7.5].map((x, index) => ({
  x,
  z: -2,
  width: 1,
  depth: 12,
  height: 1.8,
  category: AISLE_CATEGORIES[index],
}));

export const SPAWN = { x: 0, z: 11, heading: Math.PI };

/** Checkout counter near the entrance; `width` runs along x, `depth` along z. */
export const CHECKOUT_COUNTER = { x: 4.5, z: 9.5, width: 1.2, depth: 3, height: 0.9 };

/** Heights of the shelf boards products stand on. */
export const TIER_HEIGHTS = [0.12, 0.7, 1.28];
export const LABEL_HEIGHT = 2.05;
const SLOT_END_MARGIN = 0.3;
const FACES = [-1, 1] as const;
const WALL_MARGIN = 0.5;

export function isBlocked(x: number, z: number, radius: number): boolean {
  const limit = STORE_HALF_SIZE - WALL_MARGIN - radius;
  if (Math.abs(x) > limit || Math.abs(z) > limit) return true;

  return [...SHELVES, CHECKOUT_COUNTER].some(
    (obstacle) =>
      Math.abs(x - obstacle.x) < obstacle.width / 2 + radius && Math.abs(z - obstacle.z) < obstacle.depth / 2 + radius,
  );
}

/** Whether a point on the floor is within reach of the checkout counter's edge. */
export function isNearCheckout(x: number, z: number, reach: number): boolean {
  const dx = Math.max(Math.abs(x - CHECKOUT_COUNTER.x) - CHECKOUT_COUNTER.width / 2, 0);
  const dz = Math.max(Math.abs(z - CHECKOUT_COUNTER.z) - CHECKOUT_COUNTER.depth / 2, 0);
  return Math.hypot(dx, dz) < reach;
}

/** Gives each product a column on both faces of its category's shelf, so it can be reached from either aisle. */
export function layoutProducts(products: Product[]): ProductSlot[] {
  return SHELVES.flatMap((shelf) => {
    const onShelf = products.filter((product) => product.category === shelf.category);
    const columnWidth = (shelf.depth - SLOT_END_MARGIN * 2) / Math.max(onShelf.length, 1);
    const firstZ = shelf.z - shelf.depth / 2 + SLOT_END_MARGIN + columnWidth / 2;
    return FACES.flatMap((face) =>
      onShelf.map((product, index) => ({
        product,
        x: shelf.x + (face * shelf.width) / 2,
        z: firstZ + index * columnWidth,
        face,
        columnWidth,
      })),
    );
  });
}

function distanceToSlot(slot: ProductSlot, x: number, z: number): number {
  return Math.hypot(slot.x - x, slot.z - z);
}

/** Slots within reach of a point on the floor, nearest first. */
export function slotsInReach(slots: ProductSlot[], x: number, z: number, reach: number): ProductSlot[] {
  return slots
    .map((slot) => ({ slot, distance: distanceToSlot(slot, x, z) }))
    .filter(({ distance }) => distance < reach)
    .sort((a, b) => a.distance - b.distance)
    .map(({ slot }) => slot);
}
