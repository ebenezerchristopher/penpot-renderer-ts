// src/renderer.ts
import type {
  AnyShape,
  BaseShape,
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
  GradientFillType,
  ImageFillType,
  GradientFill,
  GradientStop,
} from './types/styles';
import { LayoutEngine } from './layoutEngine';
import type { ComputedLayout } from './types/layoutEngine';
import { ParagraphSetNode, ParagraphNode, TextNode } from './types/text'; // These are used at runtime, so not 'import type'
import type { File } from './types/file';

/**
 * The main class for rendering Penpot shapes onto a canvas.
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private currentShapesMap: Record<UUID, AnyShape> = {};
  private layoutEngine: LayoutEngine;
  private currentFile: File | null = null;

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
    this.layoutEngine = new LayoutEngine();
  }

  /**
   * Renders a specific page from a Penpot File object.
   * This is the main entry point for rendering.
   * @param file The full Penpot File object.
   * @param pageId The ID of the page to render.
   */
  public render(file: File, pageId: UUID): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.currentFile = file;

    const page = file.data?.pages_index?.[pageId];
    if (!page) {
      console.error(`Page with ID ${pageId} not found in file.`);
      return;
    }

    console.log(
      `Rendering page: "${page.name}" (ID: ${page.id}) from file "${file.name}"`
    );

    this.currentShapesMap = page.objects;

    const rootShapes = Object.values(this.currentShapesMap).filter(
      (shape) => shape.parent_id === UUID_ZERO || shape.id === UUID_ZERO
    );
    rootShapes.forEach((shape) => this._renderShape(shape));

    console.log(`Finished rendering page: "${page.name}"`);
    this.currentFile = null;
  }

  /**
   * Resolves a shape from a component definition.
   * This is used when rendering a component instance.
   * @param componentId The ID of the component definition.
   * @param shapeRef The ID of the shape within the component's main instance.
   * @returns The referenced shape from the component, or null if not found.
   */
  private _resolveComponentShape(
    componentId: UUID,
    shapeRef: UUID
  ): AnyShape | null {
    if (!this.currentFile?.data?.components) {
      console.warn(
        `  _resolveComponentShape: No components data available in file.`
      );
      return null;
    }

    const component = this.currentFile.data.components[componentId];
    if (!component) {
      console.warn(
        `  _resolveComponentShape: Component with ID ${componentId} not found.`
      );
      return null;
    }

    if (component.objects) {
      return component.objects[shapeRef] ?? null;
    } else if (component.main_instance_page && component.main_instance_id) {
      const mainInstancePage =
        this.currentFile.data.pages_index?.[component.main_instance_page];
      if (mainInstancePage) {
        const findShapeInHierarchy = (
          rootShape: AnyShape,
          targetId: UUID
        ): AnyShape | null => {
          if (rootShape.id === targetId) {
            return rootShape;
          }
          if ('shapes' in rootShape && rootShape.shapes) {
            for (const childId of rootShape.shapes) {
              const childShape = mainInstancePage.objects[childId];
              if (childShape) {
                const found = findShapeInHierarchy(childShape, targetId);
                if (found) return found;
              }
            }
          }
          return null;
        };

        const mainInstanceRoot =
          mainInstancePage.objects[component.main_instance_id];
        if (mainInstanceRoot) {
          return findShapeInHierarchy(mainInstanceRoot, shapeRef);
        }
      }
    }
    return null;
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

    const dropShadow = shape.shadow?.find(
      (s) => s.style === 'drop-shadow' && !s.hidden
    );
    const hasShadow = !!dropShadow;

    shape.fills.forEach((fill) => {
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

    const dropShadow = shape.shadow?.find(
      (s) => s.style === 'drop-shadow' && !s.hidden
    );
    const hasShadow = !!dropShadow;

    shape.strokes.forEach((stroke) => {
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
   * @param shape The shape object.
   */
  private _applyBlur(shape: AnyShape): void {
    this.ctx.filter = 'none';

    if (shape.blur && !shape.blur.hidden) {
      this.ctx.filter = `blur(${shape.blur.value}px)`;
    }
  }

  /**
   * Safely copies a property from a source object to a target object.
   * This helper is used for applying component instance overrides.
   * @param target The target object (e.g., the merged shape).
   * @param source The source object (e.g., the instance shape).
   * @param key The key of the property to copy.
   */
  private _copyProperty<T extends BaseShape, K extends keyof T>(
    target: T,
    source: T,
    key: K
  ): void {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
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
    if (shape.hidden) {
      return;
    }

    // Handle component instances and apply overrides
    if (
      this.currentFile &&
      shape.component_id &&
      shape.shape_ref &&
      !shape.main_instance
    ) {
      const referencedShape = this._resolveComponentShape(
        shape.component_id,
        shape.shape_ref
      );

      if (referencedShape) {
        let mergedShape: AnyShape = Object.assign({}, referencedShape);

        if (shape.touched) {
          for (const key of shape.touched) {
            this._copyProperty(mergedShape, shape, key as keyof BaseShape);
          }
        }

        console.log(
          `  Rendering Component Instance: "${shape.name}" (ID: ${shape.id}) referencing "${referencedShape.name}" (ID: ${referencedShape.id}) with overrides.`
        );
        this._renderShape(mergedShape, overrideTransform ?? shape.transform);
        return;
      } else {
        console.warn(
          `  Component Instance: Referenced shape ${shape.shape_ref} not found for component ${shape.component_id} in instance "${shape.name}".`
        );
      }
    }

    this.ctx.save();
    this._applyTransform(overrideTransform ?? shape.transform);

    const overallOpacity = shape.opacity ?? 1;
    this.ctx.globalAlpha = overallOpacity;

    this._applyBlur(shape);

    console.log(
      `  Rendering ${shape.type} "${shape.name}" (ID: ${shape.id}) at matrix translation (${(overrideTransform ?? shape.transform).e}, ${(overrideTransform ?? shape.transform).f})`
    );

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
        this._drawGroup(shape);
        break;
      case 'frame':
        this._drawFrame(shape);
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

  /**
   * Applies font styles and fills/strokes for a text node.
   * @param node The text or paragraph node.
   */
  private _applyTextNodeStyles(node: ParagraphNode | TextNode): void {
    const fontStyle = node.font_style ?? 'normal';
    const fontWeight = node.font_weight ?? 'normal';
    const fontSize = node.font_size ?? '14px';
    const fontFamily = node.font_family ?? 'sans-serif';

    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;

    if (node.fills && node.fills.length > 0) {
      const firstFill = node.fills[0];
      if ('fill_color' in firstFill) {
        const solidFill: SolidFill = firstFill;
        const opacity = solidFill.fill_opacity ?? 1;
        this.ctx.fillStyle = this._hexToRgba(solidFill.fill_color, opacity);
      }
    } else {
      this.ctx.fillStyle = 'black';
    }
  }

  private _drawText(shape: TextShape): void {
    let currentYOffset = 0;

    if (shape.content && shape.content.children) {
      shape.content.children.forEach((paragraphSetOrParagraph) => {
        const paragraphs: ParagraphNode[] = [];
        if (paragraphSetOrParagraph.type === 'paragraph-set') {
          paragraphs.push(
            ...(paragraphSetOrParagraph as ParagraphSetNode).children
          );
        } else if (paragraphSetOrParagraph.type === 'paragraph') {
          paragraphs.push(paragraphSetOrParagraph as ParagraphNode);
        }

        paragraphs.forEach((paragraph) => {
          if (paragraph.children) {
            let currentXOffset = 0;

            this._applyTextNodeStyles(paragraph);

            paragraph.children.forEach((textNode) => {
              this._applyTextNodeStyles(textNode);

              this.ctx.fillText(
                textNode.text,
                currentXOffset,
                currentYOffset + (parseFloat(this.ctx.font) || 14)
              );

              currentXOffset += this.ctx.measureText(textNode.text).width;
            });
          }
          currentYOffset += (parseFloat(this.ctx.font) || 14) * 1.2;
        });
      });
    }

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
    shape.shapes.forEach((childId) => {
      const childShape = this.currentShapesMap[childId];
      if (childShape) {
        this._renderShape(childShape);
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
        const childComputedTransform = computedLayout[childId];
        this._renderShape(childShape, childComputedTransform);
      } else {
        console.warn(
          `      Child shape with ID ${childId} not found for frame "${shape.name}"`
        );
      }
    });
  }
}
