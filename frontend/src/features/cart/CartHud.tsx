import { useState } from "react";
import { formatMoney } from "../../shared/money";
import Button from "../../shared/ui/Button";
import ErrorMessage from "../../shared/ui/ErrorMessage";
import type { Cart } from "./types";

type Props = {
  cart: Cart;
  error: string | null;
  onSetQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
};

export default function CartHud({ cart, error, onSetQuantity, onRemove, onCheckout }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="absolute right-4 top-4 w-[min(92vw,320px)] rounded-xl bg-white/90 shadow-lg backdrop-blur">
      <button
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-semibold text-zinc-900">
          🛒 {cart.item_count} {cart.item_count === 1 ? "item" : "items"}
        </span>
        <span className="text-lg font-bold text-zinc-900">{formatMoney(cart.total)}</span>
      </button>

      {cart.savings > 0 ? (
        <p className="-mt-2 px-4 pb-2 text-right text-xs font-medium text-emerald-700">
          You're saving {formatMoney(cart.savings)}
        </p>
      ) : null}

      {open ? (
        <div className="max-h-[50vh] space-y-2 overflow-y-auto border-t border-zinc-200 px-4 py-3">
          {cart.items.length === 0 ? (
            <p className="text-sm text-zinc-500">Your cart is empty. Walk up to a product and press E, or click it.</p>
          ) : (
            cart.items.map((line) => (
              <div key={line.product_id} className="flex items-center gap-2 text-sm">
                <span className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: line.color }} />
                <span className="min-w-0 flex-1 truncate" title={`${line.name} (${line.unit})`}>
                  {line.name}
                </span>
                <div className="flex items-center rounded border border-zinc-200">
                  <button
                    onClick={() => onSetQuantity(line.product_id, line.quantity - 1)}
                    aria-label={`Decrease ${line.name}`}
                    className="px-1.5 hover:bg-zinc-100"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{line.quantity}</span>
                  <button
                    onClick={() => onSetQuantity(line.product_id, line.quantity + 1)}
                    disabled={line.quantity >= 99}
                    aria-label={`Increase ${line.name}`}
                    className="px-1.5 hover:bg-zinc-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="w-16 text-right font-medium">{formatMoney(line.total)}</span>
                <button
                  onClick={() => onRemove(line.product_id)}
                  aria-label={`Remove ${line.name}`}
                  className="text-zinc-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}

      {cart.items.length > 0 ? (
        <div className="px-4 pb-3">
          <Button onClick={onCheckout} className="py-2 text-sm">
            Checkout · {formatMoney(cart.total)}
          </Button>
        </div>
      ) : null}

      {error ? (
        <div className="px-4 pb-3">
          <ErrorMessage message={error} />
        </div>
      ) : null}
    </section>
  );
}
