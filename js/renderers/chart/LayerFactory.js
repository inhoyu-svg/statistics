/**
 * 레이어 팩토리
 * 차트 레이어 생성 로직
 */

import CONFIG from '../../config.js';
import { Layer } from '../../animation/index.js';
import CoordinateSystem from './CoordinateSystem.js';

class LayerFactory {
  /**
   * 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} classes - 계급 데이터
   * @param {Array} values - 값 배열 (상대도수 또는 도수)
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {string} dataType - 데이터 타입 ('relativeFrequency', 'frequency', 등)
   */
  static createLayers(layerManager, classes, values, coords, ellipsisInfo, dataType = 'relativeFrequency') {
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

    // 막대 레이어 생성
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // 도수가 0인 막대는 레이어 생성하지 않음
      if (classes[index].frequency === 0) return;

      // 계급명 생성 (예: "140~145")
      const className = `${classes[index].min}~${classes[index].max}`;

      const barLayer = new Layer({
        id: `bar-${index}`,
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
      id: 'points',
      name: '점',
      type: 'group',
      visible: true
    });

    // 선 그룹
    const linesGroup = new Layer({
      id: 'lines',
      name: '선',
      type: 'group',
      visible: true
    });

    // 점 레이어 생성
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      // 계급명 생성
      const className = `${classes[index].min}~${classes[index].max}`;

      const pointLayer = new Layer({
        id: `point-${index}`,
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
        const fromClassName = `${classes[prevIndex].min}~${classes[prevIndex].max}`;
        const toClassName = `${classes[index].min}~${classes[index].max}`;

        const lineLayer = new Layer({
          id: `line-${prevIndex}-${index}`,
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

    polygonGroup.addChild(pointsGroup);
    polygonGroup.addChild(linesGroup);

    layerManager.addLayer(histogramGroup);
    layerManager.addLayer(polygonGroup);
  }
}

export default LayerFactory;
