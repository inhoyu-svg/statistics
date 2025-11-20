/**
 * 레이어 팩토리
 * 차트 레이어 생성 로직
 */

import { Layer } from '../../animation/index.js';
import CoordinateSystem from './CoordinateSystem.js';

class LayerFactory {
  /**
   * 레이어 생성
   * @param {LayerManager} layerManager - 레이어 매니저
   * @param {Array} classes - 계급 데이터
   * @param {Array} relativeFreqs - 상대도수 배열
   * @param {Object} coords - 좌표 시스템
   * @param {Object} ellipsisInfo - 중략 정보
   */
  static createLayers(layerManager, classes, relativeFreqs, coords, ellipsisInfo) {
    layerManager.clearAll();

    // 히스토그램 그룹
    const histogramGroup = new Layer({
      id: 'histogram',
      name: '히스토그램',
      type: 'group',
      visible: true
    });

    // 다각형 그룹
    const polygonGroup = new Layer({
      id: 'polygon',
      name: '상대도수 다각형',
      type: 'group',
      visible: true
    });

    // 막대 레이어 생성
    relativeFreqs.forEach((relativeFreq, index) => {
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
          relativeFreq,
          frequency: classes[index].frequency,
          coords,
          ellipsisInfo
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
    relativeFreqs.forEach((relativeFreq, index) => {
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
          relativeFreq,
          coords
        }
      });

      pointsGroup.addChild(pointLayer);
    });

    // 선 레이어 생성
    let prevIndex = null;
    relativeFreqs.forEach((relativeFreq, index) => {
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
            fromFreq: relativeFreqs[prevIndex],
            toFreq: relativeFreq,
            coords
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
