// src/main.ts
import { Renderer } from './renderer';
import { UUID_ZERO, type HexColor } from './types/common';
import type { Page } from './types/page';
import type { Matrix } from './types/geometry';
import type { FrameShape, RectShape, CircleShape } from './types/shape';
import type { SolidFill, Stroke } from './types/styles';
import type { File } from './types/file';

// --- MOCK DATA HELPERS (unchanged) ---
const identityMatrix: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
const createBasicTransformMatrix = (x: number, y: number): Matrix => ({
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: x,
  f: y,
});
const createSolidFill = (color: HexColor, opacity = 1): SolidFill => ({
  fill_color: color,
  fill_opacity: opacity,
});
const createSolidStroke = (
  color: HexColor,
  width = 1,
  opacity = 1
): Stroke => ({
  stroke_color: { color, opacity },
  stroke_width: width,
  stroke_alignment: 'center',
  stroke_style: 'solid',
});

// --- CORRECTED: Use valid UUIDs for all IDs ---
const PAGE_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const FRAME_CONTENT_ID = 'f2e1d0c9-b8a7-6543-210f-edcba9876543';
const RECT_1_ID = '12345678-90ab-cdef-0123-4567890abcde';
const CIRCLE_1_ID = 'fedcba98-7654-3210-fedc-ba9876543210';

const penpotFile: File = {
  id: 'file-abc',
  name: 'Test Penpot File',
  version: 1,
  data: {
    pages: [PAGE_ID],
    pages_index: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Test Page',
        objects: {
          [UUID_ZERO]: {
            id: UUID_ZERO,
            type: 'frame',
            name: 'Root Frame',
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            rotation: 0,
            selrect: { x: 0, y: 0, width: 800, height: 600 },
            points: [
              { x: 0, y: 0 },
              { x: 800, y: 0 },
              { x: 800, y: 600 },
              { x: 0, y: 600 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            shapes: [FRAME_CONTENT_ID], // <-- Corrected
            fills: [createSolidFill('#F0F0F0', 1)],
          } as FrameShape,
          [FRAME_CONTENT_ID]: {
            id: FRAME_CONTENT_ID, // <-- Corrected
            type: 'frame',
            name: 'Content Frame',
            x: 50,
            y: 50,
            width: 700,
            height: 500,
            rotation: 0,
            selrect: { x: 50, y: 50, width: 700, height: 500 },
            points: [
              { x: 50, y: 50 },
              { x: 750, y: 50 },
              { x: 750, y: 550 },
              { x: 50, y: 550 },
            ],
            transform: createBasicTransformMatrix(50, 50),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            shapes: [RECT_1_ID, CIRCLE_1_ID], // <-- Corrected
            fills: [createSolidFill('#FFFFFF', 1)],
          } as FrameShape,
          [RECT_1_ID]: {
            id: RECT_1_ID, // <-- Corrected
            type: 'rect',
            name: 'Red Rectangle',
            x: 10,
            y: 10,
            width: 150,
            height: 100,
            rotation: 0,
            selrect: { x: 10, y: 10, width: 150, height: 100 },
            points: [
              { x: 10, y: 10 },
              { x: 160, y: 10 },
              { x: 160, y: 110 },
              { x: 10, y: 110 },
            ],
            transform: createBasicTransformMatrix(10, 10),
            transform_inverse: identityMatrix,
            parent_id: FRAME_CONTENT_ID, // <-- Corrected
            frame_id: FRAME_CONTENT_ID, // <-- Corrected
            fills: [createSolidFill('#FF0000', 0.8)],
            strokes: [createSolidStroke('#000000', 4, 1)],
          } as RectShape,
          [CIRCLE_1_ID]: {
            id: CIRCLE_1_ID, // <-- Corrected
            type: 'circle',
            name: 'Blue Circle',
            x: 200,
            y: 150,
            width: 100,
            height: 100,
            rotation: 0,
            selrect: { x: 200, y: 150, width: 100, height: 100 },
            points: [
              { x: 200, y: 150 },
              { x: 300, y: 150 },
              { x: 300, y: 250 },
              { x: 200, y: 250 },
            ],
            transform: createBasicTransformMatrix(200, 150),
            transform_inverse: identityMatrix,
            parent_id: FRAME_CONTENT_ID, // <-- Corrected
            frame_id: FRAME_CONTENT_ID, // <-- Corrected
            fills: [createSolidFill('#0000FF', 0.7)],
          } as CircleShape,
        },
      },
    },
    components: {},
  },
};

/**
 * The main application entry point.
 */
async function main() {
  const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  const renderer = new Renderer(canvas);
  await renderer.render(penpotFile, PAGE_ID); // <-- Corrected
}

main().catch(console.error);
