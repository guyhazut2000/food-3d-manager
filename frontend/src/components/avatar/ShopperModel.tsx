import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Avatar } from "../../types";

const BODY = {
  round: { torsoRadius: 0.38, torsoHeight: 0.55, legHeight: 0.45 },
  tall: { torsoRadius: 0.26, torsoHeight: 0.8, legHeight: 0.6 },
  small: { torsoRadius: 0.24, torsoHeight: 0.4, legHeight: 0.35 },
};

const HEAD_RADIUS = 0.22;
const CART_REAR_Z = 0.6;

type Props = {
  avatar: Avatar;
  speedRef?: RefObject<number>;
};

export default function ShopperModel({ avatar, speedRef }: Props) {
  const body = BODY[avatar.body_type];
  const shoulderY = body.legHeight + body.torsoHeight;
  const headY = shoulderY + HEAD_RADIUS * 0.9;
  const handleY = shoulderY - 0.15;

  const bodyRef = useRef<Group>(null);
  const wheelRefs = useRef<Group[]>([]);
  const walkTime = useRef(0);

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 0;
    walkTime.current += delta * Math.abs(speed) * 3;
    if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(walkTime.current)) * 0.05;
    for (const wheel of wheelRefs.current) wheel.rotation.x += (speed * delta) / 0.1;
  });

  const addWheel = (index: number) => (group: Group | null) => {
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
          <cylinderGeometry args={[body.torsoRadius * 0.85, body.torsoRadius, body.torsoHeight, 24]} />
          <meshStandardMaterial color={avatar.shirt_color} />
        </mesh>

        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * (body.torsoRadius * 0.85), handleY, CART_REAR_Z / 2]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
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
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}

        <Hat hat={avatar.hat} y={headY} />
      </group>

      <Cart style={avatar.cart_style} color={avatar.cart_color} handleY={handleY} addWheel={addWheel} />
    </group>
  );
}

function Hat({ hat, y }: { hat: Avatar["hat"]; y: number }) {
  if (hat === "cap") {
    return (
      <group position={[0, y, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[HEAD_RADIUS + 0.01, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 0.01, HEAD_RADIUS]}>
          <boxGeometry args={[0.3, 0.02, 0.18]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>
    );
  }
  if (hat === "beanie") {
    return (
      <group position={[0, y + 0.02, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[HEAD_RADIUS + 0.02, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[0, HEAD_RADIUS + 0.04, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      </group>
    );
  }
  if (hat === "chef") {
    return (
      <group position={[0, y + HEAD_RADIUS * 0.7, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.17, 0.17, 0.24, 24]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.22, 24, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }
  return null;
}

type CartProps = {
  style: Avatar["cart_style"];
  color: string;
  handleY: number;
  addWheel: (index: number) => (group: Group | null) => void;
};

function Cart({ style, color, handleY, addWheel }: CartProps) {
  if (style === "basket") {
    const basketY = handleY - 0.25;
    return (
      <group position={[0, basketY, CART_REAR_Z + 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.28, 0.32]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.15, 0.02, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </group>
    );
  }

  const racer = style === "racer";
  const basket = racer ? { width: 0.6, height: 0.25, depth: 1.0, y: 0.35 } : { width: 0.6, height: 0.42, depth: 0.8, y: 0.62 };
  const basketCenterZ = CART_REAR_Z + 0.1 + basket.depth / 2;
  const wheels: [number, number, number][] = [-1, 1].flatMap((x) =>
    [CART_REAR_Z + 0.15, CART_REAR_Z + basket.depth].map((z, i): [number, number, number] => [
      x * (basket.width / 2),
      racer && i === 0 ? 0.14 : 0.1,
      z,
    ]),
  );

  return (
    <group>
      <mesh position={[0, basket.y, basketCenterZ]} castShadow>
        <boxGeometry args={[basket.width, basket.height, basket.depth]} />
        <meshStandardMaterial color={color} wireframe={!racer} />
      </mesh>
      <mesh position={[0, basket.y - basket.height / 2, basketCenterZ]}>
        <boxGeometry args={[basket.width, 0.03, basket.depth]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {racer && (
        <mesh position={[0, basket.y + basket.height / 2 + 0.01, basketCenterZ]}>
          <boxGeometry args={[0.12, 0.02, basket.depth]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}

      <mesh position={[0, handleY, CART_REAR_Z]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, basket.width + 0.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {[-1, 1].map((side) => {
        const postHeight = handleY - basket.y;
        return (
          <mesh key={side} position={[side * (basket.width / 2), basket.y + postHeight / 2, CART_REAR_Z + 0.05]}>
            <cylinderGeometry args={[0.02, 0.02, postHeight]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        );
      })}

      {wheels.map(([x, radius, z], index) => (
        <group key={index} ref={addWheel(index)} position={[x, radius, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[radius, radius, 0.05, 16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
