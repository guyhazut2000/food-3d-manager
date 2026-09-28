export type Category = "produce" | "dairy" | "bakery" | "pantry";

export type Package =
  | "round"
  | "long"
  | "bunch"
  | "tray"
  | "carton"
  | "tub"
  | "cup"
  | "block"
  | "egg_carton"
  | "loaf"
  | "bag"
  | "box"
  | "bottle"
  | "can"
  | "jar";

export type ProductPrice = {
  regular: number;
  sale: number | null;
  deal_quantity: number | null;
  deal_price: number | null;
  unit: number;
  best_unit: number;
};

export type PriceInsight = {
  kind: "lowest" | "highest" | "above_low" | "stable";
  lowest: number;
  highest: number;
  percent_above_low: number;
};

export type Product = {
  id: number;
  name: string;
  category: Category;
  unit: string;
  color: string;
  package: Package;
  price: ProductPrice;
  insight: PriceInsight;
};
