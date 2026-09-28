export type CartLine = {
  product_id: number;
  name: string;
  unit: string;
  color: string;
  quantity: number;
  unit_price: number;
  total: number;
  savings: number;
};

export type Cart = {
  items: CartLine[];
  item_count: number;
  total: number;
  savings: number;
};

export const EMPTY_CART: Cart = { items: [], item_count: 0, total: 0, savings: 0 };
