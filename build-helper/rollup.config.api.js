// ============================================================================
// Rollup Configuration - VizAPI Bundle (Statistics)
// ============================================================================

import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'js/viz-api.js',

  output: [
    // UMD build (브라우저 <script> 태그용)
    {
      file: 'dist/viz-api.js',
      format: 'umd',
      name: 'VizAPI',
      sourcemap: true,
      exports: 'named'
    },
    // ES Module build (import용)
    {
      file: 'dist/viz-api.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],

  plugins: [
    resolve()
  ],

  external: []
};
