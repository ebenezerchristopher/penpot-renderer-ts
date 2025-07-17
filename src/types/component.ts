// src/types/component.ts
import type { UUID, Instant } from './common';
import type { AnyShape } from './shape'; // Components contain shapes

/**
 * Represents a Penpot Component definition.
 * Components encapsulate a reusable group of shapes (their "main instance").
 * Corresponds to `schema:component` in `component.cljc`.
 */
export interface Component {
  id: UUID;
  name: string;
  path?: string | null; // Path in the asset library
  modified_at?: Instant;
  // The shapes that constitute this component's "main instance" (its definition).
  // This `objects` map is typically only populated when the component is loaded from a file,
  // or when a deleted component is restored. In a live page, the main instance shapes
  // are part of the page's `objects` map.
  objects?: Record<UUID, AnyShape>;
  main_instance_id?: UUID; // The ID of the root shape of this component's main instance
  main_instance_page?: UUID; // The ID of the page where the main instance resides
  // annotation?: any; // Omitted for now
  // variant_id?: UUID; // Omitted for now
  // variant_properties?: any[]; // Omitted for now
  // plugin_data?: Record<string, Record<string, string>>; // Omitted for now
}
