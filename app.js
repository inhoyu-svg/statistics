/**
 * 도수분포표 애플리케이션
 * 관심사 분리를 통한 클린 아키텍처
 *
 * @version 2.0.0
 * @description 보안, 성능, 접근성, 반응형 모두 개선된 버전
 */

// ========== 상수 정의 (매직 넘버 제거) ==========
const CONFIG = {
  // 데이터 제한
  MAX_DATA_POINTS: 10000,
  MIN_DATA_POINTS: 2,

  // 계급 설정
  MIN_CLASS_COUNT: 3,
  MAX_CLASS_COUNT: 20,
  MIN_CLASS_WIDTH: 0.1,

  // 차트 설정
  CHART_PADDING: 60,
  CHART_Y_SCALE_MULTIPLIER: 1.2,
  CHART_BAR_WIDTH_RATIO: 0.9,
  CHART_BAR_CENTER_OFFSET: 0.45,
  CHART_POLYGON_START_OFFSET: -0.5,
  CHART_POLYGON_END_OFFSET: 0.9,
  CHART_POINT_RADIUS: 5,
  CHART_GRID_DIVISIONS: 10,
  CHART_LABEL_OFFSET: 5,

  // 소수점 자릿수
  DECIMAL_PLACES: 2,

  // 메시지 표시 시간
  MESSAGE_DISPLAY_TIME: 5000,

  // Canvas 기본 크기
  CANVAS_WIDTH: 700,
  CANVAS_HEIGHT: 450,

  // CSS 변수에서 가져오는 색상 (테마 통합)
  getColor(varName) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(varName).trim();
  }
};

// ========== 유틸리티 함수 ==========
class Utils {
  /**
   * XSS 방지: HTML 이스케이프
   */
  static escapeHtml(unsafe) {
    const div = document.createElement('div');
    div.textContent = unsafe;
    return div.innerHTML;
  }

  /**
   * 숫자를 지정된 소수점 자릿수로 포맷
   */
  static formatNumber(num, decimals = CONFIG.DECIMAL_PLACES) {
    return Number(num).toFixed(decimals);
  }

  /**
   * 배열이 비어있는지 확인
   */
  static isEmpty(arr) {
    return !arr || arr.length === 0;
  }

  /**
   * 숫자 범위 검증
   */
  static isInRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * 디바운스 함수
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// ========== 검증 레이어 ==========
class Validator {
  /**
   * 데이터 배열 검증
   */
  static validateData(data) {
    if (Utils.isEmpty(data)) {
      return { valid: false, message: '유효한 데이터가 없습니다. 숫자를 입력해주세요.' };
    }

    if (data.length < CONFIG.MIN_DATA_POINTS) {
      return { valid: false, message: `최소 ${CONFIG.MIN_DATA_POINTS}개 이상의 데이터가 필요합니다.` };
    }

    if (data.length > CONFIG.MAX_DATA_POINTS) {
      return { valid: false, message: `데이터 개수는 최대 ${CONFIG.MAX_DATA_POINTS}개까지 입력 가능합니다.` };
    }

    // NaN, Infinity 체크
    if (data.some(v => !isFinite(v))) {
      return { valid: false, message: '유효하지 않은 숫자가 포함되어 있습니다.' };
    }

    return { valid: true };
  }

  /**
   * 계급 개수 검증
   */
  static validateClassCount(count) {
    if (!count || isNaN(count)) {
      return { valid: false, message: '계급 개수를 입력해주세요.' };
    }

    if (!Utils.isInRange(count, CONFIG.MIN_CLASS_COUNT, CONFIG.MAX_CLASS_COUNT)) {
      return {
        valid: false,
        message: `계급 개수는 ${CONFIG.MIN_CLASS_COUNT}~${CONFIG.MAX_CLASS_COUNT} 사이여야 합니다.`
      };
    }

    return { valid: true };
  }

