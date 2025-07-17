// src/types/layout.ts
import { UUID } from './common'; // UUID is used here
import type { ColorProperty } from './styles'; // <-- NEW: Import ColorProperty for grid params

// --- General Layout Types (shared by Flex and Grid) ---

/**
 * Defines the overall layout type for a container (e.g., Frame).
 */
export type LayoutType = 'flex' | 'grid';

/**
 * Defines the type of gap between items.
 */
export type GapType = 'simple' | 'multiple';

/**
 * Represents padding values for a container.
 * p1: top, p2: right, p3: bottom, p4: left.
 * If `paddingType` is 'simple', p1 applies to top/bottom, p2 to right/left.
 */
export interface Padding {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
}

/**
 * Represents gap values between rows and columns.
 */
export interface Gap {
  row_gap?: number;
  column_gap?: number;
}

// --- Flex Layout Specific Types (for containers) ---

/**
 * Defines the direction of the main axis in a Flex container.
 */
export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * Defines how flex items wrap within their container.
 */
export type FlexWrap = 'wrap' | 'nowrap';

/**
 * Defines how content is distributed along the main axis when there is extra space.
 */
export type JustifyContent =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

/**
 * Defines how content is distributed along the cross axis when there are multiple lines of flex items.
 */
export type AlignContent =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';

/**
 * Defines how flex items are aligned along the cross axis within each line.
 */
export type AlignItems = 'start' | 'end' | 'center' | 'stretch';

/**
 * Interface for Flex container properties.
 * Corresponds to a subset of `schema:layout-attrs` in `shape/layout.cljc`.
 */
export interface FlexContainerProperties {
  layout_flex_dir?: FlexDirection;
  layout_wrap_type?: FlexWrap;
  layout_justify_content?: JustifyContent;
  layout_align_content?: AlignContent;
  layout_align_items?: AlignItems;
}

// --- Grid Layout Specific Types (for containers) ---

/**
 * Defines the direction in which grid items are placed in the grid.
 */
export type GridDirection = 'row' | 'column';

/**
 * Defines the type of value for a grid track (row/column size).
 */
export type GridTrackType = 'percent' | 'flex' | 'auto' | 'fixed';

/**
 * Represents a single grid track definition (for rows or columns).
 * Corresponds to `schema:grid-track` in `shape/layout.cljc`.
 */
export interface GridTrack {
  type: GridTrackType;
  value?: number | null; // e.g., 1fr, 100px, 50%
}

/**
 * Defines how items are aligned along the inline (row) axis within their grid cells.
 */
export type JustifyItems = 'start' | 'end' | 'center' | 'stretch';

/**
 * Base parameters for a grid column or row.
 * Used in `grid.cljc` for `schema:column-params`.
 */
export interface GridColumnRowParams {
  color?: ColorProperty; // <-- CORRECTED: Use imported ColorProperty
  type?: 'stretch' | 'left' | 'center' | 'right';
  size?: number;
  margin?: number;
  item_length?: number;
  gutter?: number;
}

/**
 * Base parameters for a grid square.
 * Used in `grid.cljc` for `schema:square-params`.
 */
export interface GridSquareParams {
  size?: number;
  color?: ColorProperty; // <-- CORRECTED: Use imported ColorProperty
}

/**
 * Represents a column grid definition.
 */
export interface ColumnGrid {
  type: 'column';
  display: boolean;
  params: GridColumnRowParams;
}

/**
 * Represents a row grid definition.
 */
export interface RowGrid {
  type: 'row';
  display: boolean;
  params: GridColumnRowParams;
}

/**
 * Represents a square grid definition.
 */
export interface SquareGrid {
  type: 'square';
  display: boolean;
  params: GridSquareParams;
}

/**
 * A discriminated union type for all possible grid types.
 * Corresponds to `schema:grid` in `grid.cljc`.
 */
export type Grid = ColumnGrid | RowGrid | SquareGrid;

/**
 * Interface for Grid container properties.
 * Corresponds to a subset of `schema:layout-attrs` in `shape/layout.cljc`.
 */
