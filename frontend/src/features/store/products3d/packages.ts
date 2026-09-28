import type { Package } from "../../products/types";

/** Shared unit shapes; every product part is one of these, scaled and positioned. */
export type Shape = "box" | "sphere" | "cylinder" | "taper" | "tub" | "pyramid" | "capsule" | "arc";

/** "product" uses the product's color, "label" is the white print area, anything else is a literal color. */
export type PartColor = "product" | "label" | `#${string}`;

export type Part = {
  shape: Shape;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color: PartColor;
};

export type PackageModel = {
  parts: Part[];
  /** Width along the shelf; decides how many facings fit in a column. */
  width: number;
};

const WOOD = "#9a6a3a";
const METAL = "#cbd5e1";
const GOLD = "#c9a227";
const PULP = "#d6cfc4";

// Models face +x (the aisle); origin is the bottom center, sitting on the shelf board.

function crate(contents: Part[]): PackageModel {
  return { width: 0.66, parts: [{ shape: "box", position: [0, 0.05, 0], scale: [0.3, 0.1, 0.62], color: WOOD }, ...contents] };
}

function grid(cols: number, rows: number, spacingX: number, spacingZ: number, make: (x: number, z: number) => Part[]): Part[] {
  const parts: Part[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      parts.push(...make((c - (cols - 1) / 2) * spacingX, (r - (rows - 1) / 2) * spacingZ));
    }
  }
  return parts;
}

const round = crate([
  ...grid(2, 4, 0.13, 0.14, (x, z) => [{ shape: "sphere", position: [x, 0.17, z], scale: [0.14, 0.14, 0.14], color: "product" }]),
  ...grid(1, 3, 0, 0.14, (_, z) => [{ shape: "sphere", position: [0, 0.28, z], scale: [0.14, 0.14, 0.14], color: "product" }]),
]);

const long = crate(
  grid(4, 2, 0.065, 0.28, (x, z) => [
    { shape: "capsule", position: [x, 0.14, z], rotation: [Math.PI / 2, 0, 0], scale: [0.06, 0.13, 0.06], color: "product" },
  ]),
);

const bunch = crate(
  grid(1, 3, 0, 0.19, (_, z) =>
    [-0.05, 0, 0.05].map((x): Part => ({
      shape: "arc",
      position: [x, 0.13, z],
      rotation: [Math.PI / 2, 0, 0.3],
      scale: [0.11, 0.11, 0.11],
      color: "product",
    })),
  ),
);

const tray: PackageModel = {
  width: 0.26,
  parts: [
    { shape: "box", position: [0, 0.035, 0], scale: [0.15, 0.07, 0.22], color: "#bbf7d0" },
    ...grid(2, 3, 0.06, 0.06, (x, z) => [{ shape: "sphere", position: [x, 0.085, z], scale: [0.06, 0.06, 0.06], color: "product" }]),
  ],
};

const carton: PackageModel = {
  width: 0.2,
  parts: [
    { shape: "box", position: [0, 0.17, 0], scale: [0.16, 0.34, 0.16], color: "product" },
    { shape: "box", position: [0, 0.14, 0], scale: [0.163, 0.12, 0.163], color: "label" },
    { shape: "pyramid", position: [0, 0.38, 0], rotation: [0, Math.PI / 4, 0], scale: [0.16, 0.08, 0.16], color: "product" },
  ],
};

const cerealBox: PackageModel = {
  width: 0.31,
  parts: [
    { shape: "box", position: [0, 0.2, 0], scale: [0.1, 0.4, 0.28], color: "product" },
    { shape: "box", position: [0.051, 0.22, 0], scale: [0.004, 0.18, 0.2], color: "label" },
  ],
};

const bag: PackageModel = {
  width: 0.25,
  parts: [
    { shape: "box", position: [0, 0.15, 0], scale: [0.12, 0.3, 0.22], color: "product" },
    { shape: "box", position: [0, 0.32, 0], scale: [0.04, 0.04, 0.22], color: "product" },
    { shape: "box", position: [0.061, 0.14, 0], scale: [0.004, 0.12, 0.16], color: "label" },
  ],
};

