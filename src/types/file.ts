// src/types/file.ts
import type { UUID, Instant } from './common';
import type { Page } from './page'; // A file contains pages
import type { Component } from './component'; // A file contains components

/**
 * Represents a Penpot File, which is the top-level container for all design data.
 * Corresponds to `schema:file` in `file.cljc`.
 */
export interface File {
  id: UUID;
  name: string;
  revn?: number; // Revision number
  vern?: number; // Version number
  created_at?: Instant;
  modified_at?: Instant;
  deleted_at?: Instant;
  project_id?: UUID;
  is_shared?: boolean;
  version: number; // Penpot file format version

  // The actual design data
  data?: {
    pages: UUID[]; // Ordered list of page IDs
    pages_index: Record<UUID, Page>; // Map of page IDs to Page objects
    components?: Record<UUID, Component>; // Map of component IDs to Component objects
    // colors?: Record<UUID, any>; // Omitted for now
    // typographies?: Record<UUID, any>; // Omitted for now
    // options?: any; // Omitted for now
    // plugin_data?: any; // Omitted for now
    // tokens_lib?: any; // Omitted for now
  };
  // features?: any; // Omitted for now
  // migrations?: string[]; // Omitted for now
  // ignore_sync_until?: Instant; // Omitted for now
}
