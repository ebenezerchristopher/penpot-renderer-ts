// src/serializers/shape.ts
import type { AnyShape, ShapeType } from '../types';
import type { UUID } from '../types/common';
import type { WasmBridge } from '../wasm-bridge';
import { serializeFills, FILL_BYTE_SIZE } from './styles';

export const CHILD_ENTRY_SIZE = 16; // bytes (4 * u32)

function serializeShapeType(type: ShapeType): number {
  switch (type) {
    case 'frame':
      return 0;
    case 'group':
      return 1;
    case 'bool':
      return 2;
    case 'rect':
      return 3;
    case 'path':
      return 4;
    case 'text':
      return 5;
    case 'circle':
      return 6;
    case 'svg-raw':
      return 7;
    case 'image':
      return 8;
    default:
      return 3; // Fallback to rect
  }
}

export function uuidToUint32Array(uuid: UUID): Uint32Array {
  if (uuid === '00000000-0000-0000-0000-000000000000') {
    return new Uint32Array(4);
  }
  const parts = uuid.replace(/-/g, '');
  if (parts.length !== 32) {
    console.warn(`Invalid UUID format: ${uuid}`);
    return new Uint32Array(4);
  }
  const buffer = new Uint32Array(4);
  buffer[0] = parseInt(parts.substring(0, 8), 16);
  buffer[1] = parseInt(parts.substring(8, 16), 16);
  buffer[2] = parseInt(parts.substring(16, 24), 16);
  buffer[3] = parseInt(parts.substring(24, 32), 16);
  return buffer;
}

/**
 * Main function to serialize a complete shape object and send it to WASM.
 * This function now correctly handles the stateful "allocate -> write -> commit"
 * sequence for each property to avoid memory leaks.
 */
export function serializeShape(bridge: WasmBridge, shape: AnyShape): void {
  // 1. Set the context to the current shape
  const idParts = uuidToUint32Array(shape.id);
  bridge.useShape(idParts);

  // 2. Send simple, atomic properties
  const parentIdParts = uuidToUint32Array(shape.parent_id);
  bridge.setParent(parentIdParts);
  bridge.setShapeType(serializeShapeType(shape.type));
  const { a, b, c, d, e, f } = shape.transform;
  bridge.setShapeTransform(a, b, c, d, e, f);
  bridge.setShapeOpacity(shape.opacity ?? 1.0);
  bridge.setShapeHidden(shape.hidden ?? false);
  bridge.setShapeSelRect(shape.selrect);

  // 3. Handle properties that require memory allocation, one by one.

  // --- Children ---
  if ('shapes' in shape && shape.shapes && shape.shapes.length > 0) {
    const children = shape.shapes;
    const numChildren = children.length;
    const size = numChildren * CHILD_ENTRY_SIZE;

    // Allocate -> Write -> Commit
    const ptr = bridge.allocBytes(size);
    const heap = bridge.getHeapU8();
    const buffer = new Uint32Array(heap.buffer, ptr, numChildren * 4);
    for (let i = 0; i < numChildren; i++) {
      const childIdParts = uuidToUint32Array(children[i]);
      buffer.set(childIdParts, i * 4);
    }
    bridge.setChildren(); // Commit this specific allocation
  }

  // --- Fills ---
  if (shape.fills && shape.fills.length > 0) {
    const numFills = shape.fills.length;
    const size = numFills * FILL_BYTE_SIZE;

    // Allocate -> Write -> Commit
    const ptr = bridge.allocBytes(size);
    const heap = bridge.getHeapU8();
    const dataView = new DataView(heap.buffer);
    serializeFills(dataView, ptr, shape.fills);
    bridge.setShapeFills(); // Commit this specific allocation
  } else {
    bridge.clearShapeFills();
  }

  // --- Strokes (Placeholder for next step) ---
  bridge.clearShapeStrokes();

  // Future serializers for text, paths, etc., will follow the same
  // "Allocate -> Write -> Commit" pattern here.
}
