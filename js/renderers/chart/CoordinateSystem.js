/**
 * 차트 좌표 시스템
 * Canvas 좌표 변환 함수 생성
 */

import CONFIG from '../../config.js';

class CoordinateSystem {
  /**
   * 좌표 시스템 생성
   * @param {HTMLCanvasElement} canvas - Canvas 요소
   * @param {number} padding - 차트 패딩
   * @param {number} classCount - 계급 개수
   * @param {Object} ellipsisInfo - 중략 정보
   * @param {number} maxY - Y축 최댓값
   * @param {string} dataType - 데이터 타입
   * @param {number} customYInterval - 커스텀 Y축 간격 (없으면 자동 계산)
   * @returns {Object} 좌표 변환 함수와 스케일 객체
   */
  static create(canvas, padding, classCount, ellipsisInfo, maxY, dataType = 'relativeFrequency', customYInterval = null) {
    const chartW = canvas.width - padding * 2;
    const chartH = canvas.height - padding * 2;

    let xScale, toX;

    if (ellipsisInfo && ellipsisInfo.show) {
      // 중략 표시: 빈 구간을 1칸으로 압축
      const firstDataIdx = ellipsisInfo.firstDataIndex;
      const visibleClasses = 1 + (classCount - firstDataIdx);
      xScale = chartW / visibleClasses;

      toX = (index) => {
        if (index === 0) return padding;
        if (index < firstDataIdx) return padding + xScale;
        return padding + xScale + (index - firstDataIdx) * xScale;
      };
    } else {
      // 기본 방식: 모든 계급을 동일 간격으로
      xScale = chartW / classCount;
      toX = (index) => padding + index * xScale;
    }

    // 그리드 설정 계산
    let adjustedMaxY, gridDivisions;

    // 양 옆 여유 칸 여부에 따라 Y축 여유 칸 결정
    // 첫 번째 계급이 비어있으면 (firstDataIndex > 0) 양 옆에 여유 칸이 있음 → Y축 2칸 여유
    // 첫 번째 계급부터 데이터가 있으면 양 옆 여유 칸 없음 → Y축 1칸 여유
    const hasMargin = ellipsisInfo && ellipsisInfo.firstDataIndex > 0;
    const yMarginMultiplier = hasMargin ? 2 : 1;

    if (customYInterval && customYInterval > 0) {
      // 커스텀 간격 사용
      const targetMax = (dataType === 'frequency')
        ? Math.ceil(maxY) + (customYInterval * yMarginMultiplier)
        : maxY;
      gridDivisions = Math.ceil(targetMax / customYInterval);
      adjustedMaxY = gridDivisions * customYInterval;
    } else {
      // 자동 계산 (스마트 격자)
      const gridConfig = CONFIG.calculateGridDivisions(maxY, dataType, hasMargin);
      adjustedMaxY = gridConfig.maxY;
      gridDivisions = gridConfig.divisions;
    }

    const yScale = chartH / adjustedMaxY;
    const toY = (value) => {
      return canvas.height - padding - value * yScale;
    };

    return { toX, toY, xScale, chartH, gridDivisions, adjustedMaxY };
  }

  /**
   * 막대의 중앙 X 좌표 계산
   * @param {number} index - 계급 인덱스
   * @param {Function} toX - X 좌표 변환 함수
   * @param {number} xScale - X축 스케일
   * @returns {number} 막대 중앙의 X 좌표
   */
  static getBarCenterX(index, toX, xScale) {
    return toX(index) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET;
  }

  /**
   * 중략 구간을 건너뛸지 판단
   * @param {number} index - 현재 인덱스
   * @param {Object} ellipsisInfo - 중략 정보
   * @returns {boolean} 건너뛸지 여부
   */
  static shouldSkipEllipsis(index, ellipsisInfo) {
    if (!ellipsisInfo || !ellipsisInfo.show) return false;
    const firstDataIdx = ellipsisInfo.firstDataIndex;
    return index > 0 && index < firstDataIdx;
  }
}

export default CoordinateSystem;
