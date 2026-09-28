import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  Euler,
  type InstancedMesh,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
} from "three";
import { TIER_HEIGHTS, type ProductSlot } from "../storeLayout";
import { PACKAGE_MODELS, type PartColor, type Shape } from "./packages";

const GEOMETRIES: Record<Shape, BufferGeometry> = {
  box: new BoxGeometry(1, 1, 1),
  sphere: new SphereGeometry(0.5, 14, 10),
  cylinder: new CylinderGeometry(0.5, 0.5, 1, 18),
  taper: new CylinderGeometry(0.18, 0.5, 1, 18),
  tub: new CylinderGeometry(0.5, 0.4, 1, 18),
  pyramid: new CylinderGeometry(0, 0.71, 1, 4),
  capsule: new CapsuleGeometry(0.5, 1, 4, 10),
  arc: new TorusGeometry(1, 0.2, 6, 14, Math.PI * 0.6),
};

const LABEL_COLOR = "#f8fafc";
const HIGHLIGHT_COLOR = new Color("#fde047");
const HIGHLIGHT_AMOUNT = 0.45;
/** How far an item's center sits back from the shelf's front edge. */
const ITEM_INSET = 0.2;
const MAX_FACINGS = 4;
const CLICK_DRAG_TOLERANCE_PX = 6;

type Batch = {
  shape: Shape;
  matrices: Matrix4[];
  colors: Color[];
  slotIndexes: number[];
};

function resolveColor(color: PartColor, productColor: string): Color {
  if (color === "product") return new Color(productColor);
  if (color === "label") return new Color(LABEL_COLOR);
  return new Color(color);
}

/** Expands every slot into shelf items (tiers × facings) and groups their parts by shape for instancing. */
function buildBatches(slots: ProductSlot[]): Batch[] {
  const batches = new Map<Shape, Batch>();
  const placement = new Matrix4();
  const part = new Matrix4();

  slots.forEach((slot, slotIndex) => {
    const model = PACKAGE_MODELS[slot.product.package];
    const facings = Math.min(MAX_FACINGS, Math.max(1, Math.floor((slot.columnWidth * 0.92) / model.width)));
    const facingRotation = new Quaternion().setFromEuler(new Euler(0, slot.face === 1 ? 0 : Math.PI, 0));

    for (const tierY of TIER_HEIGHTS) {
      for (let facing = 0; facing < facings; facing++) {
        const z = slot.z + (facing - (facings - 1) / 2) * model.width;
        placement.compose(new Vector3(slot.x - slot.face * ITEM_INSET, tierY, z), facingRotation, new Vector3(1, 1, 1));

        for (const { shape, position, rotation = [0, 0, 0], scale, color } of model.parts) {
          part.compose(new Vector3(...position), new Quaternion().setFromEuler(new Euler(...rotation)), new Vector3(...scale));
          const batch = batches.get(shape) ?? { shape, matrices: [], colors: [], slotIndexes: [] };
          batch.matrices.push(placement.clone().multiply(part));
          batch.colors.push(resolveColor(color, slot.product.color));
          batch.slotIndexes.push(slotIndex);
          batches.set(shape, batch);
        }
      }
    }
  });

  return [...batches.values()];
}

type Props = {
  slots: ProductSlot[];
  activeProductId: number | null;
  onSelect: (slotIndex: number) => void;
  onHover: (slotIndex: number | null) => void;
};

export default function ShelfProducts({ slots, activeProductId, onSelect, onHover }: Props) {
  const batches = useMemo(() => buildBatches(slots), [slots]);
  return (
    <>
      {batches.map((batch) => (
        <ShapeBatch
          key={`${batch.shape}-${batch.matrices.length}`}
          batch={batch}
          slots={slots}
          activeProductId={activeProductId}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </>
  );
}

type ShapeBatchProps = Omit<Props, "slots"> & { batch: Batch; slots: ProductSlot[] };

function ShapeBatch({ batch, slots, activeProductId, onSelect, onHover }: ShapeBatchProps) {
  const mesh = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    batch.matrices.forEach((matrix, index) => instanced.setMatrixAt(index, matrix));
    instanced.instanceMatrix.needsUpdate = true;
    instanced.computeBoundingSphere();
  }, [batch]);

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    const color = new Color();
    batch.colors.forEach((base, index) => {
      const active = slots[batch.slotIndexes[index]].product.id === activeProductId;
      instanced.setColorAt(index, active ? color.copy(base).lerp(HIGHLIGHT_COLOR, HIGHLIGHT_AMOUNT) : base);
    });
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  }, [batch, slots, activeProductId]);

  const slotAt = (event: ThreeEvent<PointerEvent | MouseEvent>) =>
    event.instanceId === undefined ? null : batch.slotIndexes[event.instanceId];

  return (
    <instancedMesh
      ref={mesh}
      args={[GEOMETRIES[batch.shape], undefined, batch.matrices.length]}
      onClick={(event) => {
        const slotIndex = slotAt(event);
        if (slotIndex === null || event.delta > CLICK_DRAG_TOLERANCE_PX) return;
        event.stopPropagation();
        onSelect(slotIndex);
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        onHover(slotAt(event));
      }}
      onPointerOut={() => onHover(null)}
    >
      <meshStandardMaterial roughness={0.55} />
    </instancedMesh>
  );
}
