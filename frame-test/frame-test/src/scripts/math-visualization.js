import { renderGraph } from '../../src/scripts/visualization-api.esm.js';
import { renderChart } from '../../../../js/viz-api.js';

class MathVisualization {
  // 이전 렌더 사이클에서 보였던 viz 컨테이너 ID 집합
  static _prevVisibleVizIds = new Set();
  // 컨테이너별 '이탈했다가 돌아옴' 상태 플래그
  static _wasLeftMap = new Map();

  /**
   * reveal된 요소들 중 시각화 컨테이너를 찾아서 렌더링
   * @param {Array<string>} revealElements - reveal된 요소 ID 배열
   */
  static renderAll(revealElements) {
    if (!revealElements || revealElements.length === 0) return;

    // reveal된 요소 중 visualizationContainer로 시작하는 것들을 찾음
    const visualizationIds = revealElements.filter(id => id.startsWith('visualizationContainer'));

    // 진입/이탈 집합 계산
    const currentSet = new Set(visualizationIds);
    const prevSet = MathVisualization._prevVisibleVizIds;
    const leftSet = new Set([...prevSet].filter(id => !currentSet.has(id)));
    const enteredSet = new Set([...currentSet].filter(id => !prevSet.has(id)));

    // 이탈한 컨테이너 표시
    leftSet.forEach(id => {
      MathVisualization._wasLeftMap.set(id, true);
    });

    visualizationIds.forEach(vizId => {
      const vizElement = document.getElementById(vizId);

      if (!vizElement) {
        console.warn(`시각화 요소를 찾을 수 없음: ${vizId}`);
        return;
      }

      // 이미 렌더링된 경우: 오직 "이탈 후 재진입"시에만 재렌더링
      if (vizElement.dataset.rendered === 'true') {
        const wasLeft = MathVisualization._wasLeftMap.get(vizId) === true;
        const isEnteredNow = enteredSet.has(vizId);
        if (!(wasLeft && isEnteredNow)) {
          // 계속 같은 컷 안에서 반복 호출되는 경우는 스킵
          console.log(`재진입 아님, 렌더 스킵: ${vizId}`);
          return;
        }
        // 재진입: 기존 캔버스 제거 후 재렌더링
        const canvases = vizElement.querySelectorAll('canvas');
        if (canvases && canvases.length > 0) {
          canvases.forEach(c => c.remove());
        }
        vizElement.dataset.rendered = 'false';
        MathVisualization._wasLeftMap.set(vizId, false);
        console.log(`이탈 후 재진입 감지, 재렌더링: ${vizId}`);
      }

      // getAttribute 사용 (dataset보다 안전)
      const vizType = vizElement.getAttribute('data-viz-type');
      const configString = vizElement.getAttribute('data-viz-config');

      console.log(`시각화 설정 확인: ${vizId}`);
      console.log(`  - vizType:`, vizType);
      console.log(`  - configString 길이:`, configString ? configString.length : 0);

      if (!vizType || !configString) {
        console.warn(`시각화 설정이 없음: ${vizId}`);
        return;
      }

      try {
        // JSON 문자열을 객체로 변환 (trim 처리)
        const config = JSON.parse(configString.trim());

        console.log(`시각화 렌더링 시작: ${vizId}, type: ${vizType}`, config);

        // 시각화 타입에 따라 렌더링
        if (vizType === 'graph_library') {
          MathVisualization.renderGraphInternal(vizElement, config);
        } else if (vizType === 'image') {
          MathVisualization.renderImage(vizElement, configString);
          console.log(`이미지 렌더링 완료: ${vizId}, url: ${configString}`);
        } else {
          console.warn(`알 수 없는 시각화 타입: ${vizType}`);
        }

        // 렌더링 완료 표시
        vizElement.dataset.rendered = 'true';
      } catch (error) {
        console.error(`시각화 렌더링 오류 (${vizId}):`, error);
      }
    });

    // 현재 보이는 집합 저장
    MathVisualization._prevVisibleVizIds = currentSet;
  }

  static renderImage(vizElement, url) {
    const imgElement = document.createElement('img');
    imgElement.src = url;
    vizElement.appendChild(imgElement);
  }

  /**
   * Math Graph Library를 사용하여 그래프/차트 렌더링
   * @param {HTMLElement} vizElement - 시각화 컨테이너 요소
   * @param {Object} config - 시각화 설정
   */
  static renderGraphInternal(vizElement, config) {
    try {
      // data-viz-mode 확인
      const vizMode = vizElement.getAttribute('data-viz-mode');

      if (vizMode === 'chart' || vizMode === 'table' || vizMode === 'both') {
        // Statistics 차트/테이블 렌더링
        console.log(`[MathVisualization] Statistics 모드: ${vizMode}`);
        renderChart(vizElement, config);
      } else {
        // 기본: 좌표평면 그래프 렌더링
        // renderGraph가 내부적으로 data-viz-canvas, config 수집, 좌표 계산을 모두 처리
        console.log(`[MathVisualization] Graph 모드 - renderGraph 호출`);
        renderGraph(vizElement, config);
      }
    } catch (error) {
      console.error('그래프 렌더링 오류:', error);
    }
  }
}

// ==========================================================================
// Export
// ==========================================================================

export { MathVisualization };