function stacked(parts: Part[], height: number, levels: number): Part[] {
  return Array.from({ length: levels }, (_, level) =>
    parts.map((part): Part => ({ ...part, position: [part.position[0], part.position[1] + level * height, part.position[2]] })),
  ).flat();
}

const can: PackageModel = {
  width: 0.17,
  parts: stacked(
    [
      { shape: "cylinder", position: [0, 0.07, 0], scale: [0.14, 0.13, 0.14], color: "product" },
      { shape: "cylinder", position: [0, 0.14, 0], scale: [0.14, 0.012, 0.14], color: METAL },
      { shape: "cylinder", position: [0, 0.006, 0], scale: [0.14, 0.012, 0.14], color: METAL },
    ],
    0.146,
    2,
  ),
};

const jar: PackageModel = {
  width: 0.2,
  parts: [
    { shape: "cylinder", position: [0, 0.08, 0], scale: [0.16, 0.16, 0.16], color: "product" },
    { shape: "cylinder", position: [0, 0.08, 0], scale: [0.164, 0.07, 0.164], color: "label" },
    { shape: "cylinder", position: [0, 0.18, 0], scale: [0.17, 0.04, 0.17], color: GOLD },
  ],
};

const bottle: PackageModel = {
  width: 0.15,
  parts: [
    { shape: "cylinder", position: [0, 0.13, 0], scale: [0.12, 0.26, 0.12], color: "product" },
    { shape: "cylinder", position: [0, 0.13, 0], scale: [0.123, 0.09, 0.123], color: "#fef3c7" },
    { shape: "taper", position: [0, 0.3, 0], scale: [0.12, 0.08, 0.12], color: "product" },
    { shape: "cylinder", position: [0, 0.37, 0], scale: [0.045, 0.07, 0.045], color: "product" },
    { shape: "cylinder", position: [0, 0.415, 0], scale: [0.05, 0.03, 0.05], color: "#1f2937" },
  ],
};

const tub: PackageModel = {
  width: 0.24,
  parts: stacked(
    [
      { shape: "tub", position: [0, 0.05, 0], scale: [0.2, 0.1, 0.2], color: "label" },
      { shape: "cylinder", position: [0, 0.105, 0], scale: [0.21, 0.015, 0.21], color: "product" },
    ],
    0.115,
    2,
  ),
};

const cup: PackageModel = {
  width: 0.15,
  parts: stacked(
    [
      { shape: "tub", position: [0, 0.05, 0], scale: [0.13, 0.1, 0.13], color: "product" },
      { shape: "cylinder", position: [0, 0.102, 0], scale: [0.135, 0.006, 0.135], color: METAL },
    ],
    0.108,
    2,
  ),
};

const block: PackageModel = {
  width: 0.23,
  parts: stacked(
    [
      { shape: "box", position: [0, 0.035, 0], scale: [0.12, 0.07, 0.2], color: "product" },
      { shape: "box", position: [0, 0.035, 0], scale: [0.124, 0.074, 0.07], color: "label" },
    ],
    0.075,
    2,
  ),
};

const eggCarton: PackageModel = {
  width: 0.38,
  parts: [
    { shape: "box", position: [0, 0.035, 0], scale: [0.15, 0.07, 0.34], color: PULP },
    ...grid(2, 6, 0.07, 0.055, (x, z) => [{ shape: "sphere", position: [x, 0.075, z], scale: [0.06, 0.05, 0.05], color: PULP }]),
    { shape: "box", position: [0.076, 0.035, 0], scale: [0.004, 0.04, 0.3], color: "product" },
  ],
};

const loaf: PackageModel = {
  width: 0.34,
  parts: [{ shape: "sphere", position: [0, 0.07, 0], scale: [0.17, 0.14, 0.32], color: "product" }],
};

export const PACKAGE_MODELS: Record<Package, PackageModel> = {
  round,
  long,
  bunch,
  tray,
  carton,
  tub,
  cup,
  block,
  egg_carton: eggCarton,
  loaf,
  bag,
  box: cerealBox,
  bottle,
  can,
  jar,
};
