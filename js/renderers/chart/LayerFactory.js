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
   * 레이어 생성 (다중 데이터셋 지원)
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} datasetResults - 데이터셋 결과 배열 (각 객체: {id, name, preset, classes, frequencies, relativeFreqs})
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   * @param {string} calloutTemplate - 말풍선 템플릿
   */
  static createLayers(layerManager, datasetResults, coords, ellipsisInfo, dataType = 'relativeFrequency', calloutTemplate = null) {
    layerManager.clearAll();

    // 데이터 타입 정보 가져오기
    const dataTypeInfo = CONFIG.CHART_DATA_TYPES.find(t => t.id === dataType);
    const polygonName = dataTypeInfo ? `${dataTypeInfo.legendSuffix} 다각형` : '상대도수 다각형';

    // 히스토그램 그룹
    const histogramGroup = new Layer({
      id: 'histogram',
      name: '히스토그램',
      type: 'group',
      visible: true
    });

    // 다각형 그룹 (동적 이름)
    const polygonGroup = new Layer({
      id: 'polygon',
      name: polygonName,
      type: 'group',
      visible: true
    });

    // 파선 그룹 (독립 레이어)
    const dashedLinesGroup = new Layer({
      id: 'dashed-lines',
      name: '수직 파선',
      type: 'group',
      visible: CONFIG.SHOW_DASHED_LINES
    });

    // 막대 라벨 그룹 (SHOW_BAR_LABELS가 true일 때만 생성)
    const labelsGroup = CONFIG.SHOW_BAR_LABELS ? new Layer({
      id: 'bar-labels',
      name: '막대 라벨',
      type: 'group',
      visible: true
    }) : null;

    // 말풍선 그룹
    const calloutsGroup = new Layer({
      id: 'callouts',
      name: '말풍선',
      type: 'group',
      visible: true
    });

    // 각 데이터셋에 대해 레이어 생성
    datasetResults.forEach((dataset, datasetIndex) => {
      const { id, name, preset, classes, frequencies, relativeFreqs } = dataset;
      const values = dataType === 'frequency' ? frequencies : relativeFreqs;

      // 데이터셋별 히스토그램 서브그룹
      const datasetHistogramGroup = new Layer({
        id: `histogram-${id}`,
        name: `${name} 막대`,
        type: 'group',
        visible: true
      });

      // 막대 레이어 생성
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
        if (frequencies[index] === 0) return;

        const className = Utils.getClassName(classes[index]);

        const barLayer = new Layer({
          id: `bar-${id}-${index}`,
          name: `${name}-${className}`,
          type: 'bar',
          visible: true,
          data: {
            index,
            relativeFreq: value,
            frequency: frequencies[index],
            coords,
            dataType,
            preset
          }
        });

        datasetHistogramGroup.addChild(barLayer);
      });

      histogramGroup.addChild(datasetHistogramGroup);

      // 데이터셋별 다각형 서브그룹
      const datasetPolygonGroup = new Layer({
        id: `polygon-${id}`,
        name: `${name} 다각형`,
        type: 'group',
        visible: true
      });

      // 선 그룹
      const linesGroup = new Layer({
        id: `lines-${id}`,
        name: `${name} 선`,
        type: 'group',
        visible: true
      });

      // 점 그룹
      const pointsGroup = new Layer({
        id: `points-${id}`,
        name: `${name} 점`,
        type: 'group',
        visible: true
      });

      // 점 레이어 생성
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

        const className = Utils.getClassName(classes[index]);

        const pointLayer = new Layer({
          id: `point-${id}-${index}`,
          name: `${name}-점(${className})`,
          type: 'point',
          visible: true,
          data: {
            index,
            relativeFreq: value,
            coords,
            preset
          }
        });

        pointsGroup.addChild(pointLayer);
      });

      // 선 레이어 생성
      let prevIndex = null;
      values.forEach((value, index) => {
        if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

        if (prevIndex !== null) {
          const fromClassName = Utils.getClassName(classes[prevIndex]);
          const toClassName = Utils.getClassName(classes[index]);

          const lineLayer = new Layer({
            id: `line-${id}-${prevIndex}-${index}`,
            name: `${name}-선(${fromClassName}→${toClassName})`,
            type: 'line',
            visible: true,
            data: {
              fromIndex: prevIndex,
              toIndex: index,
              fromFreq: values[prevIndex],
              toFreq: value,
              coords,
              preset
            }
          });

          linesGroup.addChild(lineLayer);
        }

        prevIndex = index;
      });

      // 렌더링 순서: 선 → 점
      datasetPolygonGroup.addChild(linesGroup);
      datasetPolygonGroup.addChild(pointsGroup);
      polygonGroup.addChild(datasetPolygonGroup);

      // 파선 레이어 생성 (첫 번째 데이터셋만 - 공유)
      if (datasetIndex === 0) {
        values.forEach((value, index) => {
          if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
          if (value === 0) return;

          const className = Utils.getClassName(classes[index]);

          const dashedLineLayer = new Layer({
            id: `dashed-line-${index}`,
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
      }

      // 막대 라벨 레이어 생성
      if (labelsGroup) {
        values.forEach((value, index) => {
          if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;
          if (frequencies[index] === 0) return;

          const className = Utils.getClassName(classes[index]);

          const labelLayer = new Layer({
            id: `bar-label-${id}-${index}`,
            name: `${name}-라벨(${className})`,
            type: 'bar-label',
            visible: true,
            data: {
              index,
              relativeFreq: value,
              frequency: frequencies[index],
              coords,
              dataType,
              preset
            }
          });

          labelsGroup.addChild(labelLayer);
        });
      }

      // 말풍선 레이어 생성
      if (calloutTemplate) {
        const calloutLayer = this._createCalloutLayer(
          classes,
          values,
          coords,
          ellipsisInfo,
          dataType,
          calloutTemplate,
          preset,
          datasetIndex,
          name
        );
        if (calloutLayer) {
          calloutsGroup.addChild(calloutLayer);
        }
      }
    });

    // 렌더링 순서: 히스토그램 → 파선 → 다각형 → 라벨(조건부) → 말풍선
    if (CONFIG.SHOW_HISTOGRAM) {
      layerManager.addLayer(histogramGroup);
    }
    layerManager.addLayer(dashedLinesGroup);
    if (CONFIG.SHOW_POLYGON) {
      layerManager.addLayer(polygonGroup);
    }
    if (labelsGroup) {
      layerManager.addLayer(labelsGroup);
    }
    if (calloutTemplate) {
      layerManager.addLayer(calloutsGroup);
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
   * @param {string} preset - 색상 프리셋
   * @param {number} datasetIndex - 데이터셋 인덱스 (Y 위치 오프셋 계산용)
   * @param {string} datasetName - 데이터셋 이름
   * @returns {Layer|null} 말풍선 레이어
   */
  static _createCalloutLayer(classes, values, coords, ellipsisInfo, dataType, template, preset = 'default', datasetIndex = 0, datasetName = '') {
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

    // 말풍선 위치 (차트 왼쪽 상단 고정, 데이터셋마다 Y 오프셋 추가)
    const calloutX = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_X;
    const calloutY = CONFIG.CHART_PADDING + CONFIG.CALLOUT_POSITION_Y + (datasetIndex * CONFIG.DATASET_CALLOUT_Y_OFFSET);

    // 포인트 좌표 계산 (애니메이션 참조용)
    const { toX, toY, xScale } = coords;
    const pointX = toX(maxIndex) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
    const pointY = toY(maxValue);

    const calloutLayer = new Layer({
      id: `callout-${datasetIndex}`,
      name: `${datasetName} 말풍선`,
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
        polygonPreset: preset // 데이터셋 프리셋 사용
      }
    });

    return calloutLayer;
  }
}

export default LayerFactory;
