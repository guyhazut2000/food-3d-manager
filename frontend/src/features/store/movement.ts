import { isBlocked } from "./storeLayout";
import type { MovementKeys } from "./useMovementKeys";

const MOVE_SPEED = 3.5;
const TURN_SPEED = 2.5;
const BODY_RADIUS = 0.4;
const CART_REACH = 1.3;
const CAMERA_SIDE_OFFSET_RATIO = 0.29;

/** Follow-camera framing; adjusted by mouse drag (height) and scroll (distance). */
export type CameraView = { distance: number; height: number };

export const DEFAULT_VIEW: CameraView = { distance: 4.5, height: 4 };
export const VIEW_LIMITS = { distance: [2.5, 10], height: [1.2, 9] } as const;

export type PlayerPose = { x: number; z: number; heading: number };

function axis(positive: boolean, negative: boolean): number {
  return (positive ? 1 : 0) - (negative ? 1 : 0);
}

function collides(x: number, z: number, heading: number): boolean {
  const cartX = x + Math.sin(heading) * CART_REACH;
  const cartZ = z + Math.cos(heading) * CART_REACH;
  return isBlocked(x, z, BODY_RADIUS) || isBlocked(cartX, cartZ, BODY_RADIUS);
}

/**
 * Advances the pose in place by one frame and returns the resulting speed (0 when blocked).
 * `extraTurn` is an additional heading change in radians, e.g. from mouse steering.
 */
export function stepPlayer(pose: PlayerPose, keys: MovementKeys, delta: number, extraTurn = 0): number {
  const nextHeading = pose.heading + axis(keys.left, keys.right) * TURN_SPEED * delta + extraTurn;
  if (!collides(pose.x, pose.z, nextHeading)) pose.heading = nextHeading;

  const direction = axis(keys.forward, keys.back);
  const step = direction * MOVE_SPEED * delta;
  if (step === 0) return 0;

  const nextX = pose.x + Math.sin(pose.heading) * step;
  const nextZ = pose.z + Math.cos(pose.heading) * step;
  if (collides(nextX, nextZ, pose.heading)) return 0;

  pose.x = nextX;
  pose.z = nextZ;
  return direction * MOVE_SPEED;
}

/** The point just in front of the cart, where the shopper would reach for a product. */
export function cartFrontPoint(pose: PlayerPose): { x: number; z: number } {
  return { x: pose.x + Math.sin(pose.heading) * CART_REACH, z: pose.z + Math.cos(pose.heading) * CART_REACH };
}

/** Over-the-shoulder follow camera: behind and slightly to the side, so the cart isn't hidden by the body. */
export function cameraPositionBehind(pose: PlayerPose, view: CameraView = DEFAULT_VIEW): [number, number, number] {
  const forwardX = Math.sin(pose.heading);
  const forwardZ = Math.cos(pose.heading);
  const sideOffset = view.distance * CAMERA_SIDE_OFFSET_RATIO;
  return [
    pose.x - forwardX * view.distance - forwardZ * sideOffset,
    view.height,
    pose.z - forwardZ * view.distance + forwardX * sideOffset,
  ];
}

export function cameraLookTarget(pose: PlayerPose): [number, number, number] {
  return [pose.x + Math.sin(pose.heading) * 2.5, 0.6, pose.z + Math.cos(pose.heading) * 2.5];
}
