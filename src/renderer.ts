// src/renderer.ts
import type { AnyShape } from './types/shape';
import type { UUID } from './types/common';
import type { File } from './types/file';
import { WasmBridge } from './wasm-bridge';
import { serializeShape } from './serializers/shape';

/**
 * The main class for rendering Penpot shapes onto a canvas via the WASM engine.
 */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private bridge: WasmBridge;
  private currentShapesMap: Record<UUID, AnyShape> = {};
  private animationFrameId: number | null = null;
  private isInitialized = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bridge = WasmBridge.getInstance();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.bridge.loadModule();
    this.bridge.assignCanvas(this.canvas);

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;

    // The WASM _init function expects logical pixels, not device pixels.
    this.bridge.init(this.canvas.clientWidth, this.canvas.clientHeight);
    this.isInitialized = true;
    console.log('Penpot WASM Renderer Initialized.');
  }

  public async render(file: File, pageId: UUID): Promise<void> {
    await this.initialize();

    const page = file.data?.pages_index?.[pageId];
    if (!page) {
      console.error(`Page with ID ${pageId} not found in file.`);
      return;
    }

    console.log(`Rendering page: "${page.name}"`);
    this.currentShapesMap = page.objects;

    const allShapes = Object.values(this.currentShapesMap);

    this.bridge.initShapesPool(allShapes.length);

    const zoom = 1.0;
    const viewbox = { x: 0, y: 0 };
    this.bridge.setView(zoom, -viewbox.x, -viewbox.y);

    for (const shape of allShapes) {
      this.setShape(shape);
    }

    this.bridge.clearDrawingCache();
    this.requestRender();
    console.log(`Finished sending page "${page.name}" data to WASM.`);
  }

  private setShape(shape: AnyShape): void {
    serializeShape(this.bridge, shape);
  }

  private renderLoop = (timestamp: number): void => {
    this.bridge.render(timestamp);
    this.animationFrameId = null;
  };

  private requestRender(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  }

  public cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
