// src/serializers/styles.ts
import type {
  Fill,
  SolidFill,
  GradientFillType,
  ImageFillType,
} from '../types';

// From `serializers/fills.cljs`, FILL_BYTE_SIZE is the size of the largest fill type plus a header.
// A safe, large value matching the source is 160.
export const FILL_BYTE_SIZE = 160;

function hexToUint32ARGB(hex: string, opacity: number | undefined): number {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const a = Math.floor((opacity ?? 1.0) * 255);
  return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

function writeSolidFill(
  dataView: DataView,
  offset: number,
  fill: SolidFill
): number {
  const color = hexToUint32ARGB(fill.fill_color, fill.fill_opacity);
  dataView.setUint8(offset, 0x00); // Fill type: Solid
  dataView.setUint32(offset + 4, color, true); // Little-endian
  return offset + FILL_BYTE_SIZE;
}

// Stubs for future implementation, now with correct types and unused param handling.
function writeGradientFill(
  _dataView: DataView,
  offset: number,
  _fill: GradientFillType
): number {
  console.warn('Gradient fill serialization not yet implemented.');
  // In a real implementation, you'd write all the gradient fields here using _dataView.
  return offset + FILL_BYTE_SIZE;
}

function writeImageFill(
  _dataView: DataView,
  offset: number,
  _fill: ImageFillType
): number {
  console.warn('Image fill serialization not yet implemented.');
  // In a real implementation, you'd write the image UUID and dimensions here using _dataView.
  return offset + FILL_BYTE_SIZE;
}

export function serializeFills(
  dataView: DataView,
  startingOffset: number,
  fills: Fill[]
): void {
  let currentOffset = startingOffset;
  for (const fill of fills) {
    if ('fill_color' in fill) {
      currentOffset = writeSolidFill(
        dataView,
        currentOffset,
        fill as SolidFill
      );
    } else if ('fill_color_gradient' in fill) {
      currentOffset = writeGradientFill(
        dataView,
        currentOffset,
        fill as GradientFillType
      );
    } else if ('fill_image' in fill) {
      currentOffset = writeImageFill(
        dataView,
        currentOffset,
        fill as ImageFillType
      );
    }
  }
}
