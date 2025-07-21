// src/modules.d.ts

// This file provides type definitions for non-standard modules that TypeScript
// doesn't know about, such as our emscripten-generated JavaScript glue file.

// We declare a module with the exact path we use in the import statement.
declare module '/render_wasm.js' {
  // We import the factory type definition from our existing emscripten types.
  import type { default as MainModuleFactory } from './types/emscripten.types';

  // We export the factory function as the default export of this module.
  const factory: MainModuleFactory;
  export default factory;
}
