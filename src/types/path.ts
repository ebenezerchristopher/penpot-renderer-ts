// src/types/path.ts
import type { Point } from './geometry';

/**
 * Represents a single command within a Penpot path.
 * Corresponds to `schema:segment` in `path/impl.cljc`.
 */
export type PathCommand =
  | { command: 'move-to'; params: Point; relative?: boolean }
  | { command: 'line-to'; params: Point; relative?: boolean }
  | {
      command: 'curve-to';
      params: Point & { c1x: number; c1y: number; c2x: number; c2y: number };
      relative?: boolean;
    }
  | {
      command: 'close-path';
      params?: Record<string, never>;
      relative?: boolean;
    }; // <-- Corrected this line

/**
 * Represents the full path data, an ordered list of commands.
 * Corresponds to `schema:content-like` in `path/impl.cljc`.
 */
export type PathData = PathCommand[];
