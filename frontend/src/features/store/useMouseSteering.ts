import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { DEFAULT_VIEW, VIEW_LIMITS, type CameraView } from "./movement";

const TURN_PER_PIXEL = 0.006;
const HEIGHT_PER_PIXEL = 0.02;
const ZOOM_PER_WHEEL_UNIT = 0.004;
const RIGHT_BUTTON = 2;

const clamp = (value: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, value));

/**
 * Hold the right mouse button and drag on the 3D view: left/right steers the shopper, up/down tilts the camera.
 * The scroll wheel zooms. Returns refs read every frame, so dragging never re-renders React.
 */
export default function useMouseSteering(enabled: boolean) {
  const canvas = useThree((state) => state.gl.domElement);
  const pendingTurn = useRef(0);
  const view = useRef<CameraView>({ ...DEFAULT_VIEW });

  useEffect(() => {
    if (!enabled) return;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== RIGHT_BUTTON) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      pendingTurn.current -= (event.clientX - lastX) * TURN_PER_PIXEL;
      view.current.height = clamp(view.current.height + (event.clientY - lastY) * HEIGHT_PER_PIXEL, VIEW_LIMITS.height);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const stopDragging = (event: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    const suppressContextMenu = (event: MouseEvent) => event.preventDefault();
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      view.current.distance = clamp(view.current.distance + event.deltaY * ZOOM_PER_WHEEL_UNIT, VIEW_LIMITS.distance);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", suppressContextMenu);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", stopDragging);
      canvas.removeEventListener("pointercancel", stopDragging);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", suppressContextMenu);
    };
  }, [canvas, enabled]);

  /** Returns and clears the heading change accumulated since the last frame. */
  const takeTurn = () => {
    const turn = pendingTurn.current;
    pendingTurn.current = 0;
    return turn;
  };

  return { view, takeTurn };
}
