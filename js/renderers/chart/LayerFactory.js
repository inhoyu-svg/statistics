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
          relativeFreq: value // 실제로는 value (상대도수 또는 도수)
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
            toFreq: value
          }
        });

        linesGroup.addChild(lineLayer);
      }

      prevIndex = index;
    });

    // 파선 레이어 생성 (점에서 Y축까지 수직 파선)
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
      if (value === 0) return; // 값이 0인 파선은 생성하지 않음

      const className = Utils.getClassName(classes[index]);

      const dashedLineLayer = new Layer({
        id: `dashed-line-${timestamp}-${index}`,
        name: `파선(${className})`,
        type: 'dashed-line',
        visible: CONFIG.SHOW_DASHED_LINES,
        data: {
          index,
          relativeFreq: value,
          coords
        }
      });

      dashedLinesGroup.addChild(dashedLineLayer);
    });

    // 렌더링 순서: 선 → 점 (점이 가장 위에 표시되도록)
    polygonGroup.addChild(linesGroup);
    polygonGroup.addChild(pointsGroup);

    // 렌더링 순서: 히스토그램 → 파선 → 다각형 → 라벨(조건부) → 말풍선
    // CONFIG에 따라 조건부 추가
    if (CONFIG.SHOW_HISTOGRAM) {
      layerManager.addLayer(histogramGroup);
    }
    layerManager.addLayer(dashedLinesGroup);
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

    // 말풍선 레이어 생성 (템플릿이 제공된 경우)
    if (calloutTemplate) {
      const calloutLayer = this._createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, calloutTemplate, timestamp);
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
   * @returns {Layer|null} 말풍선 레이어
   */
  static _createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, template, timestamp) {
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

    // 말풍선 위치 (차트 왼쪽 상단 고정)
    const calloutX = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_X;
    const calloutY = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_Y;

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
}

export default LayerFactory;
