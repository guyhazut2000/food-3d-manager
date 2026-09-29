export type TripSummary = {
  id: string;
  checked_out_at: string;
  item_count: number;
  total: number;
  savings: number;
};

export type TripItem = {
  product_id: number | null;
  name: string;
  unit: string;
  color: string;
  quantity: number;
  unit_price: number;
  total: number;
  savings: number;
};

export type Trip = TripSummary & { items: TripItem[] };
