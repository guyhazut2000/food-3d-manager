import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import ShopperModel from "../avatar/model/ShopperModel";
import type { Avatar } from "../avatar/types";
import { cameraLookTarget, cameraPositionBehind, stepPlayer, type PlayerPose } from "./movement";
import useMouseSteering from "./useMouseSteering";
import useMovementKeys, { NONE_PRESSED } from "./useMovementKeys";

const MAX_FRAME_DELTA = 0.1;
const CAMERA_FOLLOW_RATE = 5;

type Props = {
  avatar: Avatar;
  pose: RefObject<PlayerPose>;
  frozen: boolean;
  cartContents: string[];
};

export default function Player({ avatar, pose, frozen, cartContents }: Props) {
  const group = useRef<Group>(null);
  const keys = useMovementKeys();
  const mouse = useMouseSteering(!frozen);
  const speed = useRef(0);
  const cameraGoal = useRef(new Vector3());
  const cameraTarget = useRef(new Vector3());

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_FRAME_DELTA);
    speed.current = stepPlayer(pose.current, frozen ? NONE_PRESSED : keys.current, delta, mouse.takeTurn());

    const { x, z, heading } = pose.current;
    group.current?.position.set(x, 0, z);
    group.current?.rotation.set(0, heading, 0);

    cameraGoal.current.set(...cameraPositionBehind(pose.current, mouse.view.current));
    camera.position.lerp(cameraGoal.current, 1 - Math.exp(-CAMERA_FOLLOW_RATE * delta));
    camera.lookAt(cameraTarget.current.set(...cameraLookTarget(pose.current)));
  });

  return (
    <group ref={group}>
      <ShopperModel avatar={avatar} speedRef={speed} cartContents={cartContents} />
    </group>
  );
}
