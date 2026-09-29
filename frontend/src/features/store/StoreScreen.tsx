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
import CheckoutPanel from "../trips/CheckoutPanel";
import TripsPanel from "../trips/TripsPanel";
import { NOTHING_NEARBY, type Nearby } from "./nearby";
import StoreScene from "./StoreScene";
import { layoutProducts } from "./storeLayout";

const MAX_ITEMS_SHOWN_IN_CART = 36;

type Overlay = { kind: "product"; product: Product } | { kind: "checkout" } | { kind: "trips" } | null;

type Props = {
  user: User;
  avatar: Avatar;
  onEditAvatar: () => void;
  onLogout: () => void;
};

export default function StoreScreen({ user, avatar, onEditAvatar, onLogout }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [nearby, setNearby] = useState<Nearby>(NOTHING_NEARBY);
  const { cart, error: cartError, add, setQuantity, remove, reload: reloadCart } = useCart();

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

  const openCheckout = useCallback(() => setOverlay({ kind: "checkout" }), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  useEffect(() => {
    const interactOnE = (event: KeyboardEvent) => {
      if (event.code !== "KeyE" || overlay) return;
      if (nearby.checkout) setOverlay({ kind: "checkout" });
      else if (nearby.slotIndex !== null) setOverlay({ kind: "product", product: slots[nearby.slotIndex].product });
    };
    window.addEventListener("keydown", interactOnE);
    return () => window.removeEventListener("keydown", interactOnE);
  }, [slots, nearby, overlay]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <StoreScene
        avatar={avatar}
        slots={slots}
        nearby={overlay ? NOTHING_NEARBY : nearby}
        frozen={overlay !== null}
        cartContents={cartContents}
        onSelectProduct={(product) => setOverlay({ kind: "product", product })}
        onOpenCheckout={openCheckout}
        onNearbyChange={setNearby}
      />

      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-white/85 px-4 py-2 shadow">
        <span className="font-semibold text-zinc-900">🛒 {user.username}</span>
        <button
          onClick={() => setOverlay({ kind: "trips" })}
          className="rounded-lg px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-50"
        >
          Trips
        </button>
        <button onClick={onEditAvatar} className="rounded-lg px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-50">
          Edit avatar
        </button>
        <button onClick={onLogout} className="rounded-lg px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100">
          Log out
        </button>
      </div>

      <CartHud cart={cart} error={cartError} onSetQuantity={setQuantity} onRemove={remove} onCheckout={openCheckout} />

      {loadError ? (
        <div className="absolute left-1/2 top-20 -translate-x-1/2">
          <ErrorMessage message={loadError} />
        </div>
      ) : null}

      {overlay?.kind === "product" ? (
        <ProductPanel
          product={overlay.product}
          inCart={cart.items.find((line) => line.product_id === overlay.product.id)?.quantity ?? 0}
          onAdd={(quantity) => add(overlay.product.id, quantity)}
          onClose={closeOverlay}
        />
      ) : null}
      {overlay?.kind === "checkout" ? <CheckoutPanel cart={cart} onCheckedOut={reloadCart} onClose={closeOverlay} /> : null}
      {overlay?.kind === "trips" ? <TripsPanel onClose={closeOverlay} /> : null}

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
        W/S push · A/D or right-drag steer · scroll zoom · E or click to pick & check out
      </p>
    </main>
  );
}
