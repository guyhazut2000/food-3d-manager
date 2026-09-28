import { useCallback, useEffect, useState } from "react";
import { describeError } from "../../shared/api/client";
import { cartApi } from "./cartApi";
import { EMPTY_CART, type Cart } from "./types";

/** Server-backed cart: every change returns the full recalculated cart, which replaces local state. */
export default function useCart() {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async (change: Promise<Cart>) => {
    try {
      setCart(await change);
      setError(null);
    } catch (err) {
      setError(describeError(err, "Could not update your cart."));
    }
  }, []);

  useEffect(() => {
    cartApi
      .get()
      .then(setCart)
      .catch((err) => setError(describeError(err, "Could not load your cart.")));
  }, []);

  return {
    cart,
    error,
    add: (productId: number, quantity: number) => apply(cartApi.add(productId, quantity)),
    setQuantity: (productId: number, quantity: number) => apply(cartApi.setQuantity(productId, quantity)),
    remove: (productId: number) => apply(cartApi.remove(productId)),
  };
}
