import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import ShopperModel from "./avatar/ShopperModel";
import { isBlocked, SPAWN } from "../lib/storeLayout";
import type { Avatar } from "../types";

const MOVE_SPEED = 3.5;
const TURN_SPEED = 2.5;
const BODY_RADIUS = 0.4;
const CART_REACH = 1.3;
const CAMERA_DISTANCE = 5;
const CAMERA_HEIGHT = 3.5;

const KEY_BINDINGS: Record<string, "forward" | "back" | "left" | "right"> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

function useMovementKeys() {
  const pressed = useRef({ forward: false, back: false, left: false, right: false });

  useEffect(() => {
    const handle = (isDown: boolean) => (event: KeyboardEvent) => {
      const action = KEY_BINDINGS[event.code];
      if (!action) return;
      event.preventDefault();
      pressed.current[action] = isDown;
    };
    const onDown = handle(true);
    const onUp = handle(false);
    const releaseAll = () => Object.keys(pressed.current).forEach((k) => (pressed.current[k as keyof typeof pressed.current] = false));

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", releaseAll);
    };
  }, []);

  return pressed;
}

function collides(x: number, z: number, heading: number): boolean {
  const cartX = x + Math.sin(heading) * CART_REACH;
  const cartZ = z + Math.cos(heading) * CART_REACH;
  return isBlocked(x, z, BODY_RADIUS) || isBlocked(cartX, cartZ, BODY_RADIUS);
}

export default function Player({ avatar }: { avatar: Avatar }) {
  const group = useRef<Group>(null);
  const keys = useMovementKeys();
  const state = useRef({ x: SPAWN.x, z: SPAWN.z, heading: SPAWN.heading });
  const speed = useRef(0);
  const cameraGoal = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { forward, back, left, right } = keys.current;
    const player = state.current;

    const turn = (left ? 1 : 0) - (right ? 1 : 0);
    const nextHeading = player.heading + turn * TURN_SPEED * delta;
    if (!collides(player.x, player.z, nextHeading)) player.heading = nextHeading;

    const direction = (forward ? 1 : 0) - (back ? 1 : 0);
    const step = direction * MOVE_SPEED * delta;
    const nextX = player.x + Math.sin(player.heading) * step;
    const nextZ = player.z + Math.cos(player.heading) * step;
    const blocked = step !== 0 && collides(nextX, nextZ, player.heading);
    if (!blocked) {
      player.x = nextX;
      player.z = nextZ;
    }
    speed.current = blocked ? 0 : direction * MOVE_SPEED;

    group.current?.position.set(player.x, 0, player.z);
    group.current?.rotation.set(0, player.heading, 0);

    const behindX = player.x - Math.sin(player.heading) * CAMERA_DISTANCE;
    const behindZ = player.z - Math.cos(player.heading) * CAMERA_DISTANCE;
    cameraGoal.current.set(behindX, CAMERA_HEIGHT, behindZ);
    camera.position.lerp(cameraGoal.current, 1 - Math.exp(-5 * delta));
    cameraTarget.current.set(player.x + Math.sin(player.heading), 1, player.z + Math.cos(player.heading));
    camera.lookAt(cameraTarget.current);
  });

  return (
    <group ref={group}>
      <ShopperModel avatar={avatar} speedRef={speed} />
    </group>
  );
}
