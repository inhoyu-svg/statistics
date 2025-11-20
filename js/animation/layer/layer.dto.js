// ============================================================================
// Layer DTO - 레이어 데이터 구조
// ============================================================================

import { generateId } from './layer.utils.js';

/**
 * Layer 클래스
 * 모든 그래픽 요소를 Layer로 통일하여 관리
 */
export class Layer {
  /**
   * @param {Object} config - 레이어 설정
   * @param {string} config.id - 고유 ID (선택사항, 자동 생성)
   * @param {string} config.name - 사용자 정의 이름
   * @param {string} config.type - 레이어 타입 ('group'|'function'|'shape'|'point'|'line')
   * @param {boolean} config.visible - 표시 여부 (기본: true)
   * @param {number} config.order - 렌더링 순서 (기본: 0)
   * @param {string} config.p_id - 부모 레이어 ID (기본: null)
   * @param {Layer[]} config.children - 자손 레이어들 (기본: [])
   * @param {Object} config.data - 타입별 데이터
   */
  constructor(config) {
    this.id = config.id || generateId();
    this.name = config.name || 'Untitled Layer';
    this.type = config.type || 'group';
    this.visible = config.visible !== undefined ? config.visible : true;
    this.order = config.order !== undefined ? config.order : 0;
    this.p_id = config.p_id || null; // 부모 ID
    this.children = [];
    this.data = config.data || {};

    // children이 있으면 addChild를 통해 추가 (p_id 자동 설정)
    if (config.children && config.children.length > 0) {
      config.children.forEach(child => {
        this.addChild(child);
      });
    }
  }

  /**
   * 자손 레이어 추가
   * @param {Layer} layer - 추가할 레이어
   * @returns {Layer} this
   */
  addChild(layer) {
    if (!(layer instanceof Layer)) {
      throw new Error('Child must be a Layer instance');
    }
    layer.p_id = this.id; // 부모 ID 설정
    this.children.push(layer);
    return this;
  }

  /**
   * 자손 레이어 제거
   * @param {string} layerId - 제거할 레이어 ID
   * @returns {boolean} 제거 성공 여부
   */
  removeChild(layerId) {
    const index = this.children.findIndex(child => child.id === layerId);
    if (index !== -1) {
      const removed = this.children.splice(index, 1)[0];
      removed.p_id = null; // 부모 ID 제거
      return true;
    }
    return false;
  }

  /**
   * visible 설정 (자손도 함께 변경)
   * @param {boolean} visible - 표시 여부
   * @param {boolean} recursive - 자손도 함께 변경할지 여부 (기본: true)
   */
  setVisible(visible, recursive = true) {
    this.visible = visible;

    // 그룹 레이어이고 recursive가 true면 자식들도 함께 변경
    if (recursive && this.type === 'group' && this.children.length > 0) {
      this.children.forEach(child => {
        child.setVisible(visible, recursive);
      });
    }
  }

  /**
   * 레이어 정보 문자열
   * @returns {string} 레이어 정보
   */
  toString() {
    const childrenInfo = this.children.length > 0
      ? ` (${this.children.length} children)`
      : '';
    return `Layer[${this.type}] ${this.name}${childrenInfo}`;
  }
}
