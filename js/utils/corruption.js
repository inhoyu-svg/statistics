/**
 * Corruption (찢김) 효과 유틸리티
 * 차트와 테이블에서 "일부가 찢어져 보이지 않는" 효과 구현
 */

// ==========================================
// Noise 함수
// ==========================================

/**
 * 간단한 Pseudo-random Noise
 */
export function simpleNoise(x, seed = 0) {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

/**
 * Smoothstep 보간이 적용된 부드러운 Noise
 */
export function smoothNoise(x, seed = 0) {
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const t = x - x0;

  const n0 = simpleNoise(x0, seed);
  const n1 = simpleNoise(x1, seed);

  // Smoothstep 보간
  const st = t * t * (3 - 2 * t);
  return n0 + (n1 - n0) * st;
}

// ==========================================
// 찢김 경로 생성
// ==========================================

/**
 * 찢김 경로 생성
 * @param {number} startX - 시작 X
 * @param {number} startY - 시작 Y
 * @param {number} endX - 끝 X
 * @param {number} endY - 끝 Y
 * @param {number} complexity - 불규칙성 (0~1)
 * @param {number} seed - 랜덤 시드
 * @returns {Array} 경로 점 배열
 */
export function generateTearPath(startX, startY, endX, endY, complexity = 0.7, seed = 42) {
  const points = [];
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const segments = Math.max(15, Math.floor(distance / 4));

  // 수직선인지 수평선인지 판단
  const isVertical = Math.abs(dx) < Math.abs(dy);
  const amplitude = complexity * 8; // 최대 8px 변위 (inset보다 작게)

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const baseX = startX + dx * t;
    const baseY = startY + dy * t;

    // 여러 주파수의 노이즈 합성 (Fractal Noise)
    let noise = 0;
    noise += smoothNoise(t * 8, seed) * 1.0;
    noise += smoothNoise(t * 16, seed + 1) * 0.5;
    noise += smoothNoise(t * 32, seed + 2) * 0.25;
    noise = noise / 1.75; // 정규화

    const offset = noise * amplitude;

    if (isVertical) {
      points.push({ x: baseX + offset, y: baseY });
    } else {
      points.push({ x: baseX, y: baseY + offset });
    }
  }

  return points;
}

// ==========================================
// 시각적 질감 효과
// ==========================================

/**
 * 종이 섬유 효과 렌더링
 */
