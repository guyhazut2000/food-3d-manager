import { useState } from "react";
import Button from "../../shared/ui/Button";
import Modal from "../../shared/ui/Modal";
import { InsightAlert, PriceTag } from "./PriceDetails";
import type { Product } from "./types";

const MAX_QUANTITY = 99;

type Props = {
  product: Product;
  inCart: number;
  onAdd: (quantity: number) => Promise<void>;
  onClose: () => void;
};

export default function ProductPanel({ product, inCart, onAdd, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function add() {
    setAdding(true);
    await onAdd(quantity);
    setAdding(false);
    onClose();
  }

  const changeQuantity = (delta: number) =>
    setQuantity((current) => Math.min(MAX_QUANTITY, Math.max(1, current + delta)));

  return (
    <Modal
      label={product.name}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 shrink-0 rounded-lg border border-zinc-200" style={{ backgroundColor: product.color }} />
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{product.name}</h2>
            <p className="text-sm capitalize text-zinc-500">
              {product.unit} · {product.category}
            </p>
          </div>
        </div>
      }
    >
      <PriceTag price={product.price} />
      <InsightAlert insight={product.insight} />

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-zinc-300">
          <button onClick={() => changeQuantity(-1)} aria-label="Decrease quantity" className="px-3 py-2 text-lg hover:bg-zinc-100">
            −
          </button>
          <span className="w-8 text-center font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button onClick={() => changeQuantity(1)} aria-label="Increase quantity" className="px-3 py-2 text-lg hover:bg-zinc-100">
            +
          </button>
        </div>
        <Button onClick={add} disabled={adding} className="py-2.5">
          {adding ? "Adding…" : "Add to cart"}
        </Button>
      </div>

      {inCart > 0 ? <p className="text-center text-sm text-zinc-500">Already in your cart: {inCart}</p> : null}
    </Modal>
  );
}
