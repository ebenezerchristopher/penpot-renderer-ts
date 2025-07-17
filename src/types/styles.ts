// src/types/styles.ts
import { UUID, HexColor } from './common';
//import { Point } from './geometry'; // Used for gradient start/end, and shadow offsets

// --- Image Metadata (for image fills and image shapes) ---
/**
 * Metadata for an image used as a fill or in an image shape.
 * Corresponds to `schema:image` in `color.cljc`.
 */
export interface ImageMeta {
  id: UUID;
  width: number;
  height: number;
  mtype?: string; // Mime type, e.g., "image/jpeg", "image/png"
  name?: string;
  keepAspectRatio?: boolean;
}

// --- Gradients ---
/**
 * Defines a single color stop in a gradient.
 */
export interface GradientStop {
  color: HexColor;
  opacity?: number; // 0-1
  offset: number; // 0-1
}

/**
 * Defines the type of gradient.
 */
export type GradientType = 'linear' | 'radial';

/**
 * Base properties common to all gradient fills.
 */
interface BaseGradientFill {
  // `start-x`, `start-y`, `end-x`, `end-y` are typically absolute coordinates
  // representing the gradient vector. In Clojure, they are just numbers.
  // We'll keep them as numbers, but note their context.
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;
  width: number; // For radial, might be radius? Need to confirm context.
  stops: GradientStop[];
}

/**
 * Represents a linear gradient fill.
 */
export interface LinearGradientFill extends BaseGradientFill {
  type: 'linear';
}

/**
 * Represents a radial gradient fill.
 */
export interface RadialGradientFill extends BaseGradientFill {
  type: 'radial';
}

/**
 * A discriminated union type for gradient fills.
 * Corresponds to `schema:gradient` in `color.cljc`.
 */
export type GradientFill = LinearGradientFill | RadialGradientFill;

// --- Fills (Color, Gradient, Image) ---
/**
 * Base properties common to all fill types.
 */
interface BaseFill {
  fill_opacity?: number; // 0-1
  fill_color_ref_file?: UUID; // Reference to a color in an external file (library)
  fill_color_ref_id?: UUID; // Reference to a specific color asset within the file/library
}

/**
 * Represents a solid color fill.
 */
export interface SolidFill extends BaseFill {
  fill_color: HexColor;
}

/**
 * Represents a gradient fill.
 */
export interface GradientFillType extends BaseFill {
  fill_color_gradient: GradientFill;
}

/**
 * Represents an image fill.
 */
export interface ImageFillType extends BaseFill {
  fill_image: ImageMeta;
}

/**
 * A discriminated union type for all possible fill types.
 * Corresponds to `schema:fill` in `fill.cljc`.
 */
export type Fill = SolidFill | GradientFillType | ImageFillType;

// --- Strokes ---
/**
 * Properties common to all stroke types.
 * Corresponds to `schema:stroke-attrs` in `shape.cljc`.
 * Note: Clojure `stroke-color` can also be a gradient or image,
 * matching `schema:color`. We'll define a generic `ColorProperty` for that.
 */

/**
 * A generic type representing a color property that can be a hex color, gradient, or image.
 * This is used for `stroke-color` and `shadow.color`.
 * Corresponds to `schema:color` in `color.cljc`.
 */
export interface ColorProperty {
  color?: HexColor;
  gradient?: GradientFill;
  image?: ImageMeta;
  opacity?: number; // 0-1
  ref_id?: UUID;
  ref_file?: UUID;
}

export interface Stroke {
  stroke_color?: ColorProperty; // Can be hex, gradient, or image
  stroke_opacity?: number; // 0-1
  stroke_style?: 'solid' | 'dotted' | 'dashed' | 'mixed';
  stroke_width?: number;
  stroke_alignment?: 'center' | 'inner' | 'outer';
  stroke_cap_start?:
    | 'round'
    | 'square'
    | 'line-arrow'
    | 'triangle-arrow'
    | 'square-marker'
    | 'circle-marker'
    | 'diamond-marker'
    | null;
  stroke_cap_end?:
    | 'round'
    | 'square'
    | 'line-arrow'
    | 'triangle-arrow'
    | 'square-marker'
    | 'circle-marker'
    | 'diamond-marker'
    | null;
}

// --- Shadows ---
/**
 * Defines a shadow effect for a shape.
 * Corresponds to `schema:shadow` in `shape/shadow.cljc`.
 */
export interface Shadow {
  id?: UUID | null; // Optional UUID as it might be null
  style: 'drop-shadow' | 'inner-shadow';
  offset_x: number;
  offset_y: number;
  blur: number;
  spread: number;
  hidden: boolean;
  color: ColorProperty; // Hex color, gradient, or image
}

// --- Blurs ---
/**
 * Defines a blur effect for a shape.
 * Corresponds to `schema:blur` in `shape/blur.cljc`.
 */
export interface Blur {
  id: UUID;
  type: 'layer-blur';
  value: number;
  hidden: boolean;
}
