import { useState } from "react";
import { Html } from "@react-three/drei";
import { CHECKOUT_COUNTER } from "./storeLayout";

const CLICK_DRAG_TOLERANCE_PX = 6;

type Props = {
  near: boolean;
  onOpen: () => void;
};

export default function CheckoutCounter({ near, onOpen }: Props) {
  const [hovered, setHovered] = useState(false);
  const { x, z, width, depth, height } = CHECKOUT_COUNTER;
  const active = near || hovered;

  const hover = (isHovered: boolean) => {
    setHovered(isHovered);
    document.body.style.cursor = isHovered ? "pointer" : "";
  };

  return (
    <group
      position={[x, 0, z]}
      onClick={(event) => {
        if (event.delta > CLICK_DRAG_TOLERANCE_PX) return;
        event.stopPropagation();
        onOpen();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(true);
      }}
      onPointerOut={() => hover(false)}
    >
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#334155" emissive={active ? "#facc15" : "#000000"} emissiveIntensity={active ? 0.25 : 0} />
      </mesh>
      <mesh position={[0, height + 0.01, -0.3]}>
        <boxGeometry args={[width * 0.6, 0.02, depth * 0.7]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0, height + 0.25, depth / 2 - 0.35]}>
        <boxGeometry args={[0.08, 0.5, 0.08]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      <mesh position={[0, height + 0.55, depth / 2 - 0.35]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[0.35, 0.25, 0.05]} />
        <meshStandardMaterial color="#0f172a" emissive="#22d3ee" emissiveIntensity={0.4} />
      </mesh>
      <Html position={[0, height + 1.2, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-md bg-emerald-700 px-3 py-1 text-center text-sm font-bold uppercase tracking-wide text-white shadow">
          Checkout
          {active ? <div className="text-xs font-medium normal-case">{near ? "press E" : "click"}</div> : null}
        </div>
      </Html>
    </group>
  );
}
