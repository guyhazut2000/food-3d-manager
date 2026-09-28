import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-zinc-700">{label}</h2>
      {children}
    </div>
  );
}

export function Choices<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={option === value}
          className={`rounded-full border px-4 py-1.5 text-sm capitalize ${
            option === value
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-zinc-300 text-zinc-700 hover:border-emerald-500"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function Swatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          aria-pressed={color.toLowerCase() === value.toLowerCase()}
          className={`h-8 w-8 rounded-full border-2 ${
            color.toLowerCase() === value.toLowerCase() ? "border-emerald-600 ring-2 ring-emerald-300" : "border-zinc-200"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
