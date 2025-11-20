// ============================================================================
// Layer Service - 레이어 비즈니스 로직
// ============================================================================

import { Layer } from './layer.dto.js';
import { generateId } from './layer.utils.js';

/**
 * ID로 자손 레이어 찾기 (재귀적)
 * @param {Layer} layer - 검색할 레이어
 * @param {string} layerId - 찾을 레이어 ID
 * @returns {Layer|null} 찾은 레이어 또는 null
 */
export function findLayerById(layer, layerId) {
  if (layer.id === layerId) {
    return layer;
  }

  for (const child of layer.children) {
    const found = findLayerById(child, layerId);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * 레이어 트리를 평탄화 (DFS 순회)
 * @param {Layer} layer - 평탄화할 레이어
 * @param {boolean} onlyVisible - visible한 레이어만 포함 (기본: false)
 * @returns {Array} 평탄화된 레이어 배열 [{layer, depth}, ...]
 */
export function flattenLayers(layer, onlyVisible = false) {
  const result = [];

  const traverse = (currentLayer, depth = 0) => {
    if (onlyVisible && !currentLayer.visible) {
      return;
    }

    // 현재 레이어 추가 (depth 정보 포함)
    result.push({
      layer: currentLayer,
      depth
    });

    // 자손 레이어 순회
    if (currentLayer.children && currentLayer.children.length > 0) {
      // order로 정렬
      const sortedChildren = [...currentLayer.children].sort((a, b) => a.order - b.order);
      sortedChildren.forEach(child => traverse(child, depth + 1));
    }
  };

  traverse(layer);
  return result;
}

/**
 * 렌더링 가능한 레이어만 추출 (group 제외)
 * @param {Layer} layer - 검색할 레이어
 * @returns {Layer[]} 렌더링 가능한 레이어 배열
 */
export function getRenderableLayers(layer) {
  const flattened = flattenLayers(layer, true);
  return flattened
    .filter(item => item.layer.type !== 'group')
    .map(item => item.layer);
}

/**
 * 레이어 복제
 * @param {Layer} layer - 복제할 레이어
 * @param {boolean} deep - 자손까지 복제할지 여부 (기본: true)
 * @returns {Layer} 복제된 레이어
 */
export function cloneLayer(layer, deep = true) {
  const clonedData = JSON.parse(JSON.stringify(layer.data));
  const cloned = new Layer({
    id: generateId(), // 새 ID 생성
    name: `${layer.name} (복사)`,
    type: layer.type,
    visible: layer.visible,
    order: layer.order,
    p_id: layer.p_id, // 부모 ID 유지
    data: clonedData
  });

  if (deep) {
    layer.children.forEach(child => {
      const clonedChild = cloneLayer(child, true);
      cloned.addChild(clonedChild); // addChild가 p_id 자동 설정
    });
  }

  return cloned;
}

/**
 * 레이어를 JSON으로 직렬화
 * @param {Layer} layer - 직렬화할 레이어
 * @returns {Object} JSON 객체
 */
export function serializeLayer(layer) {
  return {
    id: layer.id,
    name: layer.name,
    type: layer.type,
    visible: layer.visible,
    order: layer.order,
    p_id: layer.p_id,
    children: layer.children.map(child => serializeLayer(child)),
    data: layer.data
  };
}

/**
 * JSON에서 레이어 복원
 * @param {Object} json - JSON 객체
 * @returns {Layer} 복원된 레이어
 */
export function deserializeLayer(json) {
  const layer = new Layer({
    id: json.id,
    name: json.name,
    type: json.type,
    visible: json.visible,
    order: json.order,
    p_id: json.p_id,
    data: json.data
  });

  // 자손 레이어 복원 (addChild를 통해 p_id 자동 설정)
  if (json.children) {
    json.children.forEach(childJson => {
      const child = deserializeLayer(childJson);
      layer.addChild(child);
    });
  }

  return layer;
}
