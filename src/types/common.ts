// src/types/common.ts

/**
 * Represents a standard UUID (Universally Unique Identifier).
 * UUIDs are used for unique identification of entities like shapes, pages, etc.
 * @example 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
 */
export type UUID = string;

/**
 * Represents a hexadecimal color string.
 * @example '#RRGGBB' or '#RGB'
 */
export type HexColor = string;

/**
 * Represents an instantaneous point in time, typically in ISO 8601 format.
 * Used for 'modifiedAt' and 'createdAt' properties.
 * @example '2023-10-27T10:00:00.000Z'
 */
export type Instant = string; // For now, we'll represent Clojure's inst as a string. Could be `Date` if needed later.

/**
 * Represents common boolean logic types.
 */
export type BoolType = 'union' | 'difference' | 'exclude' | 'intersection';

/**
 * Represents various blend modes for layers.
 */
export type BlendMode =
  | 'normal'
  | 'darken'
  | 'multiply'
  | 'color-burn'
  | 'lighten'
  | 'screen'
  | 'color-dodge'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

/**
 * Represents the type of export format for an asset.
 */
export type ExportType = 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf';
export const UUID_ZERO: UUID = '00000000-0000-0000-0000-000000000000';
