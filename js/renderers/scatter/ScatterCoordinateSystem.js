/**
 * 산점도 좌표계
 * 정사각형 그리드 기반 연속값 좌표 변환
 */

import CONFIG from '../../config.js';

class ScatterCoordinateSystem {
  /**
   * 산점도 좌표계 생성
   * @param {Object} params - 좌표계 파라미터
   * @param {number} params.canvasWidth - 캔버스 너비
   * @param {number} params.canvasHeight - 캔버스 높이
   * @param {number} params.padding - 패딩
   * @param {number} params.xMin - X축 최솟값
   * @param {number} params.xMax - X축 최댓값
   * @param {number} params.yMin - Y축 최솟값
   * @param {number} params.yMax - Y축 최댓값
   * @param {number} params.xInterval - X축 간격
   * @param {number} params.yInterval - Y축 간격
   * @returns {Object} 좌표계 객체
   */
  static create(params) {
    const {
      canvasWidth,
      canvasHeight,
      padding,
      xMin,
      xMax,
      yMin,
      yMax,
      xInterval,
      yInterval
    } = params;

    // GCD 계산으로 정사각형 셀 크기 결정
    const gcd = CONFIG.gcd(xInterval, yInterval);

    // 각 축별 셀 개수 (GCD 기준)
    const xCellsPerInterval = xInterval / gcd;
    const yCellsPerInterval = yInterval / gcd;

    // 전체 셀 개수
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    const totalXCells = xRange / gcd;
    const totalYCells = yRange / gcd;

    // 그리기 영역 크기
    const drawWidth = canvasWidth - padding * 2;
    const drawHeight = canvasHeight - padding * 2;

    // 정사각형 셀 크기 (작은 쪽에 맞춤)
    const cellSize = Math.min(drawWidth / totalXCells, drawHeight / totalYCells);

    // 실제 그리기 영역 (정사각형 그리드 기준)
    const actualWidth = cellSize * totalXCells;
    const actualHeight = cellSize * totalYCells;

    // 중앙 정렬을 위한 오프셋
    const offsetX = padding + (drawWidth - actualWidth) / 2;
    const offsetY = padding + (drawHeight - actualHeight) / 2;

    /**
     * 데이터 X값 → 캔버스 X좌표
     * @param {number} value - 데이터 값
     * @returns {number} 캔버스 X좌표
     */
    const toX = (value) => {
      const cells = (value - xMin) / gcd;
      return offsetX + cells * cellSize;
    };

    /**
     * 데이터 Y값 → 캔버스 Y좌표 (Y축은 위로 증가)
     * @param {number} value - 데이터 값
     * @returns {number} 캔버스 Y좌표
     */
    const toY = (value) => {
      const cells = (value - yMin) / gcd;
      return offsetY + actualHeight - cells * cellSize;
    };

    return {
      // 좌표 변환 함수
      toX,
      toY,

      // 그리드 정보
      gcd,
      cellSize,
      xCellsPerInterval,
      yCellsPerInterval,
      totalXCells,
      totalYCells,

      // 축 범위
      xMin,
      xMax,
      yMin,
      yMax,
      xInterval,
      yInterval,

      // 그리기 영역
      offsetX,
      offsetY,
      actualWidth,
      actualHeight,

      // 캔버스 정보
      canvasWidth,
      canvasHeight,
      padding
    };
  }

  /**
   * 데이터 포인트에서 좌표계 파라미터 추출
   * @param {Array<Array<number>>} dataPoints - [[x1, y1], [x2, y2], ...]
   * @returns {Object} { xMin, xMax, yMin, yMax, xInterval, yInterval }
   */
  static extractParams(dataPoints) {
    if (!dataPoints || dataPoints.length < 2) {
      throw new Error('최소 2개 이상의 데이터 포인트가 필요합니다.');
    }

    // 첫 두 포인트에서 간격 계산
    const xInterval = Math.abs(dataPoints[1][0] - dataPoints[0][0]);
    const yInterval = Math.abs(dataPoints[1][1] - dataPoints[0][1]);

    if (xInterval === 0 || yInterval === 0) {
      throw new Error('X 또는 Y 간격이 0입니다.');
    }

    // 모든 포인트에서 min/max 추출
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;

    dataPoints.forEach(([x, y]) => {
      xMin = Math.min(xMin, x);
      xMax = Math.max(xMax, x);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
    });

    return {
      xMin,
      xMax,
      yMin,
      yMax,
      xInterval,
      yInterval
    };
  }

  /**
   * 그리드 라인 정보 생성 (라벨 표시 여부 포함)
   * @param {Object} coords - 좌표계 객체
   * @returns {Object} { xLines: [], yLines: [] }
   */
  static getGridLines(coords) {
    const { xMin, xMax, yMin, yMax, xInterval, yInterval, gcd } = coords;

    const xLines = [];
    const yLines = [];

    // X축 그리드 라인 (GCD 간격으로)
    for (let x = xMin; x <= xMax; x += gcd) {
      xLines.push({
        value: x,
        showLabel: (x - xMin) % xInterval === 0  // 원래 간격에만 라벨 표시
      });
    }

    // Y축 그리드 라인 (GCD 간격으로)
    for (let y = yMin; y <= yMax; y += gcd) {
      yLines.push({
        value: y,
        showLabel: (y - yMin) % yInterval === 0  // 원래 간격에만 라벨 표시
      });
    }

    return { xLines, yLines };
  }
}

export default ScatterCoordinateSystem;
