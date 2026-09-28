import type { Avatar } from "../types";
import { HEAD_RADIUS } from "./dimensions";

type Props = { hat: Avatar["hat"]; y: number };

export default function Hat({ hat, y }: Props) {
  switch (hat) {
    case "cap":
      return (
        <group position={[0, y, 0]}>
          <Dome radius={HEAD_RADIUS + 0.01} color="#dc2626" />
          <mesh position={[0, 0.01, HEAD_RADIUS]}>
            <boxGeometry args={[0.3, 0.02, 0.18]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
        </group>
      );
    case "beanie":
      return (
        <group position={[0, y + 0.02, 0]}>
          <Dome radius={HEAD_RADIUS + 0.02} color="#7c3aed" />
          <mesh position={[0, HEAD_RADIUS + 0.04, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
        </group>
      );
    case "chef":
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
    case null:
      return null;
  }
}

function Dome({ radius, color }: { radius: number; color: string }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
