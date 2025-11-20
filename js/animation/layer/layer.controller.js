// ============================================================================
// LayerManager - 레이어 관리 컨트롤러
// ============================================================================

import { Layer } from './layer.dto.js';
import {
  findLayerById,
  flattenLayers,
  getRenderableLayers,
  serializeLayer,
  deserializeLayer
} from './layer.service.js';
import { calculateStats, printDebugTree } from './layer.utils.js';

/**
 * LayerManager 클래스
 * 레이어 트리 관리, CRUD, 순서 변경 등
 */
export class LayerManager {
  constructor() {
    this.root = new Layer({
      id: 'root',
      name: 'comp',
      type: 'group',
      visible: true
    });

    // 이벤트 리스너
    this.listeners = {
      add: [],
      remove: [],
      update: [],
      reorder: [],
      clear: []
    };
  }

  // ============================================================================
  // 레이어 CRUD
  // ============================================================================

  /**
   * 레이어 추가
   * @param {Layer} layer - 추가할 레이어
   * @param {string} parentId - 부모 레이어 ID (기본: 'root')
   * @returns {boolean} 성공 여부
   */
  addLayer(layer, parentId = 'root') {
    if (!(layer instanceof Layer)) {
      console.error('Layer must be an instance of Layer class');
      return false;
    }

    const parent = this.findLayer(parentId);
    if (!parent) {
      console.error(`Parent layer not found: ${parentId}`);
      return false;
    }

    parent.addChild(layer); // addChild가 p_id 자동 설정
    this._emit('add', { layer, parentId });
    return true;
  }

  /**
   * 레이어 제거
   * @param {string} layerId - 제거할 레이어 ID
   * @returns {boolean} 성공 여부
   */
  removeLayer(layerId) {
    // root는 제거 불가
    if (layerId === 'root') {
      console.error('Cannot remove root layer');
      return false;
    }

    // 삭제 전에 레이어 정보 저장 (이벤트에 전달하기 위해)
    const layer = this.findLayer(layerId);
    if (!layer) {
      console.error(`Layer not found: ${layerId}`);
      return false;
    }

    // 부모에서 제거
    const parent = this.findParent(layerId);
    if (parent && parent.removeChild(layerId)) {
      this._emit('remove', { layerId, layer });
      return true;
    }

    return false;
  }

  /**
   * 레이어 찾기
   * @param {string} layerId - 찾을 레이어 ID
   * @returns {Layer|null} 찾은 레이어 또는 null
   */
  findLayer(layerId) {
    return findLayerById(this.root, layerId);
  }

  /**
   * 부모 레이어 찾기
   * @param {string} layerId - 자식 레이어 ID
   * @returns {Layer|null} 부모 레이어 또는 null
   */
  findParent(layerId) {
    const findParentRecursive = (layer, targetId) => {
      for (const child of layer.children) {
        if (child.id === targetId) {
          return layer;
        }
        const found = findParentRecursive(child, targetId);
        if (found) {
          return found;
        }
      }
      return null;
    };

    return findParentRecursive(this.root, layerId);
  }

  /**
   * 레이어 업데이트
   * @param {string} layerId - 업데이트할 레이어 ID
   * @param {Object} updates - 업데이트할 속성들
   * @returns {boolean} 성공 여부
   */
  updateLayer(layerId, updates) {
    const layer = this.findLayer(layerId);
    if (!layer) {
      console.error(`Layer not found: ${layerId}`);
      return false;
    }

    // 업데이트 적용 (id, p_id, children는 직접 수정 불가)
    Object.keys(updates).forEach(key => {
      if (key in layer && key !== 'id' && key !== 'p_id' && key !== 'children') {
        // visible 속성은 setVisible 메서드 사용 (자손도 함께 변경)
        if (key === 'visible') {
          layer.setVisible(updates[key]);
        } else {
          layer[key] = updates[key];
        }
      }
    });

    this._emit('update', { layerId, updates });
    return true;
  }

  // ============================================================================
  // 레이어 순서 관리
  // ============================================================================

  /**
   * 레이어 순서 변경 (같은 부모 내에서)
   * @param {string} layerId - 이동할 레이어 ID
   * @param {number} newOrder - 새 order 값
   * @returns {boolean} 성공 여부
   */
  reorderLayer(layerId, newOrder) {
    const layer = this.findLayer(layerId);
    if (!layer) {
      console.error(`Layer not found: ${layerId}`);
      return false;
    }

    const oldOrder = layer.order;
    layer.order = newOrder;

    this._emit('reorder', { layerId, oldOrder, newOrder });
    return true;
  }

