// src/wasm-bridge.ts
import type { Rect as SelRect } from './types';
import createRustSkiaModule from '../public/render_wasm.js';
import type {
  MainModule,
  default as MainModuleFactory,
} from './types/emscripten.types';

/**
 * WasmBridge is a singleton class that manages the WebAssembly module instance.
 * It handles loading, initialization, and provides a typed interface to the WASM functions.
 */
export class WasmBridge {
  private static instance: WasmBridge;
  private module: MainModule | null = null;
  private moduleLoadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): WasmBridge {
    if (!WasmBridge.instance) {
      WasmBridge.instance = new WasmBridge();
    }
    return WasmBridge.instance;
  }

  public async loadModule(): Promise<void> {
    if (this.module) return;
    if (this.moduleLoadPromise) return this.moduleLoadPromise;

    this.moduleLoadPromise = (async () => {
      try {
        console.log('Loading WASM module from src/vendor...');

        // This is the key: The `locateFile` function tells Emscripten where to find
        // the .wasm file. We return the root-relative path, which is correct
        // because the .wasm file is served from the /public directory.
        const module = await (createRustSkiaModule as typeof MainModuleFactory)(
          {
            locateFile: (path: string) => {
              if (path.endsWith('.wasm')) {
                return '/render_wasm.wasm';
              }
              return path;
            },
          }
        );

        this.module = module;
        console.log('WASM module loaded successfully.');
      } catch (error) {
        console.error('Failed to load WASM module:', error);
        throw error;
      } finally {
        this.moduleLoadPromise = null;
      }
    })();
    return this.moduleLoadPromise;
  }

  private getModule(): MainModule {
    if (!this.module) {
      throw new Error('WASM module is not loaded. Call loadModule() first.');
    }
    return this.module;
  }

  // --- Canvas & Core Rendering ---
  public assignCanvas(canvas: HTMLCanvasElement): void {
    const module = this.getModule();
    const context = canvas.getContext('webgl2', {
      antialias: false,
      depth: true,
      stencil: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    if (!context) throw new Error('Could not get WebGL2 context');

    const contextAttributes = { majorVersion: 2 } as any;
    const handle = module.GL.registerContext(context, contextAttributes);
    module.GL.makeContextCurrent(handle);

    context.getExtension('WEBGL_debug_renderer_info');
  }

  public init(width: number, height: number): void {
    this.getModule()._init(width, height);
  }

  public render(timestamp: number): void {
    this.getModule()._render(timestamp);
  }

  public resizeViewbox(width: number, height: number): void {
    this.getModule()._resize_viewbox(width, height);
  }

  public setCanvasBackground(color: number): void {
    this.getModule()._set_canvas_background(color);
  }

  public setView(zoom: number, x: number, y: number): void {
    this.getModule()._set_view(zoom, x, y);
  }

  public clearDrawingCache(): void {
    this.getModule()._clear_drawing_cache();
  }

  // --- Memory Management ---
  public allocBytes(size: number): number {
    return this.getModule()._alloc_bytes(size);
  }

  public getHeapU8(): Uint8Array {
    return this.getModule().HEAPU8;
  }

  // --- Shape Management ---
  public initShapesPool(count: number): void {
    this.getModule()._init_shapes_pool(count);
  }

  public useShape(id: Uint32Array): void {
    this.getModule()._use_shape(id[0], id[1], id[2], id[3]);
  }

  public setParent(id: Uint32Array): void {
    this.getModule()._set_parent(id[0], id[1], id[2], id[3]);
  }

  public setShapeType(type: number): void {
    this.getModule()._set_shape_type(type);
  }

  public setShapeTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void {
    this.getModule()._set_shape_transform(a, b, c, d, e, f);
  }

  public setShapeOpacity(opacity: number): void {
    this.getModule()._set_shape_opacity(opacity);
  }

  public setShapeHidden(hidden: boolean): void {
    this.getModule()._set_shape_hidden(hidden ? 1 : 0);
  }

  public setShapeSelRect(rect: SelRect): void {
    this.getModule()._set_shape_selrect(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    );
  }

  public setChildren(): void {
    this.getModule()._set_children();
  }

  // --- Fills, Strokes, and other properties ---
  public setShapeFills(): void {
    this.getModule()._set_shape_fills();
  }

  public clearShapeFills(): void {
    this.getModule()._clear_shape_fills();
  }

  public clearShapeStrokes(): void {
    this.getModule()._clear_shape_strokes();
  }
}
