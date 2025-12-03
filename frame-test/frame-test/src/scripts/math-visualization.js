// ============================================================================
// Math Visualization - 시각화 렌더링 컨트롤러
// @version 2.0.0
// ============================================================================

import { renderGraph } from './visualization-api.esm.js';
import { render as renderStatistics } from './../../../../js/viz-api.js';

class MathVisualization {
  // ============================================================================
  // State (상태 관리)
  // ============================================================================

  /** @type {Set<string>} 이전 렌더 사이클에서 보였던 viz 컨테이너 ID 집합 */
  static #prevVisibleVizIds = new Set();

  /** @type {Map<string, boolean>} 컨테이너별 '이탈했다가 돌아옴' 상태 플래그 */
  static #wasLeftMap = new Map();

  // ============================================================================
  // Renderer Registry (타입별 렌더러)
  // ============================================================================

  /** @type {Object<string, Function>} 시각화 타입별 렌더러 매핑 */
  static #renderers = {
    'graph_library': MathVisualization.#renderGraph,
    'geometry': MathVisualization.#renderGraph,
    'image': MathVisualization.#renderImage,
    'statistics': MathVisualization.#renderStatistics
  };

  /**
   * 타입에 해당하는 렌더러 반환
   * @param {string} type - 시각화 타입
   * @returns {Function|null} 렌더러 함수
   */
  static #getRenderer(type) {
    return MathVisualization.#renderers[type] || null;
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * reveal된 요소들 중 시각화 컨테이너를 찾아서 렌더링
   * @param {Array<string>} revealElements - reveal된 요소 ID 배열
   */
  static renderAll(revealElements) {
    if (!revealElements?.length) return;

    const vizIds = MathVisualization.#filterVisualizationIds(revealElements);
    const { enteredSet } = MathVisualization.#updateVisibilityState(vizIds);

    vizIds.forEach(id => MathVisualization.#processVisualization(id, enteredSet));
  }

  // ============================================================================
  // Visibility Tracking (진입/이탈 추적)
  // ============================================================================

  /**
   * 시각화 컨테이너 ID만 필터링
   * @param {Array<string>} elements - 요소 ID 배열
   * @returns {Array<string>} 시각화 컨테이너 ID 배열
   */
  static #filterVisualizationIds(elements) {
    return elements.filter(id => id.startsWith('visualizationContainer'));
  }

  /**
   * 진입/이탈 상태 업데이트
   * @param {Array<string>} currentIds - 현재 보이는 ID 배열
   * @returns {{ enteredSet: Set<string> }} 진입한 ID 집합
   */
  static #updateVisibilityState(currentIds) {
    const currentSet = new Set(currentIds);
    const prevSet = MathVisualization.#prevVisibleVizIds;

    // 이탈한 ID 마킹
    [...prevSet]
      .filter(id => !currentSet.has(id))
      .forEach(id => MathVisualization.#wasLeftMap.set(id, true));

    // 진입한 ID 계산
    const enteredSet = new Set([...currentSet].filter(id => !prevSet.has(id)));

    // 현재 상태 저장
    MathVisualization.#prevVisibleVizIds = currentSet;

    return { enteredSet };
  }

  /**
   * 재렌더링 필요 여부 판단
   * @param {string} vizId - 시각화 ID
   * @param {HTMLElement} element - DOM 요소
   * @param {Set<string>} enteredSet - 진입한 ID 집합
   * @returns {boolean} 재렌더링 필요 여부
   */
  static #shouldRerender(vizId, element, enteredSet) {
    // 아직 렌더링되지 않은 경우
    if (element.dataset.rendered !== 'true') {
      return true;
    }

    // 이탈 후 재진입한 경우
    const wasLeft = MathVisualization.#wasLeftMap.get(vizId) === true;
    const isEnteredNow = enteredSet.has(vizId);

    if (wasLeft && isEnteredNow) {
      MathVisualization.#prepareForRerender(element, vizId);
      return true;
    }

    return false;
  }

  /**
   * 재렌더링을 위한 준비 (기존 캔버스 제거)
   * @param {HTMLElement} element - DOM 요소
   * @param {string} vizId - 시각화 ID
   */
  static #prepareForRerender(element, vizId) {
    const canvases = element.querySelectorAll('canvas');
    canvases.forEach(c => c.remove());

    element.dataset.rendered = 'false';
    MathVisualization.#wasLeftMap.set(vizId, false);
  }

  // ============================================================================
  // Config Parsing (설정 파싱)
  // ============================================================================

  /**
   * 요소에서 시각화 설정 파싱
   * @param {HTMLElement} element - DOM 요소
   * @returns {{ type: string|null, config: Object|string|null }} 파싱된 설정
   */
  static #parseConfig(element) {
    const type = element.getAttribute('data-viz-type');
    const configString = element.getAttribute('data-viz-config');

    if (!type || !configString) {
      return { type: null, config: null };
    }

    // image 타입은 URL 문자열 그대로 반환
    if (type === 'image') {
      return { type, config: configString };
    }

    // JSON 파싱
    try {
      const config = JSON.parse(configString.trim());
      return { type, config };
    } catch {
      console.error('시각화 설정 파싱 오류');
      return { type: null, config: null };
    }
  }

  // ============================================================================
  // Visualization Processing (시각화 처리)
  // ============================================================================

  /**
   * 개별 시각화 처리
   * @param {string} vizId - 시각화 ID
   * @param {Set<string>} enteredSet - 진입한 ID 집합
   */
  static #processVisualization(vizId, enteredSet) {
    const element = document.getElementById(vizId);
    if (!element) return;

    if (!MathVisualization.#shouldRerender(vizId, element, enteredSet)) return;

    const { type, config } = MathVisualization.#parseConfig(element);
    if (!type || !config) return;

    const renderer = MathVisualization.#getRenderer(type);
    if (!renderer) {
      console.warn(`알 수 없는 시각화 타입: ${type}`);
      return;
    }

    try {
      renderer(element, config);
      element.dataset.rendered = 'true';
    } catch (error) {
      console.error(`시각화 렌더링 오류 (${vizId}):`, error);
    }
  }

  // ============================================================================
  // Renderers (렌더러)
  // ============================================================================

  /**
   * 그래프 렌더링 (graph_library, geometry)
   * @param {HTMLElement} element - DOM 요소
   * @param {Object} config - 시각화 설정
   */
  static #renderGraph(element, config) {
    console.log(element, config);
    
    renderStatistics(element, config);
  }

  /**
   * 이미지 렌더링
   * @param {HTMLElement} element - DOM 요소
   * @param {string} url - 이미지 URL
   */
  static #renderImage(element, url) {
    const img = document.createElement('img');
    img.src = url;
    element.appendChild(img);
  }

  /**
   * 통계 시각화 렌더링 (placeholder)
   * @param {HTMLElement} element - DOM 요소
   * @param {Object} config - 시각화 설정
   */
  static #renderStatistics(element, config) {
    renderStatistics(element, config);
    console.warn('statistics 렌더러 미구현');
  }
}

// ============================================================================
// Export
// ============================================================================

export { MathVisualization };
