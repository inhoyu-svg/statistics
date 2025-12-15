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
export function renderFibers(ctx, allEdges, options = {}) {
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
 * @param {Object} skipEdges - 생략할 면 {top, right, bottom, left}
 */
export function renderTearMask(ctx, region, style = {}, skipEdges = {}) {
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

    // 4변의 찢김 경로 생성 (skipEdges가 true인 면은 직선)
    const topEdge = skipEdges.top
      ? [{ x: layerRegion.x, y: layerRegion.y }, { x: layerRegion.x + layerRegion.width, y: layerRegion.y }]
      : generateTearPath(layerRegion.x, layerRegion.y, layerRegion.x + layerRegion.width, layerRegion.y, edgeComplexity, layerSeed);
    const rightEdge = skipEdges.right
      ? [{ x: layerRegion.x + layerRegion.width, y: layerRegion.y }, { x: layerRegion.x + layerRegion.width, y: layerRegion.y + layerRegion.height }]
      : generateTearPath(layerRegion.x + layerRegion.width, layerRegion.y, layerRegion.x + layerRegion.width, layerRegion.y + layerRegion.height, edgeComplexity, layerSeed + 10);
    const bottomEdge = skipEdges.bottom
      ? [{ x: layerRegion.x + layerRegion.width, y: layerRegion.y + layerRegion.height }, { x: layerRegion.x, y: layerRegion.y + layerRegion.height }]
      : generateTearPath(layerRegion.x + layerRegion.width, layerRegion.y + layerRegion.height, layerRegion.x, layerRegion.y + layerRegion.height, edgeComplexity, layerSeed + 20);
    const leftEdge = skipEdges.left
      ? [{ x: layerRegion.x, y: layerRegion.y + layerRegion.height }, { x: layerRegion.x, y: layerRegion.y }]
      : generateTearPath(layerRegion.x, layerRegion.y + layerRegion.height, layerRegion.x, layerRegion.y, edgeComplexity, layerSeed + 30);

    // 외곽 면만 포함 (인접한 면은 빈 배열로 - edge color/fiber 제외)
    const allEdges = {
      top: skipEdges.top ? [] : topEdge,
      right: skipEdges.right ? [] : rightEdge,
      bottom: skipEdges.bottom ? [] : bottomEdge,
      left: skipEdges.left ? [] : leftEdge
    };

    // 경로 생성 함수 (path는 모든 면 포함 - 마스킹용)
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
 * 범위들을 셀 집합으로 변환
 * @param {Array} ranges - [{rowStart, rowEnd, colStart, colEnd}, ...]
 * @returns {Set} "row-col" 형태의 셀 키 집합
 */
export function rangesToCellSet(ranges) {
  const cells = new Set();
  ranges.forEach(range => {
    for (let row = range.rowStart; row <= range.rowEnd; row++) {
      for (let col = range.colStart; col <= range.colEnd; col++) {
        cells.add(`${row}-${col}`);
      }
    }
  });
  return cells;
}

/**
 * 셀 집합의 외곽 경계를 픽셀 좌표 path로 변환
 * @param {Set} cellSet - 셀 키 집합
 * @param {Object} tableInfo - 테이블 정보
 * @param {number} edgeComplexity - 찢김 복잡도
 * @param {number} seed - 랜덤 시드
 * @returns {Array} 연결된 path 점 배열
 */
export function buildOuterPath(cellSet, tableInfo, edgeComplexity = 0.7, seed = 42) {
  const { startX, startY, cellHeight, columnWidths, cellWidth, inset = 3 } = tableInfo;

  // 각 셀의 외곽 세그먼트 수집
  const segments = [];

  cellSet.forEach(key => {
    const [row, col] = key.split('-').map(Number);

    // 셀의 픽셀 좌표 계산
    let x, w;
    if (columnWidths && Array.isArray(columnWidths)) {
      x = startX + columnWidths.slice(0, col).reduce((sum, cw) => sum + cw, 0);
      w = columnWidths[col] || cellWidth;
    } else {
      x = startX + col * cellWidth;
      w = cellWidth;
    }
    const y = startY + row * cellHeight;
    const h = cellHeight;

    // 외곽 면 확인 및 세그먼트 추가
    if (!cellSet.has(`${row - 1}-${col}`)) {
      // top
      segments.push({ x1: x + inset, y1: y + inset, x2: x + w - inset, y2: y + inset, side: 'top' });
    }
    if (!cellSet.has(`${row + 1}-${col}`)) {
      // bottom
      segments.push({ x1: x + w - inset, y1: y + h - inset, x2: x + inset, y2: y + h - inset, side: 'bottom' });
    }
    if (!cellSet.has(`${row}-${col - 1}`)) {
      // left
      segments.push({ x1: x + inset, y1: y + h - inset, x2: x + inset, y2: y + inset, side: 'left' });
    }
    if (!cellSet.has(`${row}-${col + 1}`)) {
      // right
      segments.push({ x1: x + w - inset, y1: y + inset, x2: x + w - inset, y2: y + h - inset, side: 'right' });
    }
  });

  // 세그먼트를 찢김 경로로 변환
  const allPoints = [];
  segments.forEach((seg, i) => {
    const tearPath = generateTearPath(seg.x1, seg.y1, seg.x2, seg.y2, edgeComplexity, seed + i * 10);
    allPoints.push(...tearPath);
  });

  return { segments, allPoints };
}

/**
 * 테이블 셀 범위 → 픽셀 영역 변환
 * @param {Object} range - {rowStart, rowEnd, colStart, colEnd}
 * @param {Object} tableInfo - 테이블 정보 {startX, startY, cellWidth, cellHeight}
 * @param {Object} skipEdges - 인접한 면 정보 (inset 조정용)
 * @returns {{x, y, width, height}} 픽셀 영역
 */
export function tableCellRangeToPixel(range, tableInfo, skipEdges = {}) {
  const { startX, startY, cellWidth, cellHeight, columnWidths, inset = 3 } = tableInfo;

  // 인접한 면에서는 inset 제거
  const topInset = skipEdges.top ? 0 : inset;
  const rightInset = skipEdges.right ? 0 : inset;
  const bottomInset = skipEdges.bottom ? 0 : inset;
  const leftInset = skipEdges.left ? 0 : inset;

  let x, width;

  if (columnWidths && Array.isArray(columnWidths)) {
    // columnWidths 배열 사용 (각 열의 실제 너비)
    x = startX + columnWidths.slice(0, range.colStart).reduce((sum, w) => sum + w, 0) + leftInset;
    width = columnWidths.slice(range.colStart, range.colEnd + 1).reduce((sum, w) => sum + w, 0) - leftInset - rightInset;
  } else {
    // 균등 너비 사용 (fallback)
    x = startX + range.colStart * cellWidth + leftInset;
    width = (range.colEnd - range.colStart + 1) * cellWidth - leftInset - rightInset;
  }

  const y = startY + range.rowStart * cellHeight + topInset;
  const height = (range.rowEnd - range.rowStart + 1) * cellHeight - topInset - bottomInset;

  return { x, y, width, height };
}

// ==========================================
// 차트 Corruption 효과
// ==========================================

/**
 * 차트 범위를 셀 집합으로 변환
 * @param {Array} ranges - [{x1, y1, x2, y2}, ...]
 * @returns {Set} "x-y" 형식의 셀 집합
 */
function chartRangesToCellSet(ranges) {
  const cells = new Set();
  ranges.forEach(range => {
    for (let x = range.x1; x <= range.x2; x++) {
      for (let y = range.y1; y <= range.y2; y++) {
        cells.add(`${x}-${y}`);
      }
    }
  });
  return cells;
}

/**
 * 차트에 corruption 효과 적용 (인접 셀 병합 지원)
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Object} corruptionOptions - corruption 설정
 * @param {Object} chartInfo - 차트 정보 (좌표 변환용)
 */
export function applyChartCorruption(ctx, corruptionOptions, chartInfo) {
  if (!corruptionOptions?.enabled || !corruptionOptions.cells) return;

  const cellsInput = Array.isArray(corruptionOptions.cells)
    ? corruptionOptions.cells.join(', ')
    : corruptionOptions.cells;

  const ranges = parseChartCells(cellsInput);
  if (ranges.length === 0) return;

  const style = corruptionOptions.style || {};
  const edgeComplexity = style.edgeComplexity || 0.7;
  const seed = style.seed || 42;
  const inset = 0;
  const overlap = 2;
  const maskAxisLabels = corruptionOptions.maskAxisLabels !== false;

  // 범위를 셀 집합으로 변환
  const cellSet = chartRangesToCellSet(ranges);

  // 축에 닿는 셀 확인 (maskAxisLabels용)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  const touchesYAxis = minX === 0;
  const touchesXAxis = minY === 0;
  const touchesTop = maxY >= (chartInfo.gridDivisions - 1);  // 차트 상단에 닿는지
  const touchesRight = chartInfo.barCount && maxX >= (chartInfo.barCount - 1);  // 차트 오른쪽 끝에 닿는지

  // 인접 여부 확인 헬퍼 (차트는 Y=0이 하단)
  const getAdjacency = (x, y) => ({
    hasTop: cellSet.has(`${x}-${y + 1}`),     // Y가 클수록 위
    hasBottom: cellSet.has(`${x}-${y - 1}`),  // Y가 작을수록 아래
    hasLeft: cellSet.has(`${x - 1}-${y}`),
    hasRight: cellSet.has(`${x + 1}-${y}`)
  });

  // 각 셀의 4변 경로를 미리 생성 (외곽은 찢김, 인접은 직선+오버랩)
  const cellEdges = new Map();
  const allEdgePoints = { top: [], right: [], bottom: [], left: [] };

  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    const cell = cellToPixel(x, y, chartInfo);
    const adj = getAdjacency(x, y);

    // 외곽: inset 적용, 인접: 오버랩 (셀 경계를 넘어감)
    let topY = adj.hasTop ? cell.y - overlap : cell.y + inset;
    let bottomY = adj.hasBottom ? cell.y + cell.height + overlap : cell.y + cell.height - inset;
    let leftX = adj.hasLeft ? cell.x - overlap : cell.x + inset;
    let rightX = adj.hasRight ? cell.x + cell.width + overlap : cell.x + cell.width - inset;

    // maskAxisLabels: 축 라벨까지 확장 (X축, Y축)
    if (maskAxisLabels) {
      if (touchesXAxis && y === minY && !adj.hasBottom) {
        // X축 라벨까지 확장 (아래로 30px)
        bottomY = cell.y + cell.height + 30;
      }
      if (touchesYAxis && x === minX && !adj.hasLeft) {
        // Y축 라벨까지 확장 (왼쪽으로)
        leftX = 5;
      }
    }

    // 차트 상단 찢김: maskAxisLabels와 관계없이 항상 차트 상단 테두리까지 확장
    if (touchesTop && y === maxY && !adj.hasTop) {
      topY = cell.y - 15;
    }

    // 차트 오른쪽 끝 찢김: maskAxisLabels와 관계없이 항상 차트 오른쪽 테두리까지 확장
    if (touchesRight && x === maxX && !adj.hasRight) {
      rightX = cell.x + cell.width + 15;
    }

    // 각 변의 경로 생성 (외곽은 찢김, 인접은 직선)
    const edges = {
      top: adj.hasTop
        ? [{ x: leftX, y: topY }, { x: rightX, y: topY }]
        : generateTearPath(leftX, topY, rightX, topY, edgeComplexity, seed + x * 100 + y),
      bottom: adj.hasBottom
        ? [{ x: rightX, y: bottomY }, { x: leftX, y: bottomY }]
        : generateTearPath(rightX, bottomY, leftX, bottomY, edgeComplexity, seed + x * 100 + y + 10),
      left: adj.hasLeft
        ? [{ x: leftX, y: bottomY }, { x: leftX, y: topY }]
        : generateTearPath(leftX, bottomY, leftX, topY, edgeComplexity, seed + x * 100 + y + 20),
      right: adj.hasRight
        ? [{ x: rightX, y: topY }, { x: rightX, y: bottomY }]
        : generateTearPath(rightX, topY, rightX, bottomY, edgeComplexity, seed + x * 100 + y + 30)
    };

    cellEdges.set(key, { cell, adj, edges });

    // 외곽 엣지 포인트 수집 (fiber용)
    if (!adj.hasTop) allEdgePoints.top.push(...edges.top);
    if (!adj.hasBottom) allEdgePoints.bottom.push(...edges.bottom);
    if (!adj.hasLeft) allEdgePoints.left.push(...edges.left);
    if (!adj.hasRight) allEdgePoints.right.push(...edges.right);
  });

  // 1단계: 마스킹 (각 셀을 찢김 경로로 마스킹)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  cellSet.forEach(key => {
    const { edges } = cellEdges.get(key);

    ctx.beginPath();
    // top → right → bottom → left 순서로 경로 연결
    ctx.moveTo(edges.top[0].x, edges.top[0].y);
    edges.top.forEach(p => ctx.lineTo(p.x, p.y));
    edges.right.forEach(p => ctx.lineTo(p.x, p.y));
    edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
    edges.left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // 2단계: 가장자리 색상 (외곽 면에만)
  if (style.edgeColorEnabled) {
    const edgeColor = style.edgeColor || 'rgba(160, 130, 80, 0.4)';

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    cellSet.forEach(key => {
      const { adj, edges } = cellEdges.get(key);

      if (!adj.hasTop && edges.top.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.top[0].x, edges.top[0].y);
        edges.top.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasBottom && edges.bottom.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.bottom[0].x, edges.bottom[0].y);
        edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasLeft && edges.left.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.left[0].x, edges.left[0].y);
        edges.left.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasRight && edges.right.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.right[0].x, edges.right[0].y);
        edges.right.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // 3단계: 종이 섬유 효과
  if (style.fiberEnabled) {
    const fiberColor = style.fiberColor || 'rgba(180, 150, 100, 0.5)';
    const fiberCount = style.fiberCount || 20;
    renderFibers(ctx, allEdgePoints, { fiberCount, color: fiberColor });
  }
}

