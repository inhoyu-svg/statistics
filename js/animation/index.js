/**
 * Animation 시스템 통합 export
 * @version 4.0.0 (Layer + Timeline + Effects 통합)
 */

// Layer 시스템
export { Layer } from './layer/layer.dto.js';
export { LayerManager } from './layer/layer.controller.js';
export {
  findLayerById,
  flattenLayers,
  getRenderableLayers,
  cloneLayer,
  serializeLayer,
  deserializeLayer
} from './layer/layer.service.js';
export {
  generateId,
  calculateStats,
  printDebugTree
} from './layer/layer.utils.js';

// Timeline 시스템
export { LayerTimeline } from './timeline/timeline.controller.js';
export {
  rebuildTimeline,
  calculateProgress,
  getActiveAnimations,
  getProgress,
  getInfo,
  notifyUpdate,
  serializeTimeline,
  deserializeTimeline
} from './timeline/timeline.service.js';
export { applyEasing } from './timeline/timeline.utils.js';

// Animation Effects
export { LayerAnimationEffects } from './effects/animation.controller.js';
export {
  getEffectForLayer,
  adjustOptionsForLayer
} from './effects/animation.service.js';
export {
  applyFade,
  applySlide,
  applyScale,
  applyDraw,
  applyBlink
} from './effects/index.js';
