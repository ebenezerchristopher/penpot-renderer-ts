// src/types/layoutEngine.ts
import type { UUID } from './common';
import type { Matrix } from './geometry';

/**
 * Represents the computed layout result for a set of shapes.
 * It maps shape IDs to their final transformation matrices.
 * This matrix should encapsulate the shape's position, scale, and rotation
 * as determined by the layout engine.
 */
export type ComputedLayout = Record<UUID, Matrix>;
