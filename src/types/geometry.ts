// src/types/geometry.ts

/**
 * Represents a 2D point with X and Y coordinates.
 * In ClojureScript, this is often a map like `{:x 10, :y 20}`.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents a 2D rectangle, typically used for bounding boxes or selection areas.
 * In ClojureScript, this is often a map like `{:x 0, :y 0, :width 100, :height 50}`.
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Represents a 2x3 affine transformation matrix (used as a 3x3 matrix in 2D homogeneous coordinates).
 * The matrix components are `[a c e]`
 *                            `[b d f]`
 *                            `[0 0 1]`
 * These correspond to `ctx.transform(a, b, c, d, e, f)` in CanvasRenderingContext2D.
 * In ClojureScript, this is often a map like `{:a 1, :b 0, :c 0, :d 1, :e 0, :f 0}` for identity.
 */
export interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

/**
 * Defines how a shape's horizontal dimension is constrained relative to its parent.
 */
export type HorizontalConstraint =
  | 'left'
  | 'right'
  | 'leftright'
  | 'center'
  | 'scale';

/**
 * Defines how a shape's vertical dimension is constrained relative to its parent.
 */
export type VerticalConstraint =
  | 'top'
  | 'bottom'
  | 'topbottom'
  | 'center'
  | 'scale';

/**
 * Defines the style of a stroke cap at its start or end point.
 */
export type StrokeCap =
  | 'round'
  | 'square'
  | 'line-arrow'
  | 'triangle-arrow'
  | 'square-marker'
  | 'circle-marker'
  | 'diamond-marker'
  | null;

/**
 * Defines the alignment of a stroke relative to the path.
 */
export type StrokeAlignment = 'center' | 'inner' | 'outer';

/**
 * Defines the style of a stroke (e.g., solid, dashed).
 */
export type StrokeStyle = 'solid' | 'dotted' | 'dashed' | 'mixed';

/**
 * Defines how a text box grows (e.g., auto-width, auto-height).
 */
export type TextGrowType = 'auto-width' | 'auto-height' | 'fixed';