  /**
   * 계급 간격 검증
   */
  static validateClassWidth(width) {
    if (width === null || width === undefined || width === '') {
      return { valid: true }; // 선택사항이므로 비어있어도 OK
    }

    if (isNaN(width) || width <= 0) {
      return { valid: false, message: '계급 간격은 0보다 큰 숫자여야 합니다.' };
    }

    if (width < CONFIG.MIN_CLASS_WIDTH) {
      return { valid: false, message: `계급 간격은 최소 ${CONFIG.MIN_CLASS_WIDTH} 이상이어야 합니다.` };
    }

    return { valid: true };
  }
}

// ========== UI 메시지 관리 ==========
class MessageManager {
  static show(message, type = 'error') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box show ${type}`;

    // 자동으로 메시지 숨기기
    setTimeout(() => {
      this.hide();
    }, CONFIG.MESSAGE_DISPLAY_TIME);
  }

  static hide() {
    const messageBox = document.getElementById('messageBox');
    messageBox.classList.remove('show');
  }

  static error(message) {
    this.show(message, 'error');
  }

  static success(message) {
    this.show(message, 'success');
  }

  static warning(message) {
    this.show(message, 'warning');
  }
}

// ========== 데이터 처리 레이어 ==========
class DataProcessor {
  /**
   * 입력 문자열을 숫자 배열로 파싱
   */
  static parseInput(input) {
    return input
      .split(/[,\s]+/)
      .map(Number)
      .filter(n => !isNaN(n) && isFinite(n));
  }

  /**
   * 기본 통계 계산 (빈 배열 방지)
   */
  static calculateBasicStats(data) {
    if (Utils.isEmpty(data)) {
      throw new Error('데이터가 비어있습니다.');
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;

    const sorted = [...data].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
      : sorted[Math.floor(sorted.length/2)];

    return { min, max, range, mean, median, count: data.length };
  }

  /**
   * 계급 구간 생성 (중복 호출 최소화)
   */
  static createClasses(stats, classCount, customWidth = null) {
    const { min, max, range } = stats;
    const classWidth = customWidth || Math.ceil(range / classCount);

    const classes = [];
    const startValue = Math.floor(min / classWidth) * classWidth;

    for (let i = 0; i < classCount; i++) {
      const classMin = startValue + (i * classWidth);
      const classMax = classMin + classWidth;
      classes.push({
        min: classMin,
        max: classMax,
        frequency: 0,
        data: [],
        midpoint: (classMin + classMax) / 2
      });
    }

    return { classes, classWidth };
  }

  /**
   * 도수 계산 (범위 밖 데이터 처리 개선)
   */
  static calculateFrequencies(data, classes) {
    const outOfRangeData = [];

    data.forEach(value => {
      let placed = false;

      for (let i = 0; i < classes.length; i++) {
        const isLastClass = i === classes.length - 1;
        const inRange = isLastClass
          ? value >= classes[i].min && value <= classes[i].max
          : value >= classes[i].min && value < classes[i].max;

        if (inRange) {
          classes[i].frequency++;
          classes[i].data.push(value);
          placed = true;
          break;
        }
      }

      if (!placed) {
        outOfRangeData.push(value);
      }
    });

    // 범위 밖 데이터가 있으면 경고
    if (outOfRangeData.length > 0) {
      MessageManager.warning(
        `${outOfRangeData.length}개의 데이터가 계급 범위를 벗어났습니다: ${outOfRangeData.join(', ')}`
      );
    }

    return classes;
  }

  /**
   * 상대도수 및 누적도수 계산
   */
  static calculateRelativeAndCumulative(classes, total) {
    let cumulativeFreq = 0;

    classes.forEach(c => {
      c.relativeFreq = Utils.formatNumber(c.frequency / total * 100);
      cumulativeFreq += c.frequency;
      c.cumulativeFreq = cumulativeFreq;
      c.cumulativeRelFreq = Utils.formatNumber(cumulativeFreq / total * 100);
    });

    return classes;
  }
}

// ========== UI 렌더링 레이어 (XSS 방지) ==========
class UIRenderer {
  /**
   * 통계 요약 카드 렌더링 (템플릿 리터럴 대신 DOM 조작)
   */
  static renderStatsCards(stats) {
    const container = document.getElementById('statsSummary');
    container.innerHTML = ''; // 초기화

    const statsData = [
      { label: '데이터 개수', value: stats.count },
      { label: '최솟값', value: stats.min },
      { label: '최댓값', value: stats.max },
      { label: '범위', value: stats.range },
      { label: '평균', value: Utils.formatNumber(stats.mean) },
      { label: '중앙값', value: Utils.formatNumber(stats.median) }
    ];

    statsData.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';

      const h3 = document.createElement('h3');
      h3.textContent = stat.label;

      const p = document.createElement('p');
      p.textContent = stat.value;

      card.appendChild(h3);
      card.appendChild(p);
      container.appendChild(card);
    });

    // stats-summary 표시
    container.classList.add('active');
  }

  /**
   * 도수분포표 렌더링 (XSS 방지)
   */
  static renderFrequencyTable(classes, total) {
    const table = document.getElementById('frequencyTable');
    table.innerHTML = ''; // 초기화

    // thead 생성
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['계급', '계급값', '도수', '상대도수(%)', '누적도수', '누적상대도수(%)'];

    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // tbody 생성
    const tbody = document.createElement('tbody');

    classes.forEach(c => {
      const row = document.createElement('tr');

      const cells = [
        `${c.min} ~ ${c.max}`,
        Utils.formatNumber(c.midpoint),
        c.frequency,
        `${c.relativeFreq}%`,
        c.cumulativeFreq,
        `${c.cumulativeRelFreq}%`
      ];

      cells.forEach(cellText => {
        const td = document.createElement('td');
        td.textContent = cellText;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    // 합계 행
    const totalRow = document.createElement('tr');
    totalRow.style.background = CONFIG.getColor('--color-primary');
    totalRow.style.color = 'white';
    totalRow.style.fontWeight = 'bold';

    // 첫 번째 셀: "합계" (colspan=2)
    const td1 = document.createElement('td');
    td1.colSpan = 2;
    td1.textContent = '합계';
    totalRow.appendChild(td1);

    // 나머지 셀들
    const totalCells = [total, '100%', total, '100%'];
    totalCells.forEach(cellText => {
      const td = document.createElement('td');
      td.textContent = cellText;
      totalRow.appendChild(td);
    });

    tbody.appendChild(totalRow);
    table.appendChild(tbody);
  }
}

// ========== 차트 렌더링 레이어 (반응형) ==========
class ChartRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = CONFIG.CHART_PADDING;
  }

  /**
   * 캔버스 초기화
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 히스토그램과 상대도수 다각형 그리기
   */
  draw(classes) {
    // Canvas 크기 설정 (매번 그릴 때마다)
    this.canvas.width = CONFIG.CANVAS_WIDTH;
    this.canvas.height = CONFIG.CANVAS_HEIGHT;

    this.clear();

    const freq = classes.map(c => c.frequency);
    const total = freq.reduce((a, b) => a + b, 0);

    if (total === 0) {
      this.drawNoDataMessage();
      return;
    }

    const relativeFreqs = freq.map(f => f / total);

    const chartW = this.canvas.width - this.padding * 2;
    const chartH = this.canvas.height - this.padding * 2;
    const maxY = Math.max(...relativeFreqs) * CONFIG.CHART_Y_SCALE_MULTIPLIER;

    const xScale = chartW / classes.length;
    const yScale = chartH / maxY;

    // 좌표 변환 함수
    const toX = (index) => this.padding + index * xScale;
    const toY = (value) => this.canvas.height - this.padding - value * yScale;

    // 렌더링 순서
    this.drawGrid(toX, toY, maxY);
    this.drawHistogram(relativeFreqs, freq, toX, toY, xScale);
    this.drawPolygon(relativeFreqs, toX, toY, classes.length);
    this.drawAxes(classes, toX, toY, maxY, xScale);
    this.drawLegend();
  }

  /**
   * 데이터 없음 메시지
   */
  drawNoDataMessage() {
    this.ctx.fillStyle = CONFIG.getColor('--color-text-light');
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '데이터가 없습니다',
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  /**
   * 배경 격자선 그리기
   */
  drawGrid(toX, toY, maxY) {
    this.ctx.strokeStyle = CONFIG.getColor('--color-grid');
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= CONFIG.CHART_GRID_DIVISIONS; i++) {
      const y = toY(maxY * i / CONFIG.CHART_GRID_DIVISIONS);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.canvas.width - this.padding, y);
      this.ctx.stroke();
    }
  }

  /**
   * 히스토그램 그리기
   */
  drawHistogram(relativeFreqs, freq, toX, toY, xScale) {
    relativeFreqs.forEach((r, i) => {
      const x = toX(i);
      const y = toY(r);
      const h = toY(0) - y;

      // 막대 그리기
      this.ctx.fillStyle = CONFIG.getColor('--chart-bar-color');
      this.ctx.strokeStyle = CONFIG.getColor('--chart-bar-border');
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(x, y, xScale * CONFIG.CHART_BAR_WIDTH_RATIO, h);
      this.ctx.strokeRect(x, y, xScale * CONFIG.CHART_BAR_WIDTH_RATIO, h);

      // 도수 라벨
      this.ctx.fillStyle = CONFIG.getColor('--color-text');
      this.ctx.font = '12px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        freq[i],
        x + xScale * CONFIG.CHART_BAR_CENTER_OFFSET,
        y - CONFIG.CHART_LABEL_OFFSET
      );
    });
  }

  /**
   * 상대도수 다각형 그리기
   */
  drawPolygon(relativeFreqs, toX, toY, classCount) {
    this.ctx.strokeStyle = CONFIG.getColor('--chart-line-color');
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    // 시작점
    this.ctx.moveTo(toX(CONFIG.CHART_POLYGON_START_OFFSET), toY(0));

    // 각 점 연결
    relativeFreqs.forEach((r, i) => {
      this.ctx.lineTo(toX(i + CONFIG.CHART_BAR_CENTER_OFFSET), toY(r));
    });

    // 끝점
    this.ctx.lineTo(
      toX(classCount - CONFIG.CHART_POLYGON_START_OFFSET + CONFIG.CHART_POLYGON_END_OFFSET),
      toY(0)
    );
    this.ctx.stroke();

    // 점 찍기
    this.ctx.fillStyle = CONFIG.getColor('--chart-point-color');
    relativeFreqs.forEach((r, i) => {
      this.ctx.beginPath();
      this.ctx.arc(
        toX(i + CONFIG.CHART_BAR_CENTER_OFFSET),
        toY(r),
        CONFIG.CHART_POINT_RADIUS,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
  }

  /**
   * 축과 라벨 그리기
   */
  drawAxes(classes, toX, toY, maxY, xScale) {
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.font = 'bold 14px sans-serif';

    // Y축 라벨
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= CONFIG.CHART_GRID_DIVISIONS; i++) {
      const value = Utils.formatNumber(maxY * i / CONFIG.CHART_GRID_DIVISIONS);
      this.ctx.fillText(
        value,
        this.padding - 10,
        toY(maxY * i / CONFIG.CHART_GRID_DIVISIONS) + CONFIG.CHART_LABEL_OFFSET
      );
    }

    // X축 라벨 (계급)
    this.ctx.textAlign = 'center';
    this.ctx.font = '11px sans-serif';
    classes.forEach((c, i) => {
      this.ctx.fillText(
        `${c.min}~${c.max}`,
        toX(i) + xScale * CONFIG.CHART_BAR_CENTER_OFFSET,
        this.canvas.height - this.padding + 20
      );
    });

    // 축 제목
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.fillText('계급', this.canvas.width / 2, this.canvas.height - 10);

    // Y축 제목 (회전)
    this.ctx.save();
    this.ctx.translate(15, this.canvas.height / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText('상대도수', 0, 0);
    this.ctx.restore();
  }

  /**
   * 범례 그리기
   */
  drawLegend() {
    const legendX = this.canvas.width - 180;
    this.ctx.textAlign = 'left';
    this.ctx.font = '12px sans-serif';

    // 히스토그램 범례
    this.ctx.fillStyle = CONFIG.getColor('--chart-bar-color');
    this.ctx.fillRect(legendX, 20, 20, 15);
    this.ctx.strokeStyle = CONFIG.getColor('--chart-bar-border');
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(legendX, 20, 20, 15);
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText('히스토그램', legendX + 25, 32);

    // 상대도수 다각형 범례
    this.ctx.strokeStyle = CONFIG.getColor('--chart-line-color');
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(legendX, 50);
    this.ctx.lineTo(legendX + 20, 50);
    this.ctx.stroke();
    this.ctx.fillStyle = CONFIG.getColor('--chart-point-color');
    this.ctx.beginPath();
    this.ctx.arc(legendX + 10, 50, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = CONFIG.getColor('--color-text');
    this.ctx.fillText('상대도수 다각형', legendX + 25, 54);
  }
}

// ========== 애플리케이션 컨트롤러 ==========
class FrequencyDistributionApp {
  constructor() {
    this.chartRenderer = new ChartRenderer('chart');
    this.init();
  }

  /**
   * 이벤트 리스너 초기화
   */
  init() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', () => this.generate());

    // Enter 키로도 생성 가능
    document.getElementById('dataInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        this.generate();
      }
    });
  }

  /**
   * 도수분포표 생성 메인 로직
   */
  generate() {
    try {
      MessageManager.hide();

      // 1. 입력 값 가져오기
      const input = document.getElementById('dataInput').value.trim();
      if (!input) {
        MessageManager.error('데이터를 입력해주세요!');
        return;
      }

      // 2. 데이터 파싱
      const data = DataProcessor.parseInput(input);

      // 3. 데이터 검증
      const dataValidation = Validator.validateData(data);
      if (!dataValidation.valid) {
        MessageManager.error(dataValidation.message);
        return;
      }

      // 4. 계급 설정 검증
      const classCount = parseInt(document.getElementById('classCount').value);
      const classCountValidation = Validator.validateClassCount(classCount);
      if (!classCountValidation.valid) {
        MessageManager.error(classCountValidation.message);
        return;
      }

      const classWidthInput = document.getElementById('classWidth').value;
      const customWidth = classWidthInput ? parseFloat(classWidthInput) : null;
      const classWidthValidation = Validator.validateClassWidth(customWidth);
      if (!classWidthValidation.valid) {
        MessageManager.error(classWidthValidation.message);
        return;
      }

      // 5. 데이터 처리
      const stats = DataProcessor.calculateBasicStats(data);
      const { classes } = DataProcessor.createClasses(stats, classCount, customWidth);
      DataProcessor.calculateFrequencies(data, classes);
      DataProcessor.calculateRelativeAndCumulative(classes, data.length);

      // 6. UI 렌더링
      UIRenderer.renderStatsCards(stats);
      UIRenderer.renderFrequencyTable(classes, data.length);
      this.chartRenderer.draw(classes);

      // 7. 결과 섹션 표시
      document.getElementById('resultSection').classList.add('active');

      // 8. 성공 메시지
      MessageManager.success('도수분포표가 생성되었습니다!');

    } catch (error) {
      console.error('Error:', error);
      MessageManager.error(`오류가 발생했습니다: ${error.message}`);
    }
  }
}

// ========== 앱 초기화 ==========
// DOM이 로드된 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FrequencyDistributionApp();
  });
} else {
  new FrequencyDistributionApp();
}
