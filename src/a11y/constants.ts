/**
 * WCAG 2.5.5 (Target Size) requires interactive targets of at least 44x44
 * density-independent pixels. Every interactive component should apply this
 * via `minHeight`/`minWidth` or `hitSlop`, not a component-specific magic number.
 */
export const MIN_TOUCH_TARGET = 44;

export function hitSlopForSize(measuredSize: number): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  const deficit = Math.max(0, MIN_TOUCH_TARGET - measuredSize);
  const perSide = deficit / 2;
  return { top: perSide, bottom: perSide, left: perSide, right: perSide };
}
