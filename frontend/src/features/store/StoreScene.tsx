import { Canvas } from "@react-three/fiber";
import Player from "./Player";
import { SHELVES, STORE_HALF_SIZE } from "./storeLayout";
import type { Avatar } from "../avatar/types";

const PRODUCT_COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

export default function StoreScene({ avatar }: { avatar: Avatar }) {
  return (
    <Canvas shadows camera={{ position: [0, 4, 16], fov: 55 }}>
      <color attach="background" args={["#dbeafe"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[8, 15, 8]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]}>
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20, 0.1, 50]} />
      </directionalLight>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[STORE_HALF_SIZE * 2, STORE_HALF_SIZE * 2]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {SHELVES.map((shelf, shelfIndex) => (
        <group key={shelfIndex} position={[shelf.x, 0, shelf.z]}>
          <mesh position={[0, shelf.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[shelf.width, shelf.height, shelf.depth]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
          {[0.7, 1.4].flatMap((y) =>
            Array.from({ length: 8 }, (_, i) => {
              const z = -shelf.depth / 2 + 0.6 + i * ((shelf.depth - 1.2) / 7);
              return (
                <mesh key={`${y}-${i}`} position={[0, y + 0.2, z]} castShadow>
                  <boxGeometry args={[shelf.width + 0.2, 0.35, 0.5]} />
                  <meshStandardMaterial color={PRODUCT_COLORS[(shelfIndex + i + y * 10) % PRODUCT_COLORS.length]} />
                </mesh>
              );
            }),
          )}
        </group>
      ))}

      <Player avatar={avatar} />
    </Canvas>
  );
}