function renderFibers(ctx, allEdges, options = {}) {
  const {
    fiberCount = 20,
    fiberLength = 10,
    color = 'rgba(180, 150, 100, 0.5)'
  } = options;

  // 모든 가장자리 점 합치기
  const allPoints = [...allEdges.top, ...allEdges.right, ...allEdges.bottom, ...allEdges.left];

  ctx.save();
  // 랜덤 시드 고정을 위한 간단한 방법
  let randIndex = 0;
  const pseudoRandom = () => {
    randIndex++;
    return (Math.sin(randIndex * 12.9898) * 43758.5453) % 1;
  };

  allPoints.forEach((point, i) => {
    if (pseudoRandom() > 0.25) return; // 25%만 섬유 그리기

    const angle = (pseudoRandom() - 0.5) * Math.PI; // -90도 ~ 90도
    const length = fiberLength * (0.4 + pseudoRandom() * 0.6);

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(
      point.x + Math.cos(angle) * length,
      point.y + Math.sin(angle) * length
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.3 + pseudoRandom() * 0.7;
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * 가장자리 색상 테두리 렌더링 (오래된 종이 느낌)
 */
function renderEdgeColor(ctx, allEdges, options = {}) {
  const { color = 'rgba(160, 130, 80, 0.4)', width = 3 } = options;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 각 변을 따라 테두리 그리기
  ['top', 'right', 'bottom', 'left'].forEach(edge => {
    const points = allEdges[edge];
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();
  });
  ctx.restore();
}

// ==========================================
// 메인 렌더링 함수
// ==========================================

/**
 * 찢김 마스크 렌더링
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} region - 영역 {x, y, width, height}
 * @param {Object} style - 스타일 설정
 */
export function renderTearMask(ctx, region, style = {}) {
  const { x, y, width, height } = region;
  const {
    edgeComplexity = 0.7,
    tearColor = '#1a1a2e',
    shadowEnabled = false,
    transparent = true,
    seed = Math.random() * 100,
    // 시각적 질감 옵션
    fiberEnabled = false,
    fiberCount = 20,
    fiberColor = 'rgba(180, 150, 100, 0.5)',
    layerCount = 1,
    edgeColorEnabled = false,
    edgeColor = 'rgba(160, 130, 80, 0.4)'
  } = style;

  ctx.save();

  // 다중 레이어 렌더링
  for (let layer = layerCount - 1; layer >= 0; layer--) {
    const layerOffset = layer * 2;
    const layerSeed = seed + layer * 50;

    const layerRegion = {
      x: x - layerOffset,
      y: y - layerOffset,
      width: width + layerOffset * 2,
      height: height + layerOffset * 2
    };

    // 4변의 찢김 경로 생성
    const topEdge = generateTearPath(layerRegion.x, layerRegion.y, layerRegion.x + layerRegion.width, layerRegion.y, edgeComplexity, layerSeed);
    const rightEdge = generateTearPath(layerRegion.x + layerRegion.width, layerRegion.y, layerRegion.x + layerRegion.width, layerRegion.y + layerRegion.height, edgeComplexity, layerSeed + 10);
    const bottomEdge = generateTearPath(layerRegion.x + layerRegion.width, layerRegion.y + layerRegion.height, layerRegion.x, layerRegion.y + layerRegion.height, edgeComplexity, layerSeed + 20);
    const leftEdge = generateTearPath(layerRegion.x, layerRegion.y + layerRegion.height, layerRegion.x, layerRegion.y, edgeComplexity, layerSeed + 30);

    const allEdges = { top: topEdge, right: rightEdge, bottom: bottomEdge, left: leftEdge };

    // 경로 생성 함수
    function createTearPath() {
      ctx.beginPath();
      ctx.moveTo(topEdge[0].x, topEdge[0].y);
      topEdge.forEach(p => ctx.lineTo(p.x, p.y));
      rightEdge.forEach(p => ctx.lineTo(p.x, p.y));
      bottomEdge.forEach(p => ctx.lineTo(p.x, p.y));
      leftEdge.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
    }

    // 첫 번째 레이어만 실제 마스킹
    if (layer === 0) {
      if (transparent) {
        // destination-out으로 영역 지우기 (투명하게)
        ctx.globalCompositeOperation = 'destination-out';
        createTearPath();
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // 가장자리 색상 (오래된 종이)
        if (edgeColorEnabled) {
          renderEdgeColor(ctx, allEdges, { color: edgeColor, width: 2 });
        }

        // 종이 섬유 효과
        if (fiberEnabled) {
          renderFibers(ctx, allEdges, { fiberCount, color: fiberColor });
        }
      } else {
        // 기존 모드: 단색으로 덮기
        if (shadowEnabled) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
        }

        createTearPath();
        ctx.fillStyle = tearColor;
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 가장자리 색상 (오래된 종이)
        if (edgeColorEnabled) {
          renderEdgeColor(ctx, allEdges, { color: edgeColor, width: 2 });
        }

        // 종이 섬유 효과
        if (fiberEnabled) {
          renderFibers(ctx, allEdges, { fiberCount, color: fiberColor });
        }
      }
    } else {
      // 뒷 레이어: 그림자 효과만 (깊이감)
      ctx.globalAlpha = 0.15 * (layerCount - layer);
      createTearPath();
      ctx.strokeStyle = 'rgba(100, 80, 50, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  ctx.restore();
}

// ==========================================
// 차트용 셀 파싱/변환
// ==========================================

/**
 * 차트 셀 범위 파싱 (x-y 형식)
 * 형식: "0-2, 1-2:2-4, 3-0:3-4"
 * - "0-2" → 단일 셀 (x=0, y=2)
 * - "1-2:2-4" → 범위 (x=1~2, y=2~4)
 * @param {string} input - 셀 범위 문자열
 * @returns {Array} [{x1, y1, x2, y2}, ...]
 */
export function parseChartCells(input) {
  const ranges = [];
  const parts = input.split(',').map(s => s.trim()).filter(s => s);

  parts.forEach(part => {
    if (part.includes(':')) {
      // 범위: "1-2:2-4"
      const [start, end] = part.split(':').map(s => s.trim());
      const [x1, y1] = start.split('-').map(n => parseInt(n.trim()));
      const [x2, y2] = end.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        ranges.push({
          x1: Math.min(x1, x2),
          y1: Math.min(y1, y2),
          x2: Math.max(x1, x2),
          y2: Math.max(y1, y2)
        });
      }
    } else if (part.includes('-')) {
      // 단일 셀: "0-2"
      const [x, y] = part.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(x) && !isNaN(y)) {
        ranges.push({ x1: x, y1: y, x2: x, y2: y });
      }
    }
  });

  return ranges;
}

/**
 * 셀 좌표 → 픽셀 좌표 변환
 * @param {number} cellX - X축 셀 인덱스 (막대 인덱스)
 * @param {number} cellY - Y축 셀 인덱스 (0=하단, gridDivisions-1=상단)
 * @param {Object} chartInfo - 차트 정보
 * @returns {{x, y, width, height}} 픽셀 좌표 및 크기
 */
export function cellToPixel(cellX, cellY, chartInfo) {
  const { padding, barWidth, gap, chartHeight, gridDivisions, canvasHeight } = chartInfo;

  // X: 막대 시작 위치
  const pixelX = padding + (barWidth + gap) * cellX + gap / 2;

  // 셀 높이
  const cellHeight = chartHeight / gridDivisions;

  // Y: 아래에서부터 계산 (cellY=0이 하단)
  const pixelY = canvasHeight - padding - cellHeight * (cellY + 1);

  return {
    x: pixelX,
    y: pixelY,
    width: barWidth,
    height: cellHeight
  };
}

/**
 * 셀 범위 → 픽셀 영역 변환
 * @param {Object} range - {x1, y1, x2, y2}
 * @param {Object} chartInfo - 차트 정보
 * @returns {{x, y, width, height}} 픽셀 영역
 */
export function cellRangeToPixel(range, chartInfo) {
  const topLeft = cellToPixel(range.x1, range.y2, chartInfo);
  const bottomRight = cellToPixel(range.x2, range.y1, chartInfo);

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x + bottomRight.width - topLeft.x,
    height: bottomRight.y + bottomRight.height - topLeft.y
  };
}

// ==========================================
// 테이블용 셀 파싱
// ==========================================

/**
 * 테이블 셀 범위 파싱
 * 형식: "row:2, col:1, 3-1, 2-1:2-3"
 * @param {string} input - 셀 범위 문자열
 * @param {number} totalRows - 총 행 수
 * @param {number} totalCols - 총 열 수
 * @returns {Array} [{rowStart, rowEnd, colStart, colEnd}, ...]
 */
export function parseTableCells(input, totalRows, totalCols) {
  const ranges = [];
  const parts = input.split(',').map(s => s.trim()).filter(s => s);

  parts.forEach(part => {
    // row:N - 행 전체
    if (part.startsWith('row:')) {
      const row = parseInt(part.substring(4));
      if (!isNaN(row)) {
        ranges.push({ rowStart: row, rowEnd: row, colStart: 0, colEnd: totalCols - 1 });
      }
    }
    // col:N - 열 전체
    else if (part.startsWith('col:')) {
      const col = parseInt(part.substring(4));
      if (!isNaN(col)) {
        ranges.push({ rowStart: 0, rowEnd: totalRows - 1, colStart: col, colEnd: col });
      }
    }
    // R1-C1:R2-C2 - 범위
    else if (part.includes(':')) {
      const [start, end] = part.split(':');
      const [r1, c1] = start.split('-').map(n => parseInt(n));
      const [r2, c2] = end.split('-').map(n => parseInt(n));
      if (!isNaN(r1) && !isNaN(c1) && !isNaN(r2) && !isNaN(c2)) {
        ranges.push({
          rowStart: Math.min(r1, r2),
          rowEnd: Math.max(r1, r2),
          colStart: Math.min(c1, c2),
          colEnd: Math.max(c1, c2)
        });
      }
    }
    // R-C - 단일 셀
    else if (part.includes('-')) {
      const [row, col] = part.split('-').map(n => parseInt(n));
      if (!isNaN(row) && !isNaN(col)) {
        ranges.push({ rowStart: row, rowEnd: row, colStart: col, colEnd: col });
      }
    }
  });

  return ranges;
}

/**
 * 테이블 셀 범위 → 픽셀 영역 변환
 * @param {Object} range - {rowStart, rowEnd, colStart, colEnd}
 * @param {Object} tableInfo - 테이블 정보 {startX, startY, cellWidth, cellHeight}
 * @returns {{x, y, width, height}} 픽셀 영역
 */
export function tableCellRangeToPixel(range, tableInfo) {
  const { startX, startY, cellWidth, cellHeight, columnWidths, inset = 3 } = tableInfo;

  let x, width;

  if (columnWidths && Array.isArray(columnWidths)) {
    // columnWidths 배열 사용 (각 열의 실제 너비)
    x = startX + columnWidths.slice(0, range.colStart).reduce((sum, w) => sum + w, 0) + inset;
    width = columnWidths.slice(range.colStart, range.colEnd + 1).reduce((sum, w) => sum + w, 0) - inset * 2;
  } else {
    // 균등 너비 사용 (fallback)
    x = startX + range.colStart * cellWidth + inset;
    width = (range.colEnd - range.colStart + 1) * cellWidth - inset * 2;
  }

  const y = startY + range.rowStart * cellHeight + inset;
  const height = (range.rowEnd - range.rowStart + 1) * cellHeight - inset * 2;

  return { x, y, width, height };
}

export default {
  simpleNoise,
  smoothNoise,
  generateTearPath,
  renderTearMask,
  parseChartCells,
  cellToPixel,
  cellRangeToPixel,
  parseTableCells,
  tableCellRangeToPixel
};
