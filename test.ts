// test.ts
import { Renderer } from './src'; // Import our Renderer class from the library entry point
import { UUID_ZERO, HexColor } from './src/types/common';
import type { Page } from './src/types/page';
import type { Matrix, Point } from './src/types/geometry';
import type {
  AnyShape,
  FrameShape,
  GroupShape,
  RectShape,
  CircleShape,
  PathShape,
  TextShape,
  ImageShape,
  SvgRawShape,
  BoolShape,
} from './src/types/shape'; // Main shape types
import type {
  SolidFill,
  Stroke,
  ColorProperty,
  GradientFill,
  LinearGradientFill,
  RadialGradientFill,
  GradientStop,
  Shadow,
  Blur,
  Fill,
  ImageMeta,
} from './src/types/styles'; // Style-related types
import type {
  TextContent,
  ParagraphNode,
  TextNode,
  ParagraphSetNode,
} from './src/types/text'; // Text content types
import type {
  LayoutType,
  FlexDirection,
  JustifyContent,
  AlignItems,
  GridTrackType,
  GridDirection,
} from './src/types/layout'; // Layout types
import type { File } from './src/types/file'; // File type
import type { Component } from './src/types/component'; // Component type

// Helper function to create a simple identity matrix
const identityMatrix: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

// Helper to create a basic transform matrix including translation.
const createBasicTransformMatrix = (x: number, y: number): Matrix => {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
};

// Helper for solid fill
const createSolidFill = (color: HexColor, opacity: number = 1): SolidFill => ({
  fill_color: color,
  fill_opacity: opacity,
});

// Helper for solid stroke
const createSolidStroke = (
  color: HexColor,
  width: number = 1,
  opacity: number = 1
): Stroke => ({
  stroke_color: { color: color, opacity: opacity } as ColorProperty,
  stroke_width: width,
  stroke_alignment: 'center',
  stroke_style: 'solid',
});

// Helper for linear gradient fill
const createLinearGradientFill = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  stops: GradientStop[]
): Fill => ({
  fill_color_gradient: {
    type: 'linear',
    start_x: startX,
    start_y: startY,
    end_x: endX,
    end_y: endY,
    width: 0, // Not directly used in linear gradient creation, but part of Penpot's model
    stops: stops,
  } as LinearGradientFill,
});

// Helper for radial gradient fill
const createRadialGradientFill = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  width: number,
  stops: GradientStop[]
): Fill => ({
  fill_color_gradient: {
    type: 'radial',
    start_x: startX,
    start_y: startY,
    end_x: endX,
    end_y: endY,
    width: width, // Used as r1 (end radius) for radial gradient
    stops: stops,
  } as RadialGradientFill,
});

// Helper for drop shadow
const createDropShadow = (
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: HexColor,
  opacity: number = 1
): Shadow => ({
  id: `shadow-${Math.random().toString(36).substring(7)}`,
  style: 'drop-shadow',
  offset_x: offsetX,
  offset_y: offsetY,
  blur: blur,
  spread: spread,
  hidden: false,
  color: { color: color, opacity: opacity } as ColorProperty,
});

// Helper for layer blur
const createLayerBlur = (value: number): Blur => ({
  id: `blur-${Math.random().toString(36).substring(7)}`,
  type: 'layer-blur',
  value: value,
  hidden: false,
});

const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;

// --- Component Definition ---
const componentId = 'comp-123';
const componentMainPageId = 'comp-main-page';
const componentMainRectId = 'comp-main-rect';

