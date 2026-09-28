import { useState } from "react";
import { Html } from "@react-three/drei";
import { formatMoney } from "../../shared/money";
import type { Product } from "../products/types";
import ShelfProducts from "./products3d/ShelfProducts";
import { LABEL_HEIGHT, SHELVES, TIER_HEIGHTS, type ProductSlot, type Shelf } from "./storeLayout";

const FRAME_COLOR = "#e5e7eb";
const BOARD_COLOR = "#f8fafc";
const PLINTH_COLOR = "#475569";
const BOARD_THICKNESS = 0.04;

type Props = {
  slots: ProductSlot[];
  nearestSlotIndex: number | null;
  onSelect: (product: Product) => void;
};

export default function ProductShelves({ slots, nearestSlotIndex, onSelect }: Props) {
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const activeSlotIndex = hoveredSlotIndex ?? nearestSlotIndex;
  const activeSlot = activeSlotIndex === null ? null : slots[activeSlotIndex];

  const hover = (slotIndex: number | null) => {
    setHoveredSlotIndex(slotIndex);
    document.body.style.cursor = slotIndex === null ? "" : "pointer";
  };

  return (
    <>
      {SHELVES.map((shelf) => (
        <Gondola key={shelf.category} shelf={shelf} />
      ))}

      <ShelfProducts
        slots={slots}
        activeProductId={activeSlot?.product.id ?? null}
        onSelect={(slotIndex) => onSelect(slots[slotIndex].product)}
        onHover={hover}
      />

      {activeSlot ? (
        <Html position={[activeSlot.x + activeSlot.face * 0.15, LABEL_HEIGHT, activeSlot.z]} center distanceFactor={8}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-lg bg-zinc-900/85 px-3 py-1.5 text-center text-white shadow-lg">
            <div className="text-sm font-semibold">{activeSlot.product.name}</div>
            <div className="text-xs">
              {formatMoney(activeSlot.product.price.unit)}
              {activeSlotIndex === nearestSlotIndex ? " · press E" : " · click"}
            </div>
          </div>
        </Html>
      ) : null}
    </>
  );
}

/** Double-sided supermarket shelf unit: plinth, center back panel, and shelf boards on both faces. */
function Gondola({ shelf }: { shelf: Shelf }) {
  return (
    <group position={[shelf.x, 0, shelf.z]}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[shelf.width, 0.1, shelf.depth]} />
        <meshStandardMaterial color={PLINTH_COLOR} />
      </mesh>
      <mesh position={[0, shelf.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, shelf.height, shelf.depth]} />
        <meshStandardMaterial color={FRAME_COLOR} />
      </mesh>
      {TIER_HEIGHTS.map((y) => (
        <mesh key={y} position={[0, y - BOARD_THICKNESS / 2, 0]} receiveShadow>
          <boxGeometry args={[shelf.width, BOARD_THICKNESS, shelf.depth]} />
          <meshStandardMaterial color={BOARD_COLOR} />
        </mesh>
      ))}
      {[-1, 1].map((end) => (
        <mesh key={end} position={[0, shelf.height / 2, (end * shelf.depth) / 2]} castShadow>
          <boxGeometry args={[shelf.width, shelf.height, 0.05]} />
          <meshStandardMaterial color={FRAME_COLOR} />
        </mesh>
      ))}
      <Html position={[0, shelf.height + 0.45, shelf.depth / 2]} center distanceFactor={12}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-md bg-emerald-700 px-3 py-1 text-sm font-bold uppercase tracking-wide text-white shadow">
          {shelf.category}
        </div>
      </Html>
    </group>
  );
}
