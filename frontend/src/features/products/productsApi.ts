import { request } from "../../shared/api/client";
import type { Product } from "./types";

export const productsApi = {
  list: () => request<Product[]>("GET", "/products"),
};
