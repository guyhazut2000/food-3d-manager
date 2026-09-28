import { useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Avatar } from "../avatar/types";
import type { Product } from "../products/types";
import { cameraLookTarget, cameraPositionBehind, cartFrontPoint, type PlayerPose } from "./movement";
import Player from "./Player";
import ProductShelves from "./ProductShelves";
import { nearestSlot, SPAWN, STORE_HALF_SIZE, type ProductSlot } from "./storeLayout";

const PICK_REACH = 2.6;

type Props = {
  avatar: Avatar;
  slots: ProductSlot[];
  nearestSlotIndex: number | null;
  frozen: boolean;
  cartContents: string[];
  onSelect: (product: Product) => void;
  onNearestChange: (slotIndex: number | null) => void;
};

export default function StoreScene({ avatar, slots, nearestSlotIndex, frozen, cartContents, onSelect, onNearestChange }: Props) {
  const pose = useRef<PlayerPose>({ ...SPAWN });

  return (
    <Canvas
      shadows
      camera={{ position: cameraPositionBehind(SPAWN), fov: 55 }}
      onCreated={({ camera }) => camera.lookAt(...cameraLookTarget(SPAWN))}
    >
      <color attach="background" args={["#dbeafe"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 15, 8]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]}>
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.1, 50]} />
      </directionalLight>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[STORE_HALF_SIZE * 2, STORE_HALF_SIZE * 2]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <ProductShelves slots={slots} nearestSlotIndex={nearestSlotIndex} onSelect={onSelect} />
      <Player avatar={avatar} pose={pose} frozen={frozen} cartContents={cartContents} />
      <ProximityTracker pose={pose} slots={slots} onNearestChange={onNearestChange} />
    </Canvas>
  );
}

type ProximityProps = {
  pose: RefObject<PlayerPose>;
  slots: ProductSlot[];
  onNearestChange: (slotIndex: number | null) => void;
};

/** Checks the nearest product every frame but only reports when it changes, to avoid re-rendering per frame. */
function ProximityTracker({ pose, slots, onNearestChange }: ProximityProps) {
  const lastReported = useRef<number | null>(null);

  useFrame(() => {
    const front = cartFrontPoint(pose.current);
    const nearest = nearestSlot(slots, front.x, front.z, PICK_REACH);
    const nearestIndex = nearest ? slots.indexOf(nearest) : null;
    if (nearestIndex !== lastReported.current) {
      lastReported.current = nearestIndex;
      onNearestChange(nearestIndex);
    }
  });

  return null;
}
