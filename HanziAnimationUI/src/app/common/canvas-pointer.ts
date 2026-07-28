export interface CanvasPoint {
  x: number;
  y: number;
}

export interface TimedPoint extends CanvasPoint {
  time: number;
}

/**
 * Discriminates a touch event without ever naming `TouchEvent` in a *value*
 * position.
 *
 * `e instanceof TouchEvent` throws `ReferenceError: TouchEvent is not defined`
 * on browsers that do not expose the global -- Firefox without a touchscreen,
 * Safari on macOS. That threw before `isDrawing` was ever set, which is what
 * made the test-mode canvas dead on desktop while still working on mobile.
 *
 * The `TouchEvent` below is a type annotation only, and types are erased at
 * compile time, so it is safe everywhere.
 */
export function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return 'touches' in e;
}

/**
 * Point of `e` relative to `rectSource`, or null when the event carries no
 * usable coordinate (a `touchend` has an empty `touches` list).
 *
 * `rectSource` is the element the listener is attached to: the canvas in test
 * mode, the hanzi-writer overlay <svg> in copy mode.
 *
 * Uses `clientX - rect.left` rather than `offsetX`/`offsetY` deliberately.
 * hanzi-writer sets no `pointer-events` on the <path> nodes it appends, so once
 * reference strokes render, `e.target` on a mousemove becomes an inner SVG node
 * and `offsetX` is then measured against *that* node -- which is
 * browser-divergent. hanzi-writer's own `_getMousePoint` uses this same form.
 *
 * No canvas/rect scale factor: the overlay <svg> and the canvas are separate
 * elements that merely coincide today, so a `canvas.width / rect.width` factor
 * would compute the wrong transform the moment either box is resized. Neither
 * mode is responsive.
 */
export function getCanvasPoint(
  e: MouseEvent | TouchEvent,
  rectSource: Element
): CanvasPoint | null {
  let clientX: number;
  let clientY: number;

  if (isTouchEvent(e)) {
    if (e.touches.length === 0) {
      return null;
    }
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const rect = rectSource.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}
