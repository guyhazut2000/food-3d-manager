export type Shelf = { x: number; z: number; width: number; depth: number; height: number };

export const STORE_HALF_SIZE = 15;

export const SHELVES: Shelf[] = [-7.5, -2.5, 2.5, 7.5].map((x) => ({
  x,
  z: -2,
  width: 1,
  depth: 12,
  height: 2,
}));

export const SPAWN = { x: 0, z: 11, heading: Math.PI };

const WALL_MARGIN = 0.5;

export function isBlocked(x: number, z: number, radius: number): boolean {
  const limit = STORE_HALF_SIZE - WALL_MARGIN - radius;
  if (Math.abs(x) > limit || Math.abs(z) > limit) return true;

  return SHELVES.some(
    (shelf) =>
      Math.abs(x - shelf.x) < shelf.width / 2 + radius && Math.abs(z - shelf.z) < shelf.depth / 2 + radius,
  );
}
