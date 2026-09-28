import { useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import type { Group } from "three";
import ShopperModel from "./avatar/ShopperModel";
import { api } from "../lib/api";
import { BODY_TYPES, CART_STYLES, HATS, type Avatar } from "../types";

const SKIN_COLORS = ["#fde7d0", "#f1c27d", "#c68642", "#8d5524", "#5c3a1e"];
const PALETTE = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#9333ea", "#ec4899", "#0f172a", "#f8fafc"];

type Props = {
  username: string;
  initialAvatar: Avatar;
  onSaved: (avatar: Avatar) => void;
};

export default function Onboarding({ username, initialAvatar, onSaved }: Props) {
  const [avatar, setAvatar] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof Avatar>(key: K, value: Avatar[K]) =>
    setAvatar((current) => ({ ...current, [key]: value }));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      onSaved(await api.saveAvatar(avatar));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your avatar.");
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-sky-100 to-emerald-100 md:flex-row">
      <section className="h-[45vh] md:h-screen md:flex-1">
        <Canvas
          shadows
          camera={{ position: [2.8, 2.2, 4], fov: 45 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.9, 0)}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
          <Turntable>
            <ShopperModel avatar={avatar} />
          </Turntable>
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={6} blur={2} />
        </Canvas>
      </section>

      <aside className="w-full space-y-5 overflow-y-auto bg-white p-6 shadow-xl md:h-screen md:w-96">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Hi {username}! 👋</h1>
          <p className="text-sm text-zinc-500">Build your shopper and pick your cart.</p>
        </div>

        <Field label="Body">
          <Choices options={BODY_TYPES} value={avatar.body_type} onChange={(v) => update("body_type", v)} />
        </Field>
        <Field label="Skin">
          <Swatches colors={SKIN_COLORS} value={avatar.skin_color} onChange={(v) => update("skin_color", v)} />
        </Field>
        <Field label="Shirt">
          <Swatches colors={PALETTE} value={avatar.shirt_color} onChange={(v) => update("shirt_color", v)} />
        </Field>
        <Field label="Hat">
          <Choices
            options={[...HATS, "none"] as const}
            value={avatar.hat ?? "none"}
            onChange={(v) => update("hat", v === "none" ? null : v)}
          />
        </Field>
        <Field label="Cart">
          <Choices options={CART_STYLES} value={avatar.cart_style} onChange={(v) => update("cart_style", v)} />
        </Field>
        <Field label="Cart color">
          <Swatches colors={PALETTE} value={avatar.cart_color} onChange={(v) => update("cart_color", v)} />
        </Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save & enter store →"}
        </button>
      </aside>
    </main>
  );
}

function Turntable({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.5;
  });
  return <group ref={group} position={[0, 0, -0.6]}>{children}</group>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-zinc-700">{label}</h2>
      {children}
    </div>
  );
}

function Choices<T extends string>({
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

function Swatches({
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
