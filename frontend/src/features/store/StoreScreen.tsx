import { useCallback, useEffect, useMemo, useState } from "react";
import { describeError } from "../../shared/api/client";
import ErrorMessage from "../../shared/ui/ErrorMessage";
import type { User } from "../auth/types";
import type { Avatar } from "../avatar/types";
import CartHud from "../cart/CartHud";
import useCart from "../cart/useCart";
import ProductPanel from "../products/ProductPanel";
import { productsApi } from "../products/productsApi";
import type { Product } from "../products/types";
import StoreScene from "./StoreScene";
import { layoutProducts } from "./storeLayout";

const MAX_ITEMS_SHOWN_IN_CART = 36;

type Props = {
  user: User;
  avatar: Avatar;
  onEditAvatar: () => void;
  onLogout: () => void;
};

export default function StoreScreen({ user, avatar, onEditAvatar, onLogout }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [nearestSlotIndex, setNearestSlotIndex] = useState<number | null>(null);
  const { cart, error: cartError, add, setQuantity, remove } = useCart();

  useEffect(() => {
    productsApi
      .list()
      .then(setProducts)
      .catch((err) => setLoadError(describeError(err, "Could not load products.")));
  }, []);

  const slots = useMemo(() => layoutProducts(products), [products]);

  const cartContents = useMemo(
    () => cart.items.flatMap((line) => Array<string>(line.quantity).fill(line.color)).slice(0, MAX_ITEMS_SHOWN_IN_CART),
    [cart.items],
  );

  useEffect(() => {
    const openNearestOnE = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || selected) return;
      if (nearestSlotIndex !== null) setSelected(slots[nearestSlotIndex].product);
    };
    window.addEventListener("keydown", openNearestOnE);
    return () => window.removeEventListener("keydown", openNearestOnE);
  }, [slots, nearestSlotIndex, selected]);

  const closePanel = useCallback(() => setSelected(null), []);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <StoreScene
        avatar={avatar}
        slots={slots}
        nearestSlotIndex={selected ? null : nearestSlotIndex}
        frozen={selected !== null}
        cartContents={cartContents}
        onSelect={setSelected}
        onNearestChange={setNearestSlotIndex}
      />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2 shadow">
        <span className="font-semibold text-zinc-900">🛒 {user.username}</span>
        <button onClick={onEditAvatar} className="rounded-lg px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
          Edit avatar
        </button>
        <button onClick={onLogout} className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100">
          Log out
        </button>
      </div>

      <CartHud cart={cart} error={cartError} onSetQuantity={setQuantity} onRemove={remove} />

      {loadError ? (
        <div className="absolute left-1/2 top-20 -translate-x-1/2">
          <ErrorMessage message={loadError} />
        </div>
      ) : null}

      {selected ? (
        <ProductPanel
          product={selected}
          inCart={cart.items.find((line) => line.product_id === selected.id)?.quantity ?? 0}
          onAdd={(quantity) => add(selected.id, quantity)}
          onClose={closePanel}
        />
      ) : null}

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
        W/S or ↑/↓ to push · A/D or right-drag to steer · scroll to zoom · E or click a product
      </p>
    </main>
  );
}