  /**
   * 레이어를 다른 부모로 이동
   * @param {string} layerId - 이동할 레이어 ID
   * @param {string} newParentId - 새 부모 레이어 ID
   * @param {number} order - 새 부모 내에서의 order (기본: 마지막)
   * @returns {boolean} 성공 여부
   */
  moveLayer(layerId, newParentId, order = -1) {
    const layer = this.findLayer(layerId);
    const newParent = this.findLayer(newParentId);

    if (!layer || !newParent) {
      console.error('Layer or parent not found');
      return false;
    }

    // 순환 참조 방지: newParent가 layer의 자손인지 확인
    if (findLayerById(newParent, layerId)) {
      console.error('Cannot move layer to its own descendant');
      return false;
    }

    // 기존 부모에서 제거
    const oldParent = this.findParent(layerId);
    if (oldParent) {
      oldParent.removeChild(layerId);
    }

    // 새 부모에 추가
    if (order >= 0) {
      layer.order = order;
    } else {
      // 마지막 order + 1
      const maxOrder = Math.max(0, ...newParent.children.map(c => c.order));
      layer.order = maxOrder + 1;
    }

    newParent.addChild(layer); // addChild가 p_id 자동 설정
    this._emit('reorder', { layerId, newParentId, order: layer.order });
    return true;
  }

  // ============================================================================
  // 레이어 조회
  // ============================================================================

  /**
   * 모든 레이어 가져오기 (평탄화)
   * @param {boolean} onlyVisible - visible한 레이어만 (기본: false)
   * @returns {Array} 레이어 배열 [{layer, depth}, ...]
   */
  getAllLayers(onlyVisible = false) {
    return flattenLayers(this.root, onlyVisible);
  }

  /**
   * 렌더링 가능한 레이어만 가져오기
   * @returns {Layer[]} 렌더링 가능한 레이어 배열
   */
  getRenderableLayers() {
    return getRenderableLayers(this.root);
  }

  /**
   * 타입별 레이어 가져오기
   * @param {string} type - 레이어 타입
   * @returns {Layer[]} 해당 타입의 레이어 배열
   */
  getLayersByType(type) {
    const allLayers = this.getAllLayers();
    return allLayers
      .filter(item => item.layer.type === type)
      .map(item => item.layer);
  }

  /**
   * 레이어 검색
   * @param {Function} predicate - 검색 조건 함수
   * @returns {Layer[]} 검색 결과 레이어 배열
   */
  findLayers(predicate) {
    const allLayers = this.getAllLayers();
    return allLayers
      .filter(item => predicate(item.layer))
      .map(item => item.layer);
  }

  // ============================================================================
  // 레이어 상태 관리
  // ============================================================================

  /**
   * 레이어 표시/숨김
   * @param {string} layerId - 레이어 ID
   * @param {boolean} visible - 표시 여부
   * @returns {boolean} 성공 여부
   */
  setLayerVisibility(layerId, visible) {
    return this.updateLayer(layerId, { visible });
  }

  /**
   * 모든 레이어 삭제 (root 제외)
   */
  clearAll() {
    this.root.children = [];
    this._emit('clear', {});
  }

  // ============================================================================
  // JSON 입출력
  // ============================================================================

  /**
   * JSON으로 직렬화
   * @returns {Object} JSON 객체
   */
  toJSON() {
    return {
      version: '3.0.0',
      root: serializeLayer(this.root)
    };
  }

  /**
   * JSON에서 복원
   * @param {Object} json - JSON 객체
   * @returns {boolean} 성공 여부
   */
  fromJSON(json) {
    try {
      this.root = deserializeLayer(json.root);
      return true;
    } catch (error) {
      console.error('Failed to load from JSON:', error);
      return false;
    }
  }

  /**
   * JSON 문자열로 내보내기
   * @param {boolean} pretty - 포맷팅 여부
   * @returns {string} JSON 문자열
   */
  exportJSON(pretty = true) {
    return pretty
      ? JSON.stringify(this.toJSON(), null, 2)
      : JSON.stringify(this.toJSON());
  }

  /**
   * JSON 문자열에서 가져오기
   * @param {string} jsonString - JSON 문자열
   * @returns {boolean} 성공 여부
   */
  importJSON(jsonString) {
    try {
      const json = JSON.parse(jsonString);
      return this.fromJSON(json);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return false;
    }
  }

  // ============================================================================
  // 이벤트 시스템
  // ============================================================================

  /**
   * 이벤트 리스너 등록
   * @param {string} event - 이벤트 이름 ('add'|'remove'|'update'|'reorder'|'clear')
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param {string} event - 이벤트 이름
   * @param {Function} callback - 콜백 함수
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * 이벤트 발생 (내부용)
   * @param {string} event - 이벤트 이름
   * @param {Object} data - 이벤트 데이터
   */
  _emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // ============================================================================
  // 유틸리티
  // ============================================================================

  /**
   * 레이어 통계 정보
   * @returns {Object} 통계 정보
   */
  getStats() {
    const allLayers = this.getAllLayers();
    return calculateStats(allLayers);
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    const stats = this.getStats();
    printDebugTree(this.root, stats);
  }
}
