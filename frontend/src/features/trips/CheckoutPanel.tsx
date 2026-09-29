import { useState } from "react";
import { describeError } from "../../shared/api/client";
import { formatMoney } from "../../shared/money";
import Button from "../../shared/ui/Button";
import ErrorMessage from "../../shared/ui/ErrorMessage";
import Modal from "../../shared/ui/Modal";
import type { Cart } from "../cart/types";
import Receipt from "./Receipt";
import { tripsApi } from "./tripsApi";
import type { Trip } from "./types";

type Props = {
  cart: Cart;
  onCheckedOut: () => void;
  onClose: () => void;
};

export default function CheckoutPanel({ cart, onCheckedOut, onClose }: Props) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setPaying(true);
    setError(null);
    try {
      setTrip(await tripsApi.checkout());
      onCheckedOut();
    } catch (err) {
      setError(describeError(err, "Checkout failed. Please try again."));
    } finally {
      setPaying(false);
    }
  }

  if (trip) {
    return (
      <Modal label="Receipt" onClose={onClose} title={<h2 className="text-xl font-bold text-zinc-900">✅ Trip saved</h2>}>
        <Receipt trip={trip} />
        <Button onClick={onClose} className="py-2.5">
          Continue shopping
        </Button>
      </Modal>
    );
  }

  const empty = cart.items.length === 0;

  return (
    <Modal label="Checkout" onClose={onClose} title={<h2 className="text-xl font-bold text-zinc-900">🧾 Checkout</h2>}>
      {empty ? (
        <p className="text-sm text-zinc-500">Your cart is empty — grab something from the shelves first.</p>
      ) : (
        <>
          <ul className="max-h-[35vh] divide-y divide-zinc-100 overflow-y-auto">
            {cart.items.map((line) => (
              <li key={line.product_id} className="flex items-center gap-2 py-2 text-sm">
                <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: line.color }} />
                <span className="min-w-0 flex-1 truncate">{line.name}</span>
                <span className="text-zinc-500">× {line.quantity}</span>
                <span className="w-16 text-right font-medium">{formatMoney(line.total)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-zinc-200 pt-2 text-sm">
            {cart.savings > 0 ? (
              <p className="flex justify-between text-emerald-700">
                <span>Savings</span>
                <span>{formatMoney(cart.savings)}</span>
              </p>
            ) : null}
            <p className="flex justify-between text-lg font-bold text-zinc-900">
              <span>Total</span>
              <span>{formatMoney(cart.total)}</span>
            </p>
          </div>
        </>
      )}

      <ErrorMessage message={error} />

      <Button onClick={checkout} disabled={empty || paying} className="py-3">
        {paying ? "Saving trip…" : `Pay ${formatMoney(cart.total)}`}
      </Button>
      <p className="text-center text-xs text-zinc-400">No real payment — this records the trip in your history.</p>
    </Modal>
  );
}
