import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Avatar } from "../types";
import Cart, { type RegisterWheel } from "./Cart";
import Hat from "./Hat";
import { BODY, CART_REAR_Z, DARK_COLOR, HEAD_RADIUS, WHEEL_RADIUS } from "./dimensions";

const WALK_BOB_HEIGHT = 0.05;
const WALK_BOB_RATE = 3;

type Props = {
  avatar: Avatar;
  speedRef?: RefObject<number>;
  /** Colors of items to show inside the cart. */
  cartContents?: string[];
};

export default function ShopperModel({ avatar, speedRef, cartContents = [] }: Props) {
  const body = BODY[avatar.body_type];
  const shoulderY = body.legHeight + body.torsoHeight;
  const headY = shoulderY + HEAD_RADIUS * 0.9;
  const handleY = shoulderY - 0.15;
  const armX = body.torsoRadius * 0.85;

  const bodyRef = useRef<Group>(null);
  const wheelRefs = useRef<Group[]>([]);
  const walkTime = useRef(0);

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 0;
    walkTime.current += delta * Math.abs(speed) * WALK_BOB_RATE;
    if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(walkTime.current)) * WALK_BOB_HEIGHT;
    for (const wheel of wheelRefs.current) wheel.rotation.x += (speed * delta) / WHEEL_RADIUS;
  });

  const registerWheel: RegisterWheel = (index) => (group) => {
    if (group) wheelRefs.current[index] = group;
  };

  return (
    <group>
      <group ref={bodyRef}>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, body.legHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, body.legHeight]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))}

        <mesh position={[0, body.legHeight + body.torsoHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[armX, body.torsoRadius, body.torsoHeight, 24]} />
          <meshStandardMaterial color={avatar.shirt_color} />
        </mesh>

        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * armX, handleY, CART_REAR_Z / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, CART_REAR_Z]} />
            <meshStandardMaterial color={avatar.shirt_color} />
          </mesh>
        ))}

        <mesh position={[0, headY, 0]} castShadow>
          <sphereGeometry args={[HEAD_RADIUS, 24, 24]} />
          <meshStandardMaterial color={avatar.skin_color} />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, headY + 0.04, HEAD_RADIUS * 0.92]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color={DARK_COLOR} />
          </mesh>
        ))}

        <Hat hat={avatar.hat} y={headY} />
      </group>

      <Cart
        style={avatar.cart_style}
        color={avatar.cart_color}
        handleY={handleY}
        registerWheel={registerWheel}
        contents={cartContents}
      />
    </group>
  );
}