const componentMainPage: Page = {
  id: componentMainPageId,
  name: 'Component Main Page',
  objects: {
    [UUID_ZERO]: {
      // Root Frame of component's main page
      id: UUID_ZERO,
      type: 'frame',
      name: 'Component Root Frame',
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      rotation: 0, // <-- Removed redundant rotation
      selrect: { x: 0, y: 0, width: 200, height: 200 },
      points: [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 200 },
        { x: 0, y: 200 },
      ],
      transform: identityMatrix,
      transform_inverse: identityMatrix,
      parent_id: UUID_ZERO,
      frame_id: UUID_ZERO,
      shapes: [componentMainRectId],
    } as FrameShape,
    [componentMainRectId]: {
      // The actual shape defined by the component
      id: componentMainRectId,
      type: 'rect',
      name: 'Component Main Rect',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0, // <-- Removed redundant rotation
      selrect: { x: 0, y: 0, width: 100, height: 100 },
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      transform: createBasicTransformMatrix(0, 0),
      transform_inverse: identityMatrix,
      parent_id: UUID_ZERO,
      frame_id: UUID_ZERO,
      fills: [createSolidFill('#FF69B4', 1)],
      strokes: [createSolidStroke('#C71585', 2, 1)],
      main_instance: true,
    } as RectShape,
  },
};

const componentDefinition: Component = {
  id: componentId,
  name: 'MyReusableComponent',
  main_instance_id: componentMainRectId,
  main_instance_page: componentMainPageId,
};

