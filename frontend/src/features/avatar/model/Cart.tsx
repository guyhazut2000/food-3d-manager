import type { Group } from "three";
import type { Avatar } from "../types";
import { CART_REAR_Z, DARK_COLOR, FRAME_COLOR, WHEEL_RADIUS } from "./dimensions";

const RACER_REAR_WHEEL_RADIUS = 0.14;

const BASKETS = {
  classic: { width: 0.6, height: 0.42, depth: 0.8, y: 0.62 },
  racer: { width: 0.6, height: 0.25, depth: 1.0, y: 0.35 },
};

export type RegisterWheel = (index: number) => (group: Group | null) => void;

type Props = {
  style: Avatar["cart_style"];
  color: string;
  handleY: number;
  registerWheel: RegisterWheel;
  contents: string[];
};

export default function Cart({ style, color, handleY, registerWheel, contents }: Props) {
  return style === "basket" ? (
    <HandBasket color={color} handleY={handleY} contents={contents} />
  ) : (
    <WheeledCart
      racer={style === "racer"}
      color={color}
      handleY={handleY}
      registerWheel={registerWheel}
      contents={contents}
    />
  );
}

const ITEM_SIZE = 0.13;

/** Small boxes stacked in a grid of `columns` x `rows` per layer, centered on the origin. */
function CartItems({ colors, columns, rows, spacing }: { colors: string[]; columns: number; rows: number; spacing: number }) {
  const perLayer = columns * rows;
  return (
    <>
      {colors.slice(0, perLayer * 2).map((itemColor, index) => {
        const layer = Math.floor(index / perLayer);
        const column = index % columns;
        const row = Math.floor((index % perLayer) / columns);
        return (
          <mesh
            key={index}
            position={[
              (column - (columns - 1) / 2) * spacing,
              ITEM_SIZE / 2 + layer * ITEM_SIZE,
              (row - (rows - 1) / 2) * spacing,
            ]}
          >
            <boxGeometry args={[ITEM_SIZE, ITEM_SIZE, ITEM_SIZE]} />
            <meshStandardMaterial color={itemColor} />
          </mesh>
        );
      })}
    </>
  );
}

function HandBasket({ color, handleY, contents }: { color: string; handleY: number; contents: string[] }) {
  return (
    <group position={[0, handleY - 0.25, CART_REAR_Z + 0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.28, 0.32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 24, Math.PI]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>
      <group position={[0, 0.14, 0]}>
        <CartItems colors={contents} columns={3} rows={2} spacing={0.14} />
      </group>
    </group>
  );
}

type WheeledCartProps = {
  racer: boolean;
  color: string;
  handleY: number;
  registerWheel: RegisterWheel;
  contents: string[];
};

function WheeledCart({ racer, color, handleY, registerWheel, contents }: WheeledCartProps) {
  const basket = racer ? BASKETS.racer : BASKETS.classic;
  const basketCenterZ = CART_REAR_Z + 0.1 + basket.depth / 2;
  const postHeight = handleY - basket.y;
  const rearWheelRadius = racer ? RACER_REAR_WHEEL_RADIUS : WHEEL_RADIUS;

  const wheels = [-1, 1].flatMap((side) => [
    { x: side * (basket.width / 2), z: CART_REAR_Z + 0.15, radius: rearWheelRadius },
    { x: side * (basket.width / 2), z: CART_REAR_Z + basket.depth, radius: WHEEL_RADIUS },
  ]);

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
      <group position={[0, basket.y - basket.height / 2 + 0.015, basketCenterZ]}>
        <CartItems colors={contents} columns={3} rows={racer ? 6 : 4} spacing={0.16} />
      </group>
      {racer ? (
        <mesh position={[0, basket.y + basket.height / 2 + 0.01, basketCenterZ]}>
          <boxGeometry args={[0.12, 0.02, basket.depth]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ) : null}

      <mesh position={[0, handleY, CART_REAR_Z]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, basket.width + 0.1]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (basket.width / 2), basket.y + postHeight / 2, CART_REAR_Z + 0.05]}>
          <cylinderGeometry args={[0.02, 0.02, postHeight]} />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
      ))}

      {wheels.map(({ x, z, radius }, index) => (
        <group key={index} ref={registerWheel(index)} position={[x, radius, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[radius, radius, 0.05, 16]} />
            <meshStandardMaterial color={DARK_COLOR} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
