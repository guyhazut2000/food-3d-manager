import { useEffect, useRef } from "react";

export type MovementKeys = { forward: boolean; back: boolean; left: boolean; right: boolean };

const KEY_BINDINGS: Record<string, keyof MovementKeys> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

const NONE_PRESSED: MovementKeys = { forward: false, back: false, left: false, right: false };

/** Tracks held movement keys in a ref so per-frame reads never trigger re-renders. */
export default function useMovementKeys() {
  const pressed = useRef<MovementKeys>({ ...NONE_PRESSED });

  useEffect(() => {
    const setKey = (isDown: boolean) => (event: KeyboardEvent) => {
      const action = KEY_BINDINGS[event.code];
      if (!action) return;
      event.preventDefault();
      pressed.current[action] = isDown;
    };
    const onKeyDown = setKey(true);
    const onKeyUp = setKey(false);
    const releaseAll = () => {
      pressed.current = { ...NONE_PRESSED };
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", releaseAll);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", releaseAll);
    };
  }, []);

  return pressed;
}
