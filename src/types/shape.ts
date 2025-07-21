// src/types/shape.ts
// Import only the top-level types that are directly used in BaseShape or its specific shape interfaces.
import { UUID, BlendMode, BoolType, ExportType } from './common';
import type {
  Point,
  Rect,
  Matrix,
  HorizontalConstraint,
  VerticalConstraint,
  TextGrowType,
} from './geometry'; // Removed StrokeAlignment, StrokeCap, StrokeStyle as they are not directly used in BaseShape
import type { Fill, Stroke, Shadow, Blur, ImageMeta } from './styles'; // Only import the main Fill, Stroke, Shadow, Blur, ImageMeta interfaces
import type {
  LayoutContainerProperties,
  LayoutItemProperties,
  Grid, // Now correctly imported from layout.ts
} from './layout';

// Import the main types for content
import type { TextContent } from './text';
import type { PathData } from './path';
import type { AppliedTokens } from './tokens';
import type { Interaction } from './interactions';

// --- Base Shape Properties ---
/**
 * Common properties for all shapes, including geometric and identification attributes.
 * Corresponds to `schema:shape-base-attrs` and `schema:shape-geom-attrs` in `shape.cljc`.
 */
export interface BaseShape {
  id: UUID;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  selrect: Rect; // The calculated bounding box (selection rectangle)
  points: [Point, Point, Point, Point]; // The 4 corner points of the selrect
  transform: Matrix; // Local transformation matrix
  transform_inverse: Matrix; // Inverse of the local transformation matrix
  parent_id: UUID; // ID of the direct parent shape (group, frame, or root)
  frame_id: UUID; // ID of the containing frame (top-level frame or component root)
  flip_x?: boolean; // Horizontal flip (applied as part of transform)
  flip_y?: boolean; // Vertical flip (applied as part of transform)

  // Generic/Shared Properties (from schema:shape-generic-attrs)
  page_id?: UUID; // ID of the page the shape is on (redundant for shapes within a page, used in other contexts)
  component_id?: UUID; // If this shape is an instance of a component
  component_file?: UUID; // The file where the component definition resides
  component_root?: boolean; // True if this is the root shape of a component's main instance
  main_instance?: boolean; // True if this is the main instance of a component (for library definitions)
  remote_synced?: boolean; // Indicates if this instance is synced with its remote component definition
  shape_ref?: UUID; // For component instances, reference to the original shape ID in the component definition
  touched?: string[] | null; // Keys of properties that have been overridden in a component instance
  blocked?: boolean; // Prevents selection/editing
  collapsed?: boolean; // For groups/frames, hides children in layer panel
  locked?: boolean; // Prevents transformation
  hidden?: boolean; // Hides the shape on canvas
  masked_group?: boolean; // If this shape is part of a mask group
  fills?: Fill[]; // Fill is from styles.ts
  proportion?: number; // width / height aspect ratio
  proportion_lock?: boolean; // Lock aspect ratio
  constraints_h?: HorizontalConstraint;
  constraints_v?: VerticalConstraint;
  fixed_scroll?: boolean; // For frames, indicates if scroll position is fixed during prototyping
  r1?: number; // Border radius top-left
  r2?: number; // Border radius top-right
  r3?: number; // Border radius bottom-right
  r4?: number; // Border radius bottom-left
  opacity?: number; // 0-1
  grids?: Grid[]; // Grid is from layout.ts
  exports?: { type: ExportType; scale: number; suffix: string }[];
  strokes?: Stroke[]; // Stroke is from styles.ts
  blend_mode?: BlendMode;
  interactions?: Interaction[]; // Interaction is from interactions.ts
  shadow?: Shadow[]; // Shadow is from styles.ts
  blur?: Blur; // Blur is from styles.ts
  grow_type?: TextGrowType;
  applied_tokens?: AppliedTokens; // AppliedTokens is from tokens.ts
  plugin_data?: Record<string, Record<string, string>>; // Generic plugin data
  // Variant Properties (from variant.cljc) - also applicable to component instances
  variant_id?: UUID; // If this is a component that is part of a variant set
  variant_name?: string; // The name of the variant (e.g. "Size=Large, Color=Blue")
  variant_error?: string; // If there's an error resolving the variant
}

