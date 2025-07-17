// src/renderer.ts
import { Page } from './types/page';
import type {
  AnyShape,
  FrameShape,
  GroupShape,
  PathShape,
  RectShape,
  CircleShape,
  ImageShape,
  SvgRawShape,
  TextShape,
  BoolShape,
} from './types/shape';
import { UUID, UUID_ZERO, HexColor } from './types/common';
import type { Matrix } from './types/geometry';
import type {
  SolidFill,
  //Stroke,
  //ColorProperty,
  GradientFillType,
  ImageFillType,
  GradientFill,
  GradientStop,
  //Shadow,
  //Blur,
} from './types/styles';
import { LayoutEngine } from './layoutEngine'; // <-- NEW: Import LayoutEngine
import type { ComputedLayout } from './types/layoutEngine'; // <-- NEW: Import ComputedLayout

/**
 * The main class for rendering Penpot shapes onto a canvas.
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private currentShapesMap: Record<UUID, AnyShape> = {};
  private layoutEngine: LayoutEngine; // <-- NEW: Instance of LayoutEngine

  /**
   * Creates a new Renderer instance.
   * @param canvas The HTML canvas element to render on.
   */
  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context from canvas.');
    }
    this.ctx = context;
    console.log('Penpot Renderer Initialized.');
    this.layoutEngine = new LayoutEngine(); // <-- NEW: Initialize LayoutEngine
  }

  /**
   * Renders a full Penpot page object.
   * This is the main entry point for rendering.
   * @param page - The page object to render.
   */
  public render(page: Page): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    console.log(`Rendering page: "${page.name}" (ID: ${page.id})`);
    this.currentShapesMap = page.objects;
    const rootShapes = Object.values(this.currentShapesMap).filter(
      (shape) => shape.parent_id === UUID_ZERO || shape.id === UUID_ZERO
    );
    rootShapes.forEach((shape) => this._renderShape(shape));
    console.log(`Finished rendering page: "${page.name}"`);
  }

  /**
   * Applies the transformation matrix of a shape to the canvas context.
   * @param matrix The transformation matrix.
   */
  private _applyTransform(matrix: Matrix): void {
    this.ctx.transform(
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.e,
      matrix.f
    );
  }

  /**
   * Converts a hex color string and an alpha value into an RGBA string.
   * @param hex The hex color string (e.g., "#RRGGBB").
   * @param alpha The alpha value (0-1).
   * @returns An RGBA color string (e.g., "rgba(255,0,0,0.5)").
   */
  private _hexToRgba(hex: HexColor, alpha: number): string {
    let r = 0,
      g = 0,
      b = 0;

    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }

    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${r},${g},${b},${clampedAlpha})`;
  }

  /**
   * Creates a CanvasGradient object from a GradientFill definition.
   * @param gradient The GradientFill object.
   * @returns A CanvasGradient object.
   */
  private _createCanvasGradient(gradient: GradientFill): CanvasGradient {
    let canvasGradient: CanvasGradient;

    if (gradient.type === 'linear') {
      canvasGradient = this.ctx.createLinearGradient(
        gradient.start_x,
        gradient.start_y,
        gradient.end_x,
        gradient.end_y
      );
    } else {
      // radial
      canvasGradient = this.ctx.createRadialGradient(
        gradient.start_x,
        gradient.start_y,
        0, // start circle (x0, y0, r0)
        gradient.end_x,
        gradient.end_y,
        gradient.width // end circle (x1, y1, r1)
      );
    }

    gradient.stops.forEach((stop: GradientStop) => {
      const stopColor = this._hexToRgba(stop.color, stop.opacity ?? 1);
      canvasGradient.addColorStop(stop.offset, stopColor);
    });

    return canvasGradient;
  }

  /**
   * Applies the fills defined for a shape.
   * @param shape The shape object.
   */
  private _applyFills(shape: AnyShape): void {
    if (!shape.fills || shape.fills.length === 0) {
      return;
    }

    // Get shadow properties for this shape, if any
    const dropShadow = shape.shadow?.find(
      (s) => s.style === 'drop-shadow' && !s.hidden
    );
    const hasShadow = !!dropShadow;

    shape.fills.forEach((fill) => {
      // Temporarily apply shadow properties before filling
      if (hasShadow && dropShadow) {
        const shadowColor = dropShadow.color.color;
        const shadowOpacity = dropShadow.color.opacity ?? 1;
        this.ctx.shadowColor = this._hexToRgba(
          shadowColor || '#000000',
          shadowOpacity
        );
        this.ctx.shadowOffsetX = dropShadow.offset_x;
        this.ctx.shadowOffsetY = dropShadow.offset_y;
        this.ctx.shadowBlur = dropShadow.blur;
      }

      if ('fill_color' in fill) {
        const solidFill: SolidFill = fill;
        const opacity = solidFill.fill_opacity ?? 1;
        this.ctx.fillStyle = this._hexToRgba(solidFill.fill_color, opacity);
        this.ctx.fill();
      } else if ('fill_color_gradient' in fill) {
        const gradientFill: GradientFillType = fill;
        this.ctx.fillStyle = this._createCanvasGradient(
          gradientFill.fill_color_gradient
        );
        this.ctx.fill();
      } else if ('fill_image' in fill) {
        const imageFill: ImageFillType = fill;
        console.log(
          `    Placeholder for Image Fill: ${imageFill.fill_image.name}`
        );
      }

      // Reset shadow properties immediately after filling
      if (hasShadow) {
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
      }
    });
  }

  /**
   * Applies the strokes defined for a shape.
   * @param shape The shape object.
   */
  private _applyStrokes(shape: AnyShape): void {
    if (!shape.strokes || shape.strokes.length === 0) {
      return;
    }

    // Get shadow properties for this shape, if any
    const dropShadow = shape.shadow?.find(
      (s) => s.style === 'drop-shadow' && !s.hidden
    );
    const hasShadow = !!dropShadow;

    shape.strokes.forEach((stroke) => {
      // Temporarily apply shadow properties before stroking
      if (hasShadow && dropShadow) {
        const shadowColor = dropShadow.color.color;
        const shadowOpacity = dropShadow.color.opacity ?? 1;
        this.ctx.shadowColor = this._hexToRgba(
          shadowColor || '#000000',
          shadowOpacity
        );
        this.ctx.shadowOffsetX = dropShadow.offset_x;
        this.ctx.shadowOffsetY = dropShadow.offset_y;
        this.ctx.shadowBlur = dropShadow.blur;
      }

      if (
        stroke.stroke_color &&
        'color' in stroke.stroke_color &&
        stroke.stroke_color.color
      ) {
        const strokeColorHex: HexColor = stroke.stroke_color.color;
        const opacity = stroke.stroke_color.opacity ?? 1;
        const width = stroke.stroke_width ?? 1;

        this.ctx.strokeStyle = this._hexToRgba(strokeColorHex, opacity);
        this.ctx.lineWidth = width;
        this.ctx.stroke();
      }

      // Reset shadow properties immediately after stroking
      if (hasShadow) {
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
      }
    });
  }

  /**
   * Applies blur effects to the canvas context for the current shape.
   * Note: `ctx.filter` applies to the *entire* drawing operation following it.
   * @param shape The shape object.
   */
  private _applyBlur(shape: AnyShape): void {
    // Reset filter first
    this.ctx.filter = 'none';

    // Apply Blur
    if (shape.blur && !shape.blur.hidden) {
      this.ctx.filter = `blur(${shape.blur.value}px)`;
    }
  }

  /**
   * Recursively renders a single shape and its children.
   * This method dispatches to specific drawing functions based on shape type.
   * @param shape The shape object to render.
   * @param overrideTransform Optional: A computed transformation matrix to use instead of shape.transform.
   *                          This is used by the LayoutEngine to apply computed positions/sizes.
   */
  private _renderShape(shape: AnyShape, overrideTransform?: Matrix): void {
    // <-- MODIFIED: Added overrideTransform
    if (shape.hidden) {
      return;
    }

    this.ctx.save();
    // Use overrideTransform if provided, otherwise use the shape's own transform
    this._applyTransform(overrideTransform ?? shape.transform); // <-- MODIFIED: Use overrideTransform

    const overallOpacity = shape.opacity ?? 1;
    this.ctx.globalAlpha = overallOpacity;

    // Apply blur filter once per shape (before drawing its path)
    this._applyBlur(shape);

    console.log(
      `  Rendering ${shape.type} "${shape.name}" (ID: ${shape.id}) at matrix translation (${(overrideTransform ?? shape.transform).e}, ${(overrideTransform ?? shape.transform).f})`
    ); // <-- MODIFIED: Log overrideTransform

    switch (shape.type) {
      case 'rect':
        this._drawRect(shape);
        break;
      case 'circle':
        this._drawCircle(shape);
        break;
      case 'path':
        this._drawPath(shape);
        break;
      case 'text':
        this._drawText(shape);
        break;
      case 'image':
        this._drawImage(shape);
        break;
      case 'svg-raw':
        this._drawSvgRaw(shape);
        break;
      case 'bool':
        this._drawBool(shape);
        break;
      case 'group':
        this._drawGroup(shape); // Group handles its own children rendering
        break;
      case 'frame':
        this._drawFrame(shape); // Frame handles its own children rendering
        break;
      default: {
        const getShapeInfo = (s: unknown) => {
          if (
            typeof s === 'object' &&
            s !== null &&
            'type' in s &&
            'name' in s
          ) {
            return `type: "${(s as { type: string }).type}", name: "${(s as { name: string }).name}"`;
          }
          return `unknown shape: ${JSON.stringify(s)}`;
        };
        ((_shape: never) => {
          console.warn(
            `  Unhandled shape encountered: ${getShapeInfo(_shape)}`
          );
        })(shape);
        break;
      }
    }

    this.ctx.restore();
  }

  private _drawRect(shape: RectShape): void {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, shape.width, shape.height);
    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawCircle(shape: CircleShape): void {
    this.ctx.beginPath();
    this.ctx.arc(
      shape.width / 2,
      shape.height / 2,
      Math.min(shape.width, shape.height) / 2,
      0,
      Math.PI * 2
    );
    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawPath(shape: PathShape): void {
    this.ctx.beginPath();
    if (shape.content && shape.content.length > 0) {
      let currentX = 0;
      let currentY = 0;

      shape.content.forEach((command) => {
        switch (command.command) {
          case 'move-to':
            this.ctx.moveTo(command.params.x, command.params.y);
            currentX = command.params.x;
            currentY = command.params.y;
            break;
          case 'line-to':
            this.ctx.lineTo(command.params.x, command.params.y);
            currentX = command.params.x;
            currentY = command.params.y;
            break;
          case 'curve-to':
            this.ctx.bezierCurveTo(
              command.params.c1x ?? currentX,
              command.params.c1y ?? currentY,
              command.params.c2x ?? currentX,
              command.params.c2y ?? currentY,
              command.params.x,
              command.params.y
            );
            currentX = command.params.x;
            currentY = command.params.y;
            break;
          case 'close-path':
            this.ctx.closePath();
            break;
        }
      });
    }

    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawText(shape: TextShape): void {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, shape.width, shape.height);
    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawImage(shape: ImageShape): void {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, shape.width, shape.height);
    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawSvgRaw(shape: SvgRawShape): void {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, shape.width, shape.height);
    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawBool(shape: BoolShape): void {
    this.ctx.beginPath();
    this._drawPath(shape as unknown as PathShape);
    this._applyFills(shape);
    this._applyStrokes(shape);
  }

  private _drawGroup(shape: GroupShape): void {
    // Groups are containers; recursively render their children.
    // They don't have their own layout properties, so children are rendered with their own transforms.
    shape.shapes.forEach((childId) => {
      const childShape = this.currentShapesMap[childId];
      if (childShape) {
        this._renderShape(childShape); // No overrideTransform for group children
      } else {
        console.warn(
          `      Child shape with ID ${childId} not found for group "${shape.name}"`
        );
      }
    });
  }

  private _drawFrame(shape: FrameShape): void {
    this.ctx.beginPath();
    this.ctx.rect(0, 0, shape.width, shape.height);
    this._applyFills(shape);
    this._applyStrokes(shape);

    // NEW: Layout calculation for frame children
    let computedLayout: ComputedLayout = {};
    if (shape.layout) {
      computedLayout = this.layoutEngine.calculateLayout(
        shape,
        this.currentShapesMap
      );
    }

    shape.shapes.forEach((childId) => {
      const childShape = this.currentShapesMap[childId];
      if (childShape) {
        // If layout is active, pass the computed transform for this child
        const childComputedTransform = computedLayout[childId];
        this._renderShape(childShape, childComputedTransform); // <-- MODIFIED: Pass computed transform
      } else {
        console.warn(
          `      Child shape with ID ${childId} not found for frame "${shape.name}"`
        );
      }
    });
  }
}
