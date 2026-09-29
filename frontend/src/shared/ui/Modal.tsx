import { useEffect, type ReactNode } from "react";

type Props = {
  title: ReactNode;
  label: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
};

/** Centered dialog over the 3D view; closes with the × button or Escape. */
export default function Modal({ title, label, onClose, children, width = "w-[min(92vw,380px)]" }: Props) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={label}
      className={`absolute left-1/2 top-1/2 ${width} -translate-x-1/2 -translate-y-1/2 space-y-4 rounded-2xl bg-white p-6 shadow-2xl`}
    >
      <div className="flex items-start justify-between gap-3">
        {title}
        <button onClick={onClose} aria-label="Close" className="rounded-lg px-2 text-2xl leading-none text-zinc-400 hover:text-zinc-700">
          ×
        </button>
      </div>
      {children}
    </div>
  );
}