// --- Main File Structure ---
const penpotFile: File = {
  id: 'file-abc',
  name: 'Test Penpot File',
  version: 1,
  data: {
    pages: ['page-123', componentMainPageId],
    pages_index: {
      'page-123': {
        id: 'page-123',
        name: 'Test Page',
        objects: {
          [UUID_ZERO]: {
            // Root Frame (implicit container)
            id: UUID_ZERO,
            type: 'frame',
            name: 'Root Frame',
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            rotation: 0, // <-- Removed redundant rotation
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
            shapes: [
              'frame-content',
              'rect-standalone',
              'rect-rotated',
              'group-nested',
              'bool-shape',
              'path-1',
              'text-shape',
              'image-shape',
              'svg-raw-shape',
              'rect-linear-gradient',
              'circle-radial-gradient',
              'layout-frame',
              'grid-layout-frame',
              'component-instance',
              'component-instance-override',
            ],
            fills: [createSolidFill('#F0F0F0', 1)],
            strokes: [createSolidStroke('#CCCCCC', 2, 1)],
          } as FrameShape,
          'frame-content': {
            id: 'frame-content',
            type: 'frame',
            name: 'Content Frame',
            x: 50,
            y: 50,
            width: 700,
            height: 500,
            rotation: 0, // <-- Removed redundant rotation
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
            shapes: [
              'rect-inside-frame',
              'rect-with-shadow',
              'circle-with-blur',
            ],
            fills: [createSolidFill('#FFFFFF', 1)],
            strokes: [createSolidStroke('#666666', 1, 1)],
          } as FrameShape,
          'rect-inside-frame': {
            id: 'rect-inside-frame',
            type: 'rect',
            name: 'Rect Inside Frame',
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 10, y: 10, width: 100, height: 100 },
            points: [
              { x: 10, y: 10 },
              { x: 110, y: 10 },
              { x: 110, y: 110 },
              { x: 10, y: 110 },
            ],
            transform: createBasicTransformMatrix(10, 10),
            transform_inverse: identityMatrix,
            parent_id: 'frame-content',
            frame_id: 'frame-content',
            fills: [createSolidFill('#FF0000', 0.8)],
            strokes: [createSolidStroke('#000000', 4, 1)],
          } as RectShape,
          'rect-standalone': {
            id: 'rect-standalone',
            type: 'rect',
            name: 'Standalone Rectangle',
            x: 20,
            y: 20,
            width: 80,
            height: 80,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 20, y: 20, width: 80, height: 80 },
            points: [
              { x: 20, y: 20 },
              { x: 100, y: 20 },
              { x: 100, y: 100 },
              { x: 20, y: 100 },
            ],
            transform: createBasicTransformMatrix(20, 20),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            fills: [createSolidFill('#00FFFF', 0.6)],
            strokes: [createSolidStroke('#CC00CC', 2, 1)],
          } as RectShape,
          'rect-rotated': {
            id: 'rect-rotated',
            type: 'rect',
            name: 'Rotated Rectangle',
            x: 300,
            y: 50,
            width: 150,
            height: 75,
            rotation: 45, // <-- Kept this rotation as it's the specific value for this shape
            selrect: { x: 300, y: 50, width: 150, height: 75 },
            points: [
              { x: 300, y: 50 },
              { x: 450, y: 50 },
              { x: 450, y: 125 },
              { x: 300, y: 125 },
            ],
            transform: {
              a: 0.707,
              b: 0.707,
              c: -0.707,
              d: 0.707,
              e: 300,
              f: 50,
            },
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            fills: [createSolidFill('#FFD700', 0.9)],
            strokes: [createSolidStroke('#B8860B', 3, 1)],
          } as RectShape,
          'group-nested': {
            id: 'group-nested',
            type: 'group',
            name: 'Nested Group',
            x: 100,
            y: 300,
            width: 200,
            height: 200,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 100, y: 300, width: 200, height: 200 },
            points: [
              { x: 100, y: 300 },
              { x: 300, y: 300 },
              { x: 300, y: 500 },
              { x: 100, y: 500 },
            ],
            transform: createBasicTransformMatrix(100, 300),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            shapes: ['circle-scaled-rotated'],
          } as GroupShape,
          'circle-scaled-rotated': {
            id: 'circle-scaled-rotated',
            type: 'circle',
            name: 'Scaled & Rotated Circle',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            rotation: 30, // <-- Kept this rotation
            selrect: { x: 50, y: 50, width: 100, height: 100 },
            points: [
              { x: 50, y: 50 },
              { x: 150, y: 50 },
              { x: 150, y: 150 },
              { x: 50, y: 150 },
            ],
            transform: { a: 1.299, b: 0.75, c: -0.75, d: 1.299, e: 50, f: 50 },
            transform_inverse: identityMatrix,
            parent_id: 'group-nested',
            frame_id: UUID_ZERO,
            fills: [createSolidFill('#00FF00', 0.7)],
            strokes: [createSolidStroke('#008000', 5, 1)],
          } as CircleShape,
          'path-1': {
            id: 'path-1',
            type: 'path',
            name: 'Simple Path',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 200, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 200, y: 0 },
              { x: 200, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(500, 100),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            content: [
              { command: 'move-to', params: { x: 0, y: 100 } },
              { command: 'line-to', params: { x: 100, y: 0 } },
              { command: 'line-to', params: { x: 200, y: 100 } },
              { command: 'close-path', params: { x: 0, y: 100 } },
            ],
            fills: [createSolidFill('#8A2BE2', 0.8)],
            strokes: [createSolidStroke('#4B0082', 2, 1)],
          } as PathShape,
          'bool-shape': {
            id: 'bool-shape',
            type: 'bool',
            name: 'Bool Example (Path)',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 100, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(600, 300),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            bool_type: 'union',
            content: [
              { command: 'move-to', params: { x: 0, y: 0 } },
              { command: 'line-to', params: { x: 100, y: 0 } },
              { command: 'line-to', params: { x: 100, y: 100 } },
              { command: 'line-to', params: { x: 0, y: 100 } },
              { command: 'close-path', params: { x: 0, y: 0 } },
            ],
            fills: [createSolidFill('#4169E1', 0.9)],
            strokes: [createSolidStroke('#191970', 3, 1)],
          } as BoolShape,
          'text-shape': {
            id: 'text-shape',
            type: 'text',
            name: 'Hello Text',
            x: 0,
            y: 0,
            width: 250,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 250, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 250, y: 0 },
              { x: 250, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(400, 400),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            fills: [createSolidFill('#6A5ACD', 0.9)],
            strokes: [createSolidStroke('#483D8B', 1, 1)],
            content: {
              type: 'root',
              children: [
                {
                  type: 'paragraph-set',
                  children: [
                    {
                      type: 'paragraph',
                      font_family: 'Arial',
                      font_size: '24px',
                      font_weight: 'bold',
                      fills: [createSolidFill('#000000', 1)],
                      children: [
                        { text: 'Hello, ' },
                        {
                          text: 'Penpot!',
                          fills: [createSolidFill('#FF00FF', 1)],
                        },
                      ],
                    },
                    {
                      type: 'paragraph',
                      font_family: 'Verdana',
                      font_size: '16px',
                      font_style: 'italic',
                      fills: [createSolidFill('#008000', 1)],
                      children: [
                        { text: 'This is a ' },
                        { text: 'test of advanced text rendering.' },
                      ],
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  font_family: 'Courier New',
                  font_size: '18px',
                  fills: [createSolidFill('#0000FF', 1)],
                  children: [{ text: 'New paragraph directly under root.' }],
                },
              ],
            },
          } as TextShape,
          'image-shape': {
            id: 'image-shape',
            type: 'image',
            name: 'Dummy Image',
            x: 0,
            y: 0,
            width: 150,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 150, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 150, y: 0 },
              { x: 150, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(200, 500),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            metadata: {
              id: 'image-meta-1',
              width: 150,
              height: 100,
              mtype: 'image/png',
            },
            fills: [createSolidFill('#FF4500', 0.9)],
            strokes: [createSolidStroke('#8B0000', 2, 1)],
          } as ImageShape,
          'svg-raw-shape': {
            id: 'svg-raw-shape',
            type: 'svg-raw',
            name: 'Dummy SVG',
            x: 0,
            y: 0,
            width: 120,
            height: 120,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 120, height: 120 },
            points: [
              { x: 0, y: 0 },
              { x: 120, y: 0 },
              { x: 120, y: 120 },
              { x: 0, y: 120 },
            ],
            transform: createBasicTransformMatrix(500, 500),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            fills: [createSolidFill('#20B2AA', 0.9)],
            strokes: [createSolidStroke('#008B8B', 2, 1)],
          } as SvgRawShape,
          'rect-linear-gradient': {
            id: 'rect-linear-gradient',
            type: 'rect',
            name: 'Linear Gradient Rect',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 200, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 200, y: 0 },
              { x: 200, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(50, 400),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            fills: [
              createLinearGradientFill(
                0,
                0,
                200,
                0, // Horizontal gradient from left to right
                [
                  { color: '#FF0000', offset: 0, opacity: 1 },
                  { color: '#FFFF00', offset: 0.5, opacity: 1 },
                  { color: '#0000FF', offset: 1, opacity: 1 },
                ]
              ),
            ],
            strokes: [createSolidStroke('#333333', 2, 1)],
          } as RectShape,
          'circle-radial-gradient': {
            id: 'circle-radial-gradient',
            type: 'circle',
            name: 'Radial Gradient Circle',
            x: 0,
            y: 0,
            width: 150,
            height: 150,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 150, height: 150 },
            points: [
              { x: 0, y: 0 },
              { x: 150, y: 0 },
              { x: 150, y: 150 },
              { x: 0, y: 150 },
            ],
            transform: createBasicTransformMatrix(300, 400),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            fills: [
              createRadialGradientFill(
                75,
                75, // Center of the circle (x0, y0 for start circle)
                75,
                75, // Center of the circle (x1, y1 for end circle)
                75, // Radius (width)
                [
                  { color: '#FFFFFF', offset: 0, opacity: 1 },
                  { color: '#000000', offset: 1, opacity: 1 },
                ]
              ),
            ],
            strokes: [createSolidStroke('#333333', 2, 1)],
          } as CircleShape,
          'rect-with-shadow': {
            id: 'rect-with-shadow',
            type: 'rect',
            name: 'Rect with Shadow',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 100, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(50, 50),
            transform_inverse: identityMatrix,
            parent_id: 'frame-content',
            frame_id: 'frame-content',
            fills: [createSolidFill('#ADD8E6', 1)],
            shadow: [createDropShadow(10, 10, 8, 0, '#000000', 0.5)],
          } as RectShape,
          'circle-with-blur': {
            id: 'circle-with-blur',
            type: 'circle',
            name: 'Circle with Blur',
            x: 0,
            y: 0,
            width: 80,
            height: 80,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 80, height: 80 },
            points: [
              { x: 0, y: 0 },
              { x: 80, y: 0 },
              { x: 80, y: 80 },
              { x: 0, y: 80 },
            ],
            transform: createBasicTransformMatrix(180, 50),
            transform_inverse: identityMatrix,
            parent_id: 'frame-content',
            frame_id: 'frame-content',
            fills: [createSolidFill('#90EE90', 1)],
            blur: createLayerBlur(5),
          } as CircleShape,
          'layout-frame': {
            id: 'layout-frame',
            type: 'frame',
            name: 'Layout Frame',
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 300, height: 200 },
            points: [
              { x: 0, y: 0 },
              { x: 300, y: 0 },
              { x: 300, y: 200 },
              { x: 0, y: 200 },
            ],
            transform: createBasicTransformMatrix(400, 50),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            shapes: ['layout-rect-1', 'layout-rect-2', 'layout-rect-3'],
            fills: [createSolidFill('#FFFACD', 1)],
            strokes: [createSolidStroke('#DAA520', 2, 1)],
            layout: 'flex',
            layout_flex_dir: 'row',
            layout_justify_content: 'space-between',
            layout_align_items: 'center',
            layout_gap: { column_gap: 10, row_gap: 10 },
            layout_padding: { p1: 20, p2: 20, p3: 20, p4: 20 },
          } as FrameShape,
          'layout-rect-1': {
            id: 'layout-rect-1',
            type: 'rect',
            name: 'Layout Rect 1',
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 50, height: 50 },
            points: [
              { x: 0, y: 0 },
              { x: 50, y: 0 },
              { x: 50, y: 50 },
              { x: 0, y: 50 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'layout-frame',
            frame_id: 'layout-frame',
            fills: [createSolidFill('#87CEEB', 1)],
          } as RectShape,
          'layout-rect-2': {
            id: 'layout-rect-2',
            type: 'rect',
            name: 'Layout Rect 2',
            x: 0,
            y: 0,
            width: 80,
            height: 60,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 80, height: 60 },
            points: [
              { x: 0, y: 0 },
              { x: 80, y: 0 },
              { x: 80, y: 60 },
              { x: 0, y: 60 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'layout-frame',
            frame_id: 'layout-frame',
            fills: [createSolidFill('#FF6347', 1)],
          } as RectShape,
          'layout-rect-3': {
            id: 'layout-rect-3',
            type: 'rect',
            name: 'Layout Rect 3',
            x: 0,
            y: 0,
            width: 40,
            height: 70,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 40, height: 70 },
            points: [
              { x: 0, y: 0 },
              { x: 40, y: 0 },
              { x: 40, y: 70 },
              { x: 0, y: 70 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'layout-frame',
            frame_id: 'layout-frame',
            fills: [createSolidFill('#BA55D3', 1)],
          } as RectShape,
          'grid-layout-frame': {
            id: 'grid-layout-frame',
            type: 'frame',
            name: 'Grid Layout Frame',
            x: 0,
            y: 0,
            width: 350,
            height: 250,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 350, height: 250 },
            points: [
              { x: 0, y: 0 },
              { x: 350, y: 0 },
              { x: 350, y: 250 },
              { x: 0, y: 250 },
            ],
            transform: createBasicTransformMatrix(50, 50),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            shapes: [
              'grid-rect-1',
              'grid-rect-2',
              'grid-rect-3',
              'grid-rect-4',
              'grid-rect-5',
            ],
            fills: [createSolidFill('#E0FFFF', 1)],
            strokes: [createSolidStroke('#4682B4', 2, 1)],
            layout: 'grid',
            layout_grid_dir: 'row',
            layout_grid_columns: [
              { type: 'fixed', value: 80 },
              { type: 'flex', value: 1 },
              { type: 'auto', value: 1 },
            ],
            layout_grid_rows: [
              { type: 'fixed', value: 70 },
              { type: 'flex', value: 1 },
            ],
            layout_gap: { column_gap: 10, row_gap: 10 },
            layout_padding: { p1: 15, p2: 15, p3: 15, p4: 15 },
          } as FrameShape,
          'grid-rect-1': {
            id: 'grid-rect-1',
            type: 'rect',
            name: 'Grid Rect 1',
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 50, height: 50 },
            points: [
              { x: 0, y: 0 },
              { x: 50, y: 0 },
              { x: 50, y: 50 },
              { x: 0, y: 50 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'grid-layout-frame',
            frame_id: 'grid-layout-frame',
            fills: [createSolidFill('#FFB6C1', 1)],
          } as RectShape,
          'grid-rect-2': {
            id: 'grid-rect-2',
            type: 'rect',
            name: 'Grid Rect 2',
            x: 0,
            y: 0,
            width: 60,
            height: 40,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 60, height: 40 },
            points: [
              { x: 0, y: 0 },
              { x: 60, y: 0 },
              { x: 60, y: 40 },
              { x: 0, y: 40 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'grid-layout-frame',
            frame_id: 'grid-layout-frame',
            fills: [createSolidFill('#FFDAB9', 1)],
          } as RectShape,
          'grid-rect-3': {
            id: 'grid-rect-3',
            type: 'rect',
            name: 'Grid Rect 3',
            x: 0,
            y: 0,
            width: 70,
            height: 55,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 70, height: 55 },
            points: [
              { x: 0, y: 0 },
              { x: 70, y: 0 },
              { x: 70, y: 55 },
              { x: 0, y: 55 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'grid-layout-frame',
            frame_id: 'grid-layout-frame',
            fills: [createSolidFill('#FFE4B5', 1)],
          } as RectShape,
          'grid-rect-4': {
            id: 'grid-rect-4',
            type: 'rect',
            name: 'Grid Rect 4',
            x: 0,
            y: 0,
            width: 45,
            height: 65,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 45, height: 65 },
            points: [
              { x: 0, y: 0 },
              { x: 45, y: 0 },
              { x: 45, y: 65 },
              { x: 0, y: 65 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'grid-layout-frame',
            frame_id: 'grid-layout-frame',
            fills: [createSolidFill('#B0E0E6', 1)],
          } as RectShape,
          'grid-rect-5': {
            id: 'grid-rect-5',
            type: 'rect',
            name: 'Grid Rect 5',
            x: 0,
            y: 0,
            width: 55,
            height: 48,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 55, height: 48 },
            points: [
              { x: 0, y: 0 },
              { x: 55, y: 0 },
              { x: 55, y: 48 },
              { x: 0, y: 48 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: 'grid-layout-frame',
            frame_id: 'grid-layout-frame',
            fills: [createSolidFill('#87CEFA', 1)],
          } as RectShape,
          'component-instance': {
            id: 'component-instance',
            type: 'rect',
            name: 'My Component Instance',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 100, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(500, 200),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            component_id: componentId,
            shape_ref: componentMainRectId,
          } as RectShape,
          'component-instance-override': {
            id: 'component-instance-override',
            type: 'rect',
            name: 'My Component Instance (Override)',
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            rotation: 45, // <-- Kept this rotation as it's the specific value for this shape
            selrect: { x: 0, y: 0, width: 100, height: 100 },
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
              { x: 0, y: 100 },
            ],
            transform: createBasicTransformMatrix(500, 350),
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            component_id: componentId,
            shape_ref: componentMainRectId,
            touched: ['fills', 'rotation'],
            fills: [createSolidFill('#00BFFF', 1)],
          } as RectShape,
          'path-hidden': {
            id: 'path-hidden',
            type: 'path',
            name: 'Hidden Path',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            rotation: 0, // <-- Removed redundant rotation
            selrect: { x: 0, y: 0, width: 1, height: 1 },
            points: [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
              { x: 1, y: 1 },
              { x: 0, y: 1 },
            ],
            transform: identityMatrix,
            transform_inverse: identityMatrix,
            parent_id: UUID_ZERO,
            frame_id: UUID_ZERO,
            content: [],
            hidden: true,
          } as PathShape,
        },
      },
      [componentMainPageId]: componentMainPage,
    },
    components: {
      [componentId]: componentDefinition,
    },
  },
};

if (canvas) {
  const renderer = new Renderer(canvas);
  renderer.render(penpotFile, 'page-123');
} else {
  console.error('Canvas element not found!');
}
