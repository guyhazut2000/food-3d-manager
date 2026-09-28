import type { ButtonHTMLAttributes } from "react";

export default function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`w-full rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
