/**
 * 레이어 팩토리
 * 차트 레이어 생성 로직
 */

import CONFIG from '../../config.js';
import Utils from '../../utils/utils.js';
import { Layer } from '../../animation/index.js';
import CoordinateSystem from './CoordinateSystem.js';
import CalloutRenderer from './CalloutRenderer.js';

class LayerFactory {
  /**
   * 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} classes - 계급 데이터
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {string} calloutTemplate - 말풍선 템플릿
   */
  static createLayers(layerManager, classes, values, coords, ellipsisInfo, dataType = 'relativeFrequency', calloutTemplate = null) {
    // clearAll() 제거: 기존 레이어 유지하면서 새 레이어 추가
    // layerManager.clearAll();

    // 레이어 ID 중복 방지를 위한 타임스탬프
    const timestamp = Date.now();

    // 데이터 타입 정보 가져오기
    const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
    const polygonName = dataTypeInfo ? `${dataTypeInfo.legendSuffix} 다각형` : '상대도수 다각형';

    // 히스토그램 그룹
    const histogramGroup = new Layer({
      id: `histogram-${timestamp}`,
      name: '히스토그램',
      type: 'group',
      visible: true
    });

    // 다각형 그룹 (동적 이름)
    const polygonGroup = new Layer({
      id: `polygon-${timestamp}`,
      name: polygonName,
      type: 'group',
      visible: true
    });

    // 막대 레이어 생성
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // 도수가 0인 막대는 레이어 생성하지 않음
      if (classes[index].frequency === 0) return;

      // 계급명 생성 (예: "140~145")
      const className = Utils.getClassName(classes[index]);

      const barLayer = new Layer({
        id: `bar-${timestamp}-${index}`,
        name: className,
        type: 'bar',
        visible: true,
        data: {
          index,
          relativeFreq: value, // 실제로는 value (상대도수 또는 도수)
          frequency: classes[index].frequency
        }
      });

      histogramGroup.addChild(barLayer);
    });

    // 점 그룹
    const pointsGroup = new Layer({
      id: `points-${timestamp}`,
      name: '점',
      type: 'group',
      visible: true
    });

    // 선 그룹
    const linesGroup = new Layer({
      id: `lines-${timestamp}`,
      name: '선',
      type: 'group',
      visible: true
    });

    // 파선 그룹 (독립 레이어)
    const dashedLinesGroup = new Layer({
      id: `dashed-lines-${timestamp}`,
      name: '수직 파선',
      type: 'group',
      visible: CONFIG.SHOW_DASHED_LINES
    });

    // 점 레이어 생성 (도수 0인 계급도 포함)
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // 계급명 생성
      const className = Utils.getClassName(classes[index]);

      const pointLayer = new Layer({
        id: `point-${timestamp}-${index}`,
        name: `점(${className})`,
        type: 'point',
        visible: true,
        data: {
          index,
          relativeFreq: value, // 실제로는 value (상대도수 또는 도수)
          colorPreset: CONFIG.POLYGON_COLOR_PRESET // 색상 프리셋 저장
        }
      });

      pointsGroup.addChild(pointLayer);
    });

    // 선 레이어 생성
    let prevIndex = null;
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      if (prevIndex !== null) {
        // 시작 계급명과 끝 계급명
        const fromClassName = Utils.getClassName(classes[prevIndex]);
        const toClassName = Utils.getClassName(classes[index]);

        const lineLayer = new Layer({
          id: `line-${timestamp}-${prevIndex}-${index}`,
          name: `선(${fromClassName}→${toClassName})`,
          type: 'line',
          visible: true,
          data: {
            fromIndex: prevIndex,
            toIndex: index,
            fromFreq: values[prevIndex],
            toFreq: value,
            colorPreset: CONFIG.POLYGON_COLOR_PRESET // 색상 프리셋 저장
          }
        });

        linesGroup.addChild(lineLayer);
      }

      prevIndex = index;
    });

    // 파선 레이어 생성 (점에서 Y축까지 수직 파선)
    // SHOW_DASHED_LINES가 true일 때만 생성
    if (CONFIG.SHOW_DASHED_LINES) {
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (value === 0) return; // 값이 0인 파선은 생성하지 않음

        const className = Utils.getClassName(classes[index]);

        const dashedLineLayer = new Layer({
          id: `dashed-line-${timestamp}-${index}`,
          name: `파선(${className})`,
          type: 'dashed-line',
          visible: true,
          data: {
            index,
            relativeFreq: value,
            coords,
            dataType,
            histogramPreset: CONFIG.HISTOGRAM_COLOR_PRESET
          }
        });

        dashedLinesGroup.addChild(dashedLineLayer);
      });
    }

    // 렌더링 순서: 선 → 점 (점이 가장 위에 표시되도록)
    polygonGroup.addChild(linesGroup);
    polygonGroup.addChild(pointsGroup);

    // 렌더링 순서: 히스토그램 → 파선 → 다각형 → 라벨(조건부) → 말풍선
    // CONFIG에 따라 조건부 추가
    if (CONFIG.SHOW_HISTOGRAM) {
      layerManager.addLayer(histogramGroup);
    }
    if (CONFIG.SHOW_DASHED_LINES) {
      layerManager.addLayer(dashedLinesGroup);
    }
    if (CONFIG.SHOW_POLYGON) {
      layerManager.addLayer(polygonGroup);
    }

    // 막대 라벨 그룹 (SHOW_BAR_LABELS가 true일 때만 생성)
    if (CONFIG.SHOW_BAR_LABELS) {
      const labelsGroup = new Layer({
        id: `bar-labels-${timestamp}`,
        name: '막대 라벨',
        type: 'group',
        visible: true
      });

      // 막대 라벨 레이어 생성
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (classes[index].frequency === 0) return;

        const className = Utils.getClassName(classes[index]);

        const labelLayer = new Layer({
          id: `bar-label-${timestamp}-${index}`,
          name: `라벨(${className})`,
          type: 'bar-label',
          visible: true,
          data: {
            index,
            relativeFreq: value,
            frequency: classes[index].frequency,
            dataType
          }
        });

        labelsGroup.addChild(labelLayer);
      });

      layerManager.addLayer(labelsGroup);
    }

    // 막대 커스텀 라벨 그룹 (SHOW_BAR_CUSTOM_LABELS가 true이고 라벨이 있을 때만)
    if (CONFIG.SHOW_BAR_CUSTOM_LABELS && Object.keys(CONFIG.BAR_CUSTOM_LABELS).length > 0) {
      const customLabelsGroup = new Layer({
        id: `bar-custom-labels-${timestamp}`,
        name: '막대 커스텀 라벨',
        type: 'group',
        visible: true
      });

      // 실제 표시되는 막대 기준 인덱스로 라벨 적용
      let visibleBarIndex = 0;
      values.forEach((value, index) => {
        // 막대 생성 조건과 동일하게 체크
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (classes[index].frequency === 0) return;

        // 표시되는 막대 인덱스 기준으로 라벨 조회
        const customLabel = CONFIG.BAR_CUSTOM_LABELS[visibleBarIndex];
        visibleBarIndex++;

        if (!customLabel) return;  // 해당 인덱스에 라벨 없으면 스킵

        const className = Utils.getClassName(classes[index]);

        const customLabelLayer = new Layer({
          id: `bar-custom-label-${timestamp}-${index}`,
          name: `커스텀라벨(${className}): ${customLabel}`,
          type: 'bar-custom-label',
          visible: true,
          data: { index, relativeFreq: value, customLabel, dataType, coords }
        });

        customLabelsGroup.addChild(customLabelLayer);
      });

      layerManager.addLayer(customLabelsGroup);
    }

    // 합동 삼각형 레이어 생성 (SHOW_CONGRUENT_TRIANGLES가 true일 때만)
    if (CONFIG.SHOW_CONGRUENT_TRIANGLES && CONFIG.SHOW_POLYGON) {
      this._createCongruentTriangleLayers(layerManager, values, coords, timestamp);
    }

    // 말풍선 레이어 생성 (템플릿이 제공된 경우)
    if (calloutTemplate) {
      const calloutLayer = this._createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, calloutTemplate, timestamp, layerManager);
      if (calloutLayer) {
        layerManager.addLayer(calloutLayer);
      }
    }
  }

  /**
   * 말풍선 레이어 생성
   * @param {Array} classes - 계급 데이터
   * @param {Array} values - 값 배열
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입
   * @param {string} template - 말풍선 템플릿
   * @param {number} timestamp - 타임스탬프 (레이어 ID 중복 방지)
   * @param {LayerManager} layerManager - 레이어 매니저 (기존 말풍선 개수 확인용)
   * @returns {Layer|null} 말풍선 레이어
   */
  static _createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, template, timestamp, layerManager) {
    // 최상단 포인트 찾기 (y값이 가장 큰 = 상대도수/도수가 가장 큰)
    let maxValue = -Infinity;
    let maxIndex = -1;

    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
      if (value > maxValue) {
        maxValue = value;
        maxIndex = index;
      }
    });

    if (maxIndex === -1) return null;

    // 템플릿 치환
    const text = CalloutRenderer.formatTemplate(template, classes[maxIndex], dataType);

    // 말풍선 너비 동적 계산 (텍스트 길이 기반)
    const calloutWidth = CalloutRenderer.calculateCalloutWidth(text);

    // 기존 말풍선 개수 확인 (세로 배치용)
    const existingCallouts = layerManager.getAllLayers().filter(({ layer }) => layer.type === 'callout');
    const calloutCount = existingCallouts.length;
    const calloutSpacing = 10; // 말풍선 간격

    // 말풍선 위치 (차트 왼쪽 상단, 기존 말풍선 아래에 배치)
    const calloutX = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_X;
    const calloutY = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_Y + (calloutCount * (CONFIG.CALLOUT_HEIGHT + calloutSpacing));

    // 포인트 좌표 계산 (애니메이션 참조용)
    const { toX, toY, xScale } = coords;
    const pointX = toX(maxIndex) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
    const pointY = toY(maxValue);

    const calloutLayer = new Layer({
      id: `callout-${timestamp}`,
      name: '말풍선',
      type: 'callout',
      visible: true,
      data: {
        x: calloutX,
        y: calloutY,
        width: calloutWidth,
        height: CONFIG.CALLOUT_HEIGHT,
        text,
        opacity: 0, // 초기 투명도 (애니메이션용)
        pointX,
        pointY,
        classIndex: maxIndex,
        polygonPreset: CONFIG.POLYGON_COLOR_PRESET // 다각형 프리셋 추가
      }
    });

    return calloutLayer;
  }

  /**
   * 합동 삼각형 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} values - 값 배열
   * @param {Object} coords - 좌표 시스템
   * @param {number} timestamp - 타임스탬프
   */
  static _createCongruentTriangleLayers(layerManager, values, coords, timestamp) {
    const i = CONFIG.CONGRUENT_TRIANGLE_INDEX;

    // 유효 범위 체크
    if (i < 0 || i >= values.length - 1) return;

    const { toX, toY, xScale } = coords;

    // 좌표 계산
    const p1x = CoordinateSystem.getBarCenterX(i, toX, xScale);
    const p1y = toY(values[i]);
    const p2x = CoordinateSystem.getBarCenterX(i + 1, toX, xScale);
    const p2y = toY(values[i + 1]);

    // 막대 경계 X (막대 i의 우측 = 막대 i+1의 좌측)
    const boundaryX = toX(i + 1);

    // 선과 막대 경계의 교점 Y 계산 (선형 보간)
    const t = (boundaryX - p1x) / (p2x - p1x);
    const intersectY = p1y + t * (p2y - p1y);

    // 선 방향에 따라 색상 결정 (위=파랑, 아래=빨강)
    const isLineGoingUp = p1y > p2y; // canvas Y좌표: 클수록 아래

    // 위쪽 삼각형 색상 (파란색 = 히스토그램)
    const upperColors = {
      fill: { start: CONFIG.getColor('--chart-bar-color'), end: CONFIG.getColor('--chart-bar-color-end') },
      stroke: { start: CONFIG.getColor('--chart-bar-stroke-start'), end: CONFIG.getColor('--chart-bar-stroke-end') },
      fillAlpha: CONFIG.CHART_BAR_ALPHA
    };

    // 아래쪽 삼각형 색상 (빨간색)
    const lowerColors = {
      fill: { start: CONFIG.TRIANGLE_A_FILL_START, end: CONFIG.TRIANGLE_A_FILL_END },
      stroke: { start: CONFIG.TRIANGLE_A_STROKE_START, end: CONFIG.TRIANGLE_A_STROKE_END }
    };

    // Triangle A: 선 상승 시 아래(빨강), 선 하강 시 위(파랑)
    const colorsA = isLineGoingUp ? lowerColors : upperColors;
    // Triangle B: 선 상승 시 위(파랑), 선 하강 시 아래(빨강)
    const colorsB = isLineGoingUp ? upperColors : lowerColors;

    // 삼각형 그룹
    const trianglesGroup = new Layer({
      id: `triangles-${timestamp}`,
      name: '합동 삼각형',
      type: 'group',
      visible: true
    });

    // 삼각형 A (막대 i 우측)
    const triangleA = new Layer({
      id: `triangle-a-${timestamp}`,
      name: '삼각형 A',
      type: 'triangle',
      visible: true,
      data: {
        points: [
          { x: p1x, y: p1y },           // 막대 i 중앙 상단 (다각형 점)
          { x: boundaryX, y: p1y },     // 막대 i 우측 상단 (막대 모서리)
          { x: boundaryX, y: intersectY } // 교점
        ],
        fillColors: colorsA.fill,
        strokeColors: colorsA.stroke,
        fillAlpha: colorsA.fillAlpha
      }
    });

    // 삼각형 B (막대 i+1 좌측)
    const triangleB = new Layer({
      id: `triangle-b-${timestamp}`,
      name: '삼각형 B',
      type: 'triangle',
      visible: true,
      data: {
        points: [
          { x: boundaryX, y: p2y },     // 막대 i+1 좌측 상단 (막대 모서리)
          { x: p2x, y: p2y },           // 막대 i+1 중앙 상단 (다각형 점)
          { x: boundaryX, y: intersectY } // 교점
        ],
        fillColors: colorsB.fill,
        strokeColors: colorsB.stroke,
        fillAlpha: colorsB.fillAlpha
      }
    });

    trianglesGroup.addChild(triangleA);
    trianglesGroup.addChild(triangleB);

    // 라벨 오프셋 (라벨과 직각 모서리 사이 거리)
    const labelOffset = 30;

    // 라벨 위치 계산 (선 방향에 따라 결정)
    let labelPosBlue, labelPosRed;
    let rightAngleBlue, rightAngleRed;

    if (isLineGoingUp) {
      // 선 상승 시:
      // 파란(B) = S₁: 직각(boundaryX, p2y) 좌측 상단
      // 빨간(A) = S₂: 직각(boundaryX, p1y) 우측 하단
      rightAngleBlue = { x: boundaryX, y: p2y };
      rightAngleRed = { x: boundaryX, y: p1y };
      labelPosBlue = { x: boundaryX - labelOffset, y: p2y - labelOffset };
      labelPosRed = { x: boundaryX + labelOffset, y: p1y + labelOffset };
    } else {
      // 선 하강 시:
      // 파란(A) = S₁: 직각(boundaryX, p1y) 우측 상단
      // 빨간(B) = S₂: 직각(boundaryX, p2y) 좌측 하단
      rightAngleBlue = { x: boundaryX, y: p1y };
      rightAngleRed = { x: boundaryX, y: p2y };
      labelPosBlue = { x: boundaryX + labelOffset, y: p1y - labelOffset };
      labelPosRed = { x: boundaryX - labelOffset, y: p2y + labelOffset };
    }

    // S₁ 라벨 (파란 삼각형)
    const labelS1 = new Layer({
      id: `triangle-label-s1-${timestamp}`,
      name: '라벨 S₁',
      type: 'triangle-label',
      visible: true,
      data: {
        text: 'S',
        subscript: '1',
        x: labelPosBlue.x,
        y: labelPosBlue.y,
        color: '#008AFF'
      }
    });

    // S₂ 라벨 (빨간 삼각형)
    const labelS2 = new Layer({
      id: `triangle-label-s2-${timestamp}`,
      name: '라벨 S₂',
      type: 'triangle-label',
      visible: true,
      data: {
        text: 'S',
        subscript: '2',
        x: labelPosRed.x,
        y: labelPosRed.y,
        color: '#E749AF'
      }
    });

    // S₁ 점선 (라벨 → 직각 모서리)
    const lineS1 = new Layer({
      id: `triangle-label-line-s1-${timestamp}`,
      name: '점선 S₁',
      type: 'triangle-label-line',
      visible: true,
      data: {
        fromX: labelPosBlue.x,
        fromY: labelPosBlue.y,
        toX: rightAngleBlue.x,
        toY: rightAngleBlue.y,
        color: '#008AFF'
      }
    });

    // S₂ 점선 (라벨 → 직각 모서리)
    const lineS2 = new Layer({
      id: `triangle-label-line-s2-${timestamp}`,
      name: '점선 S₂',
      type: 'triangle-label-line',
      visible: true,
      data: {
        fromX: labelPosRed.x,
        fromY: labelPosRed.y,
        toX: rightAngleRed.x,
        toY: rightAngleRed.y,
        color: '#E749AF'
      }
    });

    trianglesGroup.addChild(lineS1);
    trianglesGroup.addChild(lineS2);
    trianglesGroup.addChild(labelS1);
    trianglesGroup.addChild(labelS2);

    layerManager.addLayer(trianglesGroup);
  }
}

export default LayerFactory;
