import { isBlocked } from "./storeLayout";
import type { MovementKeys } from "./useMovementKeys";

const MOVE_SPEED = 3.5;
const TURN_SPEED = 2.5;
const BODY_RADIUS = 0.4;
const CART_REACH = 1.3;
const CAMERA_DISTANCE = 5;
const CAMERA_HEIGHT = 3.5;

export type PlayerPose = { x: number; z: number; heading: number };

function axis(positive: boolean, negative: boolean): number {
  return (positive ? 1 : 0) - (negative ? 1 : 0);
}

function collides(x: number, z: number, heading: number): boolean {
  const cartX = x + Math.sin(heading) * CART_REACH;
  const cartZ = z + Math.cos(heading) * CART_REACH;
  return isBlocked(x, z, BODY_RADIUS) || isBlocked(cartX, cartZ, BODY_RADIUS);
}

/** Advances the pose in place by one frame and returns the resulting speed (0 when blocked). */
export function stepPlayer(pose: PlayerPose, keys: MovementKeys, delta: number): number {
  const nextHeading = pose.heading + axis(keys.left, keys.right) * TURN_SPEED * delta;
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

export function cameraPositionBehind(pose: PlayerPose): [number, number, number] {
  return [
    pose.x - Math.sin(pose.heading) * CAMERA_DISTANCE,
    CAMERA_HEIGHT,
    pose.z - Math.cos(pose.heading) * CAMERA_DISTANCE,
  ];
}

export function cameraLookTarget(pose: PlayerPose): [number, number, number] {
  return [pose.x + Math.sin(pose.heading), 1, pose.z + Math.cos(pose.heading)];
}
