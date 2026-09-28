"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const SHELF_POSITIONS: [number, number, number][] = [
  [-4, 1, 0],
  [0, 1, 0],
  [4, 1, 0],
];

export default function StoreScene() {
  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 50 }} shadows>
      <color attach="background" args={["#dbeafe"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {SHELF_POSITIONS.map((position) => (
        <mesh key={position.join(",")} position={position} castShadow>
          <boxGeometry args={[1, 2, 6]} />
          <meshStandardMaterial color="#a16207" />
        </mesh>
      ))}

      <OrbitControls maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
