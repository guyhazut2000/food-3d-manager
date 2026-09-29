import { useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Avatar } from "../avatar/types";
import type { Product } from "../products/types";
import CheckoutCounter from "./CheckoutCounter";
import { CHECKOUT_REACH, NOTHING_NEARBY, PICK_REACH, sameNearby, type Nearby } from "./nearby";
import { cameraLookTarget, cameraPositionBehind, cartFrontPoint, type PlayerPose } from "./movement";
import Player from "./Player";
import ProductShelves from "./ProductShelves";
import { isNearCheckout, slotsInReach, SPAWN, STORE_HALF_SIZE, type ProductSlot } from "./storeLayout";

type Props = {
  avatar: Avatar;
  slots: ProductSlot[];
  nearby: Nearby;
  frozen: boolean;
  cartContents: string[];
  onSelectProduct: (product: Product) => void;
  onOpenCheckout: () => void;
  onNearbyChange: (nearby: Nearby) => void;
};

export default function StoreScene({
  avatar,
  slots,
  nearby,
  frozen,
  cartContents,
  onSelectProduct,
  onOpenCheckout,
  onNearbyChange,
}: Props) {
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

      <ProductShelves
        slots={slots}
        nearestSlotIndex={nearby.slotIndex}
        productIdsInReach={nearby.productIdsInReach}
        onSelect={onSelectProduct}
      />
      <CheckoutCounter near={nearby.checkout} onOpen={onOpenCheckout} />
      <Player avatar={avatar} pose={pose} frozen={frozen} cartContents={cartContents} />
      <ProximityTracker pose={pose} slots={slots} onNearbyChange={onNearbyChange} />
    </Canvas>
  );
}

type ProximityProps = {
  pose: RefObject<PlayerPose>;
  slots: ProductSlot[];
  onNearbyChange: (nearby: Nearby) => void;
};

/** Checks what's in reach every frame but only reports when it changes, to avoid re-rendering per frame. */
function ProximityTracker({ pose, slots, onNearbyChange }: ProximityProps) {
  const lastReported = useRef<Nearby>(NOTHING_NEARBY);

  useFrame(() => {
    const front = cartFrontPoint(pose.current);
    const checkout = isNearCheckout(front.x, front.z, CHECKOUT_REACH);
    const inReach = slotsInReach(slots, front.x, front.z, PICK_REACH);
    const nearby: Nearby = {
      slotIndex: checkout || inReach.length === 0 ? null : slots.indexOf(inReach[0]),
      checkout,
      productIdsInReach: [...new Set(inReach.map((slot) => slot.product.id))].sort((a, b) => a - b),
    };

    if (!sameNearby(nearby, lastReported.current)) {
      lastReported.current = nearby;
      onNearbyChange(nearby);
    }
  });

  return null;
}