// --- Specific Shape Types (Discriminated Union Members) ---

/**
 * Interface for a Frame shape.
 * Corresponds to `schema:frame-attrs` in `shape.cljc`.
 * Also includes `LayoutContainerProperties` and `LayoutItemProperties`.
 */
export interface FrameShape
  extends BaseShape,
    LayoutContainerProperties,
    LayoutItemProperties {
  type: 'frame';
  shapes: UUID[]; // Children IDs
  hide_fill_on_export?: boolean;
  show_content?: boolean; // Controls visibility of content (e.g. for frames in prototyping)
  hide_in_viewer?: boolean; // For prototyping, hides frame from viewer/presentation mode
  is_variant_container?: boolean; // If this frame contains variant components
}

/**
 * Interface for a Group shape.
 * Corresponds to `schema:group-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 */
export interface GroupShape extends BaseShape, LayoutItemProperties {
  type: 'group';
  shapes: UUID[]; // Children IDs
}

/**
 * Interface for a Rect shape.
 * Corresponds to `schema:rect-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 */
export interface RectShape extends BaseShape, LayoutItemProperties {
  type: 'rect';
  // Specific rect attrs are usually just the base ones like x, y, width, height, r1-r4
}

/**
 * Interface for a Circle shape (or Ellipse).
 * Corresponds to `schema:circle-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 */
export interface CircleShape extends BaseShape, LayoutItemProperties {
  type: 'circle';
}

/**
 * Interface for an Image shape.
 * Corresponds to `schema:image-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 */
export interface ImageShape extends BaseShape, LayoutItemProperties {
  type: 'image';
  metadata: ImageMeta; // ImageMeta is from styles.ts
}

/**
 * Interface for an SvgRaw shape.
 * Corresponds to `schema:svg-raw-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 * Note: Penpot treats SVG raw imports as a special kind of shape,
 * preserving original SVG structure/attributes for rendering.
 * The `content` here would refer to the raw SVG string or a parsed representation.
 */
export interface SvgRawShape extends BaseShape, LayoutItemProperties {
  type: 'svg-raw';
  content?: string; // The raw SVG string
  // Additional SVG-specific attributes might be here,
  // but `svg-raw.cljc` wasn't provided in detail, so keeping it minimal.
}

/**
 * Interface for a Path shape.
 * Corresponds to `schema:path-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 */
export interface PathShape extends BaseShape, LayoutItemProperties {
  type: 'path';
  content: PathData; // PathData is now imported
}

/**
 * Interface for a Text shape.
 * Corresponds to `schema:text-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 */
export interface TextShape extends BaseShape, LayoutItemProperties {
  type: 'text';
  content: TextContent; // TextContent is now imported
}

/**
 * Interface for a Boolean operation shape.
 * Corresponds to `schema:bool-attrs` in `shape.cljc`.
 * Also includes `LayoutItemProperties`.
 * The `content` field here is the *resultant* path from the boolean operation.
 */
export interface BoolShape extends BaseShape, LayoutItemProperties {
  type: 'bool';
  shapes: UUID[]; // IDs of the shapes involved in the boolean operation
  bool_type: BoolType; // Type of boolean operation (union, difference, etc.)
  content: PathData; // The calculated path data of the boolean operation result
}

/**
 * The main discriminated union type for any shape in Penpot.
 * This allows TypeScript to narrow down the shape's specific properties based on its 'type' field.
 */
export type AnyShape =
  | FrameShape
  | GroupShape
  | RectShape
  | CircleShape
  | ImageShape
  | SvgRawShape
  | PathShape
  | TextShape
  | BoolShape;

/**
 * A union of all possible shape type strings, derived from AnyShape.
 * This is used for functions that operate on the shape's `type` property.
 */
export type ShapeType = AnyShape['type'];