// ==========================================
// 테이블 Corruption 효과 (셀 기반)
// ==========================================

/**
 * 테이블에 corruption 효과 적용
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Object} corruptionOptions - corruption 설정 { enabled, cells, style }
 * @param {Object} tableInfo - 테이블 정보 { startX, startY, cellHeight, columnWidths, totalRows, totalCols, inset }
 */
export function applyTableCorruption(ctx, corruptionOptions, tableInfo) {
  if (!corruptionOptions?.enabled || !corruptionOptions.cells) return;

  const cellsInput = Array.isArray(corruptionOptions.cells)
    ? corruptionOptions.cells.join(', ')
    : corruptionOptions.cells;

  const { totalRows, totalCols } = tableInfo;
  const ranges = parseTableCells(cellsInput, totalRows, totalCols);
  if (ranges.length === 0) return;

  // 범위를 셀 집합으로 변환
  const cellSet = rangesToCellSet(ranges);

  const style = corruptionOptions.style || {};
  const { startX, startY, cellHeight, columnWidths, rowHeights, cellWidth, inset = 3 } = tableInfo;
  const edgeComplexity = style.edgeComplexity || 0.7;
  const seed = style.seed || 42;

  // 셀 좌표 계산 헬퍼
  const getCellCoords = (row, col) => {
    let x, w;
    if (columnWidths && Array.isArray(columnWidths)) {
      x = startX + columnWidths.slice(0, col).reduce((sum, cw) => sum + cw, 0);
      w = columnWidths[col] || cellWidth;
    } else {
      x = startX + col * cellWidth;
      w = cellWidth;
    }
    // rowHeights가 있으면 각 행의 높이 합산, 없으면 균일 높이
    let y, h;
    if (rowHeights && Array.isArray(rowHeights)) {
      y = startY + rowHeights.slice(0, row).reduce((sum, rh) => sum + rh, 0);
      h = rowHeights[row] || cellHeight;
    } else {
      y = startY + row * cellHeight;
      h = cellHeight;
    }
    return { x, y, w, h };
  };

  // 인접 여부 확인 헬퍼
  const getAdjacency = (row, col) => ({
    hasTop: cellSet.has(`${row - 1}-${col}`),
    hasBottom: cellSet.has(`${row + 1}-${col}`),
    hasLeft: cellSet.has(`${row}-${col - 1}`),
    hasRight: cellSet.has(`${row}-${col + 1}`)
  });

  // 인접한 셀 사이의 경계선(grid line)도 마스킹하기 위해 약간 오버랩
  const overlap = 2;

  // 각 셀의 4변 경로를 미리 생성 (외곽은 찢김, 인접은 직선+오버랩)
  const cellEdges = new Map();
  const allEdgePoints = { top: [], right: [], bottom: [], left: [] };

  cellSet.forEach(key => {
    const [row, col] = key.split('-').map(Number);
    const { x, y, w, h } = getCellCoords(row, col);
    const adj = getAdjacency(row, col);

    // 외곽: inset 적용, 인접: 오버랩 (셀 경계를 넘어감)
    const topY = adj.hasTop ? y - overlap : y + inset;
    const bottomY = adj.hasBottom ? y + h + overlap : y + h - inset;
    const leftX = adj.hasLeft ? x - overlap : x + inset;
    const rightX = adj.hasRight ? x + w + overlap : x + w - inset;

    // 각 변의 경로 생성 (외곽은 찢김, 인접은 직선)
    const edges = {
      top: adj.hasTop
        ? [{ x: leftX, y: topY }, { x: rightX, y: topY }]
        : generateTearPath(leftX, topY, rightX, topY, edgeComplexity, seed + row * 100 + col),
      bottom: adj.hasBottom
        ? [{ x: rightX, y: bottomY }, { x: leftX, y: bottomY }]
        : generateTearPath(rightX, bottomY, leftX, bottomY, edgeComplexity, seed + row * 100 + col + 10),
      left: adj.hasLeft
        ? [{ x: leftX, y: bottomY }, { x: leftX, y: topY }]
        : generateTearPath(leftX, bottomY, leftX, topY, edgeComplexity, seed + row * 100 + col + 20),
      right: adj.hasRight
        ? [{ x: rightX, y: topY }, { x: rightX, y: bottomY }]
        : generateTearPath(rightX, topY, rightX, bottomY, edgeComplexity, seed + row * 100 + col + 30)
    };

    cellEdges.set(key, { adj, edges });

    // 외곽 엣지 포인트 수집 (fiber용)
    if (!adj.hasTop) allEdgePoints.top.push(...edges.top);
    if (!adj.hasBottom) allEdgePoints.bottom.push(...edges.bottom);
    if (!adj.hasLeft) allEdgePoints.left.push(...edges.left);
    if (!adj.hasRight) allEdgePoints.right.push(...edges.right);
  });

  // 1단계: 마스킹 (각 셀을 찢김 경로로 마스킹)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  cellSet.forEach(key => {
    const { edges } = cellEdges.get(key);

    ctx.beginPath();
    // top → right → bottom → left 순서로 경로 연결
    ctx.moveTo(edges.top[0].x, edges.top[0].y);
    edges.top.forEach(p => ctx.lineTo(p.x, p.y));
    edges.right.forEach(p => ctx.lineTo(p.x, p.y));
    edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
    edges.left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // 2단계: 가장자리 색상 (외곽 면에만)
  if (style.edgeColorEnabled) {
    const edgeColor = style.edgeColor || 'rgba(160, 130, 80, 0.4)';

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    cellSet.forEach(key => {
      const { adj, edges } = cellEdges.get(key);

      if (!adj.hasTop && edges.top.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.top[0].x, edges.top[0].y);
        edges.top.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasBottom && edges.bottom.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.bottom[0].x, edges.bottom[0].y);
        edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasLeft && edges.left.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.left[0].x, edges.left[0].y);
        edges.left.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasRight && edges.right.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.right[0].x, edges.right[0].y);
        edges.right.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // 3단계: 종이 섬유 효과 (fiberEnabled)
  if (style.fiberEnabled) {
    const fiberColor = style.fiberColor || 'rgba(180, 150, 100, 0.5)';
    const fiberCount = style.fiberCount || 20;
    renderFibers(ctx, allEdgePoints, { fiberCount, color: fiberColor });
  }
}

