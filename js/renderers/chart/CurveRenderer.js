/**
 * 분포 곡선 렌더러
 * 히스토그램 위에 부드러운 분포 곡선을 렌더링
 */

import CONFIG from '../../config.js';
import CoordinateSystem from './CoordinateSystem.js';

class CurveRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   */
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * 분포 곡선 그리기
   * @param {Array} values - 도수/상대도수 배열
   * @param {Object} coords - 좌표 시스템 객체
   * @param {Object} ellipsisInfo - 중략 정보
   */
  draw(values, coords, ellipsisInfo) {
    const { toX, toY, xScale } = coords;

    // X축 Y좌표
    const xAxisY = toY(0);
    const halfBarWidth = (xScale * CONFIG.CHART_BAR_WIDTH_RATIO) / 2;

    // 화면에 표시되는 막대 정보 수집
    const bars = [];
    values.forEach((value, index) => {
      if (CoordinateSystem.shouldSkipEllipsis(index, ellipsisInfo)) return;

      const centerX = CoordinateSystem.getBarCenterX(index, toX, xScale);
      const topY = toY(value);

      bars.push({
        centerX,
        leftX: centerX - halfBarWidth,
        rightX: centerX + halfBarWidth,
        topY,
        value
      });
    });

    if (bars.length < 2) return;

    // 최고점 인덱스 찾기
    let peakIndex = 0;
    let maxValue = bars[0].value;
    bars.forEach((bar, i) => {
      if (bar.value > maxValue) {
        maxValue = bar.value;
        peakIndex = i;
      }
    });

    // 곡선이 지나갈 점들 생성
    const points = [];

    // 시작/끝 Y좌표 (X축 바로 위)
    const edgeY = xAxisY - 2;

    // 가상 제어점 (곡선이 수평하게 끝나도록)
    points.push({ x: bars[0].leftX - halfBarWidth * 3, y: edgeY });

    // 시작점: 첫 막대 왼쪽 바깥
    points.push({ x: bars[0].leftX - halfBarWidth, y: edgeY });

    // 왼쪽 막대들: 좌상단 모서리
    for (let i = 0; i < peakIndex; i++) {
      points.push({ x: bars[i].leftX, y: bars[i].topY });
    }

    // 최고점 막대: 좌상단 → 우상단
    points.push({ x: bars[peakIndex].leftX, y: bars[peakIndex].topY });
    points.push({ x: bars[peakIndex].rightX, y: bars[peakIndex].topY });

    // 오른쪽 막대들: 우상단 모서리
    for (let i = peakIndex + 1; i < bars.length; i++) {
      points.push({ x: bars[i].rightX, y: bars[i].topY });
    }

    // 끝점: 마지막 막대 오른쪽 바깥
    points.push({ x: bars[bars.length - 1].rightX + halfBarWidth, y: edgeY });

    // 가상 제어점 (곡선이 수평하게 끝나도록)
    points.push({ x: bars[bars.length - 1].rightX + halfBarWidth * 3, y: edgeY });

    // 클리핑 영역 설정 (Y축 첫 칸 중앙 위로만 표시)
    // Y축 0~첫번째눈금 칸의 중앙 아래는 잘라냄
    const yInterval = coords.gridDivisions ? (coords.adjustedMaxY / coords.gridDivisions) : 0.04;
    const clipBottomY = toY(yInterval / 2);  // 첫 Y칸 중앙

    // Catmull-Rom 스플라인으로 부드러운 곡선 그리기 (클리핑 적용)
    this.drawCatmullRomSplineWithClip(points, clipBottomY);
  }

  /**
   * 클리핑을 적용한 Catmull-Rom 스플라인 곡선 그리기
   * @param {Array} points - 점 배열 [{x, y}, ...] (첫/마지막은 가상 제어점)
   * @param {number} clipBottomY - 클리핑 하단 경계 (Y픽셀 좌표)
   */
  drawCatmullRomSplineWithClip(points, clipBottomY) {
    if (points.length < 4) return;

    const tension = CONFIG.CURVE_TENSION;

    // 클리핑 영역 설정 (clipBottomY 위쪽만 표시)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, 0, this.ctx.canvas.width, clipBottomY);
    this.ctx.clip();

    // 곡선 그리기
    this.ctx.beginPath();
    this.ctx.strokeStyle = CONFIG.CURVE_COLOR;
    this.ctx.lineWidth = CONFIG.CURVE_LINE_WIDTH;

    // 실제 시작점 (인덱스 1)으로 이동
    this.ctx.moveTo(points[1].x, points[1].y);

    // 인덱스 1부터 length-2까지만 그림 (첫/마지막 가상 제어점 제외)
    for (let i = 1; i < points.length - 2; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];

      // Catmull-Rom to Cubic Bezier 제어점 계산
      const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
      const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
      const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
      const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;

      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    this.ctx.stroke();

    // 클리핑 해제
    this.ctx.restore();
  }
}

export default CurveRenderer;
