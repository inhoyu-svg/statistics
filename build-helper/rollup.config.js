// ============================================================================
// Rollup Configuration - VizAPI Bundle Only (Statistics)
// ============================================================================

import resolve from '@rollup/plugin-node-resolve';

// 날짜 및 시간 기반 빌드 폴더 생성 (YYYYMMDDHHMM)
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const day = String(now.getDate()).padStart(2, '0');
const hour = String(now.getHours()).padStart(2, '0');
const minute = String(now.getMinutes()).padStart(2, '0');
const dateTimeStr = `${year}${month}${day}${hour}${minute}`;
const buildDir = `build-helper/bundles/${dateTimeStr}`;

export default {
  // VizAPI Bundle
  input: 'js/viz-api.js',
  output: [
    {
      file: `${buildDir}/viz-api.js`,
      format: 'umd',
      name: 'VizAPI',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: `${buildDir}/viz-api.esm.js`,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [resolve()],
  external: []
};
