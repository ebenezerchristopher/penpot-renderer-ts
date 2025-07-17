// src/types/page.ts
import { UUID } from './common';
import { AnyShape } from './shape';

/**
 * Represents a Penpot Page, containing a collection of shapes.
 * This is a minimal definition for now, focusing on what the renderer needs immediately.
 * Corresponds to `schema:page` in `page.cljc`.
 */
export interface Page {
  id: UUID;
  name: string;
  index?: number; // <-- NEW: Add optional index for ordering
  // The 'objects' is a flat map of all shapes on the page, indexed by their UUID.
  // The rendering engine will reconstruct the hierarchy from parent_id/frame_id.
  objects: Record<UUID, AnyShape>;
  // ... other page properties like defaultGrids, flows, guides, background (omitted for now)
}