export interface GridContainerProperties {
  // <-- CORRECTED: Added export
  layout_grid_dir?: GridDirection;
  layout_grid_rows?: GridTrack[];
  layout_grid_columns?: GridTrack[];
  layout_justify_items?: JustifyItems; // For grid items alignment
  layout_align_items?: AlignItems; // For grid items alignment
}

// --- Grid Cell Specific Types (for individual items within a grid) ---

/**
 * Defines how a grid item is positioned within the grid.
 */
export type GridPositionType = 'auto' | 'manual' | 'area';

/**
 * Defines how an individual grid item aligns itself along the cross axis within its cell.
 */
export type GridCellAlignSelf = 'auto' | 'start' | 'center' | 'end' | 'stretch';

/**
 * Defines how an individual grid item aligns itself along the main axis within its cell.
 */
export type GridCellJustifySelf =
  | 'auto'
  | 'start'
  | 'center'
  | 'end'
  | 'stretch';

/**
 * Represents a specific cell in a grid layout, potentially holding shapes.
 * Corresponds to `schema:grid-cell` in `shape/layout.cljc`.
 */
export interface GridCell {
  id: UUID;
  area_name?: string; // If positioned by area name
  row: number; // 1-based start row
  row_span: number; // Number of rows spanned
  column: number; // 1-based start column
  column_span: number; // Number of columns spanned
  position?: GridPositionType; // How the item is positioned in the cell
  align_self?: GridCellAlignSelf; // Overrides container's align-items for this item
  justify_self?: GridCellJustifySelf; // Overrides container's justify-items for this item
  shapes: UUID[]; // IDs of shapes contained in this cell
}

// --- Combined Container Layout Properties ---

/**
 * Union of all possible container-level layout properties.
 * These will be part of `FrameShape` in `shape.ts`.
 * Corresponds to `schema:layout-attrs` in `shape/layout.cljc`.
 */
export interface LayoutContainerProperties
  extends FlexContainerProperties,
    GridContainerProperties {
  layout?: LayoutType; // Overall layout mode (flex/grid)
  layout_gap_type?: GapType;
  layout_gap?: Gap;
  layout_padding_type?: PaddingType; // <-- CORRECTED: Now exported
  layout_padding?: Padding;
  layout_grid_cells?: Record<UUID, GridCell>; // Map of UUID to GridCell for assigned items
}

// --- Layout Item Specific Types (for children within a layout container) ---

/**
 * Defines the type of margin for an item.
 */
export type ItemMarginType = 'simple' | 'multiple';

/**
 * Represents margin values for an item.
 * m1: top, m2: right, m3: bottom, m4: left.
 * If `itemMarginType` is 'simple', m1 applies to top/bottom, m2 to right/left.
 */
export interface ItemMargin {
  m1?: number;
  m2?: number;
  m3?: number;
  m4?: number;
}

/**
 * Defines how an item sizes horizontally.
 */
export type ItemHSizing = 'fill' | 'fix' | 'auto';

/**
 * Defines how an item sizes vertically.
 */
export type ItemVSizing = 'fill' | 'fix' | 'auto';

/**
 * Defines how an item aligns itself within its line along the cross axis.
 */
export type ItemAlignSelf = 'start' | 'end' | 'center' | 'stretch';

/**
 * Interface for layout item properties.
 * These will be part of `BaseShape` in `shape.ts`, as they can apply to any child of a layout container.
 * Corresponds to `schema:layout-child-attrs` in `shape/layout.cljc`.
 */
export interface LayoutItemProperties {
  layout_item_margin_type?: ItemMarginType;
  layout_item_margin?: ItemMargin;
  layout_item_max_h?: number;
  layout_item_min_h?: number;
  layout_item_max_w?: number;
  layout_item_min_w?: number;
  layout_item_h_sizing?: ItemHSizing;
  layout_item_v_sizing?: ItemVSizing;
  layout_item_align_self?: ItemAlignSelf;
  layout_item_absolute?: boolean; // If true, item is absolutely positioned within the layout
  layout_item_z_index?: number; // For manual z-ordering within layout (CSS z-index)
}

// --- NEW: Export PaddingType here ---
export type PaddingType = 'simple' | 'multiple'; // <-- CORRECTED: Added export for PaddingType
