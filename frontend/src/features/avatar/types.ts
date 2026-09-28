export const BODY_TYPES = ["round", "tall", "small"] as const;
export const HATS = ["cap", "beanie", "chef"] as const;
export const CART_STYLES = ["classic", "basket", "racer"] as const;

export type Avatar = {
  body_type: (typeof BODY_TYPES)[number];
  skin_color: string;
  shirt_color: string;
  hat: (typeof HATS)[number] | null;
  cart_style: (typeof CART_STYLES)[number];
  cart_color: string;
};

export const DEFAULT_AVATAR: Avatar = {
  body_type: "round",
  skin_color: "#f1c27d",
  shirt_color: "#2563eb",
  hat: "cap",
  cart_style: "classic",
  cart_color: "#dc2626",
};
