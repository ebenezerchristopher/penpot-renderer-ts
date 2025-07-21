// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
//
// This file has been updated to use ES2015 module syntax (interfaces) instead of namespaces
// to avoid linter errors, and all 'any' types have been replaced with specific types.

/** A union of all possible WebGL objects managed by the Emscripten GL library. */
type WebGLObject =
  | WebGLBuffer
  | WebGLProgram
  | WebGLFramebuffer
  | WebGLRenderbuffer
  | WebGLTexture
  | WebGLShader
  | WebGLVertexArrayObject
  | WebGLQuery
  | WebGLSampler
  | WebGLTransformFeedback
  | WebGLSync;

/** Represents the internal context object used by Emscripten's GL implementation. */
interface EmscriptenGLContext {
  GLctx: WebGLRenderingContext | WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  attributes: WebGLContextAttributes;
  version: number;
  // The context object may have other internal properties.
  [key: string]: unknown;
}

/**
 * Describes the exports from the Emscripten GL library.
 */
interface GL {
  counter: number;
  buffers: (WebGLBuffer | null)[];
  programs: (WebGLProgram | null)[];
  framebuffers: (WebGLFramebuffer | null)[];
  renderbuffers: (WebGLRenderbuffer | null)[];
  textures: (WebGLTexture | null)[];
  shaders: (WebGLShader | null)[];
  vaos: (WebGLVertexArrayObject | null)[];
  contexts: (EmscriptenGLContext | null)[];
  offscreenCanvases: Record<string, OffscreenCanvas>;
  queries: (WebGLQuery | null)[];
  samplers: (WebGLSampler | null)[];
  transformFeedbacks: (WebGLTransformFeedback | null)[];
  syncs: (WebGLSync | null)[];
  stringCache: Record<string, number>;
  stringiCache: Record<number, string>;
  unpackAlignment: number;
  unpackRowLength: number;

  recordError(errorCode: number): void;
  getNewId(table: (unknown | null)[]): number;
  genObject(
    n: number,
    buffers: number, // Pointer to GLuint[]
    createFunction: () => WebGLObject | null,
    objectTable: (WebGLObject | null)[]
  ): void;
  getSource(
    shader: number, // GLuint handle
    count: number,
    string: number, // char**
    length: number // const GLint*
  ): string;
  createContext(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    webGLContextAttributes: WebGLContextAttributes
  ): number; // returns context handle
  registerContext(
    ctx: WebGLRenderingContext | WebGL2RenderingContext,
    webGLContextAttributes: WebGLContextAttributes
  ): number; // returns context handle
  makeContextCurrent(contextHandle: number): boolean;
  getContext(contextHandle: number): EmscriptenGLContext;
  deleteContext(contextHandle: number): void;
  initExtensions(context: EmscriptenGLContext): void;
}

/**
 * Describes the exports from the Emscripten runtime.
 */
export interface RuntimeExports {
  GL: GL;
  stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): number;
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
  HEAPF32: Float32Array;
}

export interface WasmModule {
  _init(_0: number, _1: number): void;
  _clean_up(): void;
  _free_bytes(): void;
  _clear_drawing_cache(): void;
  _set_render_options(_0: number, _1: number): void;
  _set_canvas_background(_0: number): void;
  _render(_0: number): void;
  _render_from_cache(_0: number): void;
  _process_animation_frame(_0: number): void;
  _reset_canvas(): void;
  _resize_viewbox(_0: number, _1: number): void;
  _set_view(_0: number, _1: number, _2: number): void;
  _clear_focus_mode(): void;
  _set_focus_mode(): void;
  _init_shapes_pool(_0: number): void;
  _use_shape(_0: number, _1: number, _2: number, _3: number): void;
  _set_parent(_0: number, _1: number, _2: number, _3: number): void;
  _set_shape_masked_group(_0: number): void;
  _set_shape_bool_type(_0: number): void;
  _set_shape_type(_0: number): void;
  _set_shape_selrect(_0: number, _1: number, _2: number, _3: number): void;
  _set_shape_clip_content(_0: number): void;
  _set_shape_rotation(_0: number): void;
  _set_shape_transform(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number
  ): void;
  _add_shape_child(_0: number, _1: number, _2: number, _3: number): void;
  _set_children(): void;
  _store_image(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number,
    _7: number
  ): void;
  _is_image_cached(_0: number, _1: number, _2: number, _3: number): number;
  _set_shape_svg_raw_content(): void;
  _set_shape_blend_mode(_0: number): void;
  _set_shape_vertical_align(_0: number): void;
  _set_shape_opacity(_0: number): void;
  _set_shape_constraint_h(_0: number): void;
  _set_shape_constraint_v(_0: number): void;
  _set_shape_hidden(_0: number): void;
  _set_shape_blur(_0: number, _1: number, _2: number): void;
  _set_shape_corners(_0: number, _1: number, _2: number, _3: number): void;
  _propagate_modifiers(_0: number): number;
  _get_selection_rect(): number;
  _set_structure_modifiers(): void;
  _clean_modifiers(): void;
  _set_modifiers(): void;
  _add_shape_shadow(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number
  ): void;
  _clear_shape_shadows(): void;
  _update_shape_tiles(): void;
  _set_flex_layout_data(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number,
    _7: number,
    _8: number,
    _9: number,
    _10: number,
    _11: number
  ): void;
  _set_layout_child_data(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number,
    _7: number,
    _8: number,
    _9: number,
    _10: number,
    _11: number,
    _12: number,
    _13: number,
    _14: number,
    _15: number,
    _16: number,
    _17: number
  ): void;
  _set_grid_layout_data(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number,
    _7: number,
    _8: number,
    _9: number,
    _10: number
  ): void;
  _set_grid_columns(): void;
  _set_grid_rows(): void;
  _set_grid_cells(): void;
  _show_grid(_0: number, _1: number, _2: number, _3: number): void;
  _hide_grid(): void;
  _get_grid_coords(_0: number, _1: number): number;
  _main(_0: number, _1: number): number;
  _alloc_bytes(_0: number): number;
  _set_shape_fills(): void;
  _add_shape_fill(): void;
  _clear_shape_fills(): void;
  _store_font(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number,
    _7: number,
    _8: number,
    _9: number,
    _10: number,
    _11: number
  ): void;
  _is_font_uploaded(
    _0: number,
    _1: number,
    _2: number,
    _3: number,
    _4: number,
    _5: number,
    _6: number
  ): number;
  _set_shape_path_content(): void;
  _set_shape_path_attrs(_0: number): void;
  _add_shape_center_stroke(
    _0: number,
    _1: number,
    _2: number,
    _3: number
  ): void;
  _add_shape_inner_stroke(_0: number, _1: number, _2: number, _3: number): void;
  _add_shape_outer_stroke(_0: number, _1: number, _2: number, _3: number): void;
  _add_shape_stroke_fill(): void;
  _clear_shape_strokes(): void;
  _clear_shape_text(): void;
  _set_shape_text_content(): void;
  _set_shape_grow_type(_0: number): void;
  _get_text_dimensions(): number;
}

/**
 * The full Emscripten module, combining WASM exports and the JS runtime.
 */
export type MainModule = WasmModule & RuntimeExports;

/**
 * Factory function to create an instance of the Emscripten module.
 * @param options Optional Emscripten module configuration.
 * @returns A promise that resolves to the fully initialized module.
 */
declare function MainModuleFactory(options?: unknown): Promise<MainModule>;
export default MainModuleFactory;