// ==========================================
// 산점도 Corruption 효과
// ==========================================

/**
 * 산점도 셀 좌표 → 픽셀 좌표 변환
 * @param {number} cellX - X 셀 인덱스 (0 = 압축 구간)
 * @param {number} cellY - Y 셀 인덱스 (0 = 압축 구간, 하단부터)
 * @param {Object} scatterInfo - 산점도 정보
 * @returns {{x, y, width, height}} 픽셀 좌표 및 크기
 */
export function scatterCellToPixel(cellX, cellY, scatterInfo) {
  const { padding, xCellWidth, yCellHeight, canvasHeight } = scatterInfo;

  const pixelX = padding + cellX * xCellWidth;
  // Y축은 반전 (cellY=0이 하단)
  const pixelY = canvasHeight - padding - (cellY + 1) * yCellHeight;

  return {
    x: pixelX,
    y: pixelY,
    width: xCellWidth,
    height: yCellHeight
  };
}

/**
 * 산점도에 corruption 효과 적용
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {Object} corruptionOptions - corruption 설정
 * @param {Object} scatterInfo - 산점도 정보 (좌표 변환용)
 */
export function applyScatterCorruption(ctx, corruptionOptions, scatterInfo) {
  if (!corruptionOptions?.enabled || !corruptionOptions.cells) return;

  const cellsInput = Array.isArray(corruptionOptions.cells)
    ? corruptionOptions.cells.join(', ')
    : corruptionOptions.cells;

  const ranges = parseChartCells(cellsInput);
  if (ranges.length === 0) return;

  const style = corruptionOptions.style || {};
  const edgeComplexity = style.edgeComplexity || 0.7;
  const seed = style.seed || 42;
  const inset = 0;
  const overlap = 2;

  // 범위를 셀 집합으로 변환
  const cellSet = chartRangesToCellSet(ranges);

  // 경계 셀 확인
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  const touchesLeft = minX === 0;
  const touchesBottom = minY === 0;
  const touchesTop = maxY >= (scatterInfo.yTotalCells - 1);
  const touchesRight = maxX >= (scatterInfo.xTotalCells - 1);

  // 인접 여부 확인 헬퍼
  const getAdjacency = (x, y) => ({
    hasTop: cellSet.has(`${x}-${y + 1}`),
    hasBottom: cellSet.has(`${x}-${y - 1}`),
    hasLeft: cellSet.has(`${x - 1}-${y}`),
    hasRight: cellSet.has(`${x + 1}-${y}`)
  });

  // 각 셀의 4변 경로를 미리 생성
  const cellEdges = new Map();
  const allEdgePoints = { top: [], right: [], bottom: [], left: [] };

  cellSet.forEach(key => {
    const [x, y] = key.split('-').map(Number);
    const cell = scatterCellToPixel(x, y, scatterInfo);
    const adj = getAdjacency(x, y);

    // 외곽: inset 적용, 인접: 오버랩
    let topY = adj.hasTop ? cell.y - overlap : cell.y + inset;
    let bottomY = adj.hasBottom ? cell.y + cell.height + overlap : cell.y + cell.height - inset;
    let leftX = adj.hasLeft ? cell.x - overlap : cell.x + inset;
    let rightX = adj.hasRight ? cell.x + cell.width + overlap : cell.x + cell.width - inset;

    // 경계 확장 (축 라벨까지)
    if (touchesBottom && y === minY && !adj.hasBottom) {
      bottomY = cell.y + cell.height + 30;
    }
    if (touchesLeft && x === minX && !adj.hasLeft) {
      leftX = 5;
    }
    if (touchesTop && y === maxY && !adj.hasTop) {
      topY = cell.y - 15;
    }
    if (touchesRight && x === maxX && !adj.hasRight) {
      rightX = cell.x + cell.width + 15;
    }

    // 각 변의 경로 생성
    const edges = {
      top: adj.hasTop
        ? [{ x: leftX, y: topY }, { x: rightX, y: topY }]
        : generateTearPath(leftX, topY, rightX, topY, edgeComplexity, seed + x * 100 + y),
      bottom: adj.hasBottom
        ? [{ x: rightX, y: bottomY }, { x: leftX, y: bottomY }]
        : generateTearPath(rightX, bottomY, leftX, bottomY, edgeComplexity, seed + x * 100 + y + 10),
      left: adj.hasLeft
        ? [{ x: leftX, y: bottomY }, { x: leftX, y: topY }]
        : generateTearPath(leftX, bottomY, leftX, topY, edgeComplexity, seed + x * 100 + y + 20),
      right: adj.hasRight
        ? [{ x: rightX, y: topY }, { x: rightX, y: bottomY }]
        : generateTearPath(rightX, topY, rightX, bottomY, edgeComplexity, seed + x * 100 + y + 30)
    };

    cellEdges.set(key, { cell, adj, edges });

    // 외곽 엣지 포인트 수집
    if (!adj.hasTop) allEdgePoints.top.push(...edges.top);
    if (!adj.hasBottom) allEdgePoints.bottom.push(...edges.bottom);
    if (!adj.hasLeft) allEdgePoints.left.push(...edges.left);
    if (!adj.hasRight) allEdgePoints.right.push(...edges.right);
  });

  // 1단계: 마스킹
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';

  cellSet.forEach(key => {
    const { edges } = cellEdges.get(key);

    ctx.beginPath();
    ctx.moveTo(edges.top[0].x, edges.top[0].y);
    edges.top.forEach(p => ctx.lineTo(p.x, p.y));
    edges.right.forEach(p => ctx.lineTo(p.x, p.y));
    edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
    edges.left.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // 2단계: 가장자리 색상
  if (style.edgeColorEnabled) {
    const edgeColor = style.edgeColor || 'rgba(160, 130, 80, 0.4)';

    ctx.save();
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    cellSet.forEach(key => {
      const { adj, edges } = cellEdges.get(key);

      if (!adj.hasTop && edges.top.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.top[0].x, edges.top[0].y);
        edges.top.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasBottom && edges.bottom.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.bottom[0].x, edges.bottom[0].y);
        edges.bottom.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasLeft && edges.left.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.left[0].x, edges.left[0].y);
        edges.left.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (!adj.hasRight && edges.right.length > 1) {
        ctx.beginPath();
        ctx.moveTo(edges.right[0].x, edges.right[0].y);
        edges.right.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  // 3단계: 종이 섬유 효과
  if (style.fiberEnabled) {
    const fiberColor = style.fiberColor || 'rgba(180, 150, 100, 0.5)';
    const fiberCount = style.fiberCount || 20;
    renderFibers(ctx, allEdgePoints, { fiberCount, color: fiberColor });
  }
}

export default {
  simpleNoise,
  smoothNoise,
  generateTearPath,
  renderTearMask,
  renderFibers,
  parseChartCells,
  cellToPixel,
  cellRangeToPixel,
  parseTableCells,
  rangesToCellSet,
  applyChartCorruption,
  applyTableCorruption,
  applyScatterCorruption,
  scatterCellToPixel
};
