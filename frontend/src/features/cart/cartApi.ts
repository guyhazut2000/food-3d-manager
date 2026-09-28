import { request } from "../../shared/api/client";
import type { Cart } from "./types";

export const cartApi = {
  get: () => request<Cart>("GET", "/cart"),
  add: (productId: number, quantity: number) =>
    request<Cart>("POST", "/cart/items", { product_id: productId, quantity }),
  setQuantity: (productId: number, quantity: number) =>
    request<Cart>("PATCH", `/cart/items/${productId}`, { quantity }),
  remove: (productId: number) => request<Cart>("DELETE", `/cart/items/${productId}`),
};
