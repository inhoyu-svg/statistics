/**
 * 데이터 처리 레이어
 * 통계 계산 및 계급 생성 로직
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';
import MessageManager from '../utils/message.js';

class DataProcessor {
  /**
   * 입력 문자열을 숫자 배열로 파싱
   * @param {string} input - 쉼표 또는 공백으로 구분된 숫자 문자열
   * @returns {number[]} 파싱된 숫자 배열
   * @example
   * parseInput("1, 2, 3") // [1, 2, 3]
   * parseInput("1 2 3") // [1, 2, 3]
   * parseInput("1, abc, 3") // [1, 3] (NaN 제거)
   */
  static parseInput(input) {
    return input
      .split(/[,\s]+/)
      .map(Number)
      .filter(n => !isNaN(n) && isFinite(n));
  }

  /**
   * 기본 통계 계산
   * @param {number[]} data - 숫자 배열
   * @returns {{min: number, max: number, range: number, mean: number, median: number, count: number}} 통계 객체
   * @throws {Error} 데이터가 비어있는 경우
   * @example
   * calculateBasicStats([1, 2, 3, 4, 5])
   * // { min: 1, max: 5, range: 4, mean: 3, median: 3, count: 5 }
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
   * 계급 구간 생성 (0부터 시작, 끝에 빈 구간 추가)
   * @param {Object} stats - 통계 객체 (calculateBasicStats 반환값)
   * @param {number} classCount - 생성할 계급 개수
   * @param {number|null} customWidth - 커스텀 계급 간격 (선택)
   * @param {Object|null} customRange - 커스텀 범위 설정 { firstEnd, secondEnd, lastStart }
   * @returns {{classes: Array, classWidth: number}} 계급 배열과 계급 간격
   * @example
   * createClasses({ max: 100 }, 5)
   * // { classes: [{min: 0, max: 20, ...}, ...], classWidth: 20 }
   */
  static createClasses(stats, classCount, customWidth = null, customRange = null) {
    // 커스텀 범위가 있으면 그것을 사용
    if (customRange) {
      return this.createCustomRangeClasses(customRange);
    }

    const { max, range } = stats;
    const classWidth = customWidth || Math.ceil(range / classCount);

    const classes = [];
    const startValue = 0; // 항상 0부터 시작

    // 최대값을 커버할 수 있을 때까지 계급 생성
    let i = 0;
    let classMax = 0;

    while (classMax < max || i < classCount) {
      const classMin = startValue + (i * classWidth);
      classMax = classMin + classWidth;
      classes.push({
        min: classMin,
        max: classMax,
        frequency: 0,
        data: [],
        midpoint: (classMin + classMax) / 2
      });
      i++;

      // 최대값을 커버했고 최소 계급 개수도 충족했으면 종료
      if (classMax >= max && i >= classCount) break;
    }

    // 끝에 빈 구간 1개 추가
    const lastClassMin = startValue + (i * classWidth);
    const lastClassMax = lastClassMin + classWidth;
    classes.push({
      min: lastClassMin,
      max: lastClassMax,
      frequency: 0,
      data: [],
      midpoint: (lastClassMin + lastClassMax) / 2
    });

    return { classes, classWidth };
  }

  /**
   * 커스텀 범위로 계급 구간 생성
   * @param {Object} customRange - { firstEnd, secondEnd, lastStart }
   * @returns {{classes: Array, classWidth: number}} 계급 배열과 계급 간격
   * @description
   * - 첫 칸: 0 ~ firstEnd (비어있음)
   * - 두 번째 칸: firstEnd ~ secondEnd (간격 결정)
   * - 중간 칸들: 두 번째 칸의 간격으로 자동 생성
   * - 마지막 칸: lastStart ~ (lastStart + 간격)
   */
  static createCustomRangeClasses(customRange) {
    const { firstEnd, secondEnd, lastStart } = customRange;

    // 유효성 검사
    if (firstEnd <= 0) {
      throw new Error('첫 칸의 끝값은 0보다 커야 합니다.');
    }
    if (secondEnd <= firstEnd) {
      throw new Error('두 번째 칸의 끝값은 첫 칸의 끝값보다 커야 합니다.');
    }
    if (lastStart <= secondEnd) {
      throw new Error('마지막 칸의 시작값은 두 번째 칸의 끝값보다 커야 합니다.');
    }

    // 간격 계산 (두 번째 칸 기준)
    const classWidth = secondEnd - firstEnd;

    const classes = [];

    // 첫 칸 추가 (0 ~ firstEnd)
    classes.push({
      min: 0,
      max: firstEnd,
      frequency: 0,
      data: [],
      midpoint: firstEnd / 2
    });

    // 두 번째 칸부터 마지막 칸 직전까지
    let currentMin = firstEnd;
    while (currentMin < lastStart) {
      const currentMax = currentMin + classWidth;
      classes.push({
        min: currentMin,
        max: currentMax,
        frequency: 0,
        data: [],
        midpoint: (currentMin + currentMax) / 2
      });
      currentMin = currentMax;
    }

    // 마지막 칸 추가 (lastStart ~ lastStart + classWidth)
    classes.push({
      min: lastStart,
      max: lastStart + classWidth,
      frequency: 0,
      data: [],
      midpoint: lastStart + (classWidth / 2)
    });

    return { classes, classWidth };
  }

  /**
   * 도수 계산
   * @param {number[]} data - 데이터 배열
   * @param {Array} classes - 계급 배열 (createClasses 반환값)
   * @returns {Array} 도수가 업데이트된 계급 배열
   * @description 각 데이터를 해당하는 계급에 배치하고 도수를 증가시킴
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
      const maxDisplay = 10;
      const preview = outOfRangeData.slice(0, maxDisplay).join(', ');
      const message = outOfRangeData.length > maxDisplay
        ? `${outOfRangeData.length}개의 데이터가 계급 범위를 벗어났습니다: ${preview}... 외 ${outOfRangeData.length - maxDisplay}개`
        : `${outOfRangeData.length}개의 데이터가 계급 범위를 벗어났습니다: ${preview}`;

      MessageManager.warning(message);
    }

    return classes;
  }

  /**
   * 상대도수 및 누적도수 계산
   * @param {Array} classes - 계급 배열
   * @param {number} total - 전체 데이터 개수
   * @returns {Array} 상대도수와 누적도수가 추가된 계급 배열
   * @description 각 계급에 relativeFreq, cumulativeFreq, cumulativeRelFreq 추가
   */
  static calculateRelativeAndCumulative(classes, total) {
    let cumulativeFreq = 0;

    classes.forEach(classData => {
      classData.relativeFreq = Utils.formatNumber(classData.frequency / total * 100);
      cumulativeFreq += classData.frequency;
      classData.cumulativeFreq = cumulativeFreq;
      classData.cumulativeRelFreq = Utils.formatNumber(cumulativeFreq / total * 100);
    });

    return classes;
  }

  /**
   * 중략 표시가 필요한지 판단
   * @param {Array} classes - 계급 배열
   * @returns {{show: boolean, firstDataIndex: number}} 중략 표시 여부와 첫 데이터 인덱스
   * @description 첫 번째 데이터가 있는 계급 이전에 빈 계급이 CONFIG.ELLIPSIS_THRESHOLD개 이상이면 중략 표시
   * @example
   * shouldShowEllipsis([{frequency: 0}, {frequency: 0}, {frequency: 5}])
   * // { show: false, firstDataIndex: -1 } (threshold 이하)
   */
  static shouldShowEllipsis(classes) {
    const firstDataIndex = classes.findIndex(classData => classData.frequency > 0);

    // 첫 데이터가 threshold 이하 계급에 있으면 중략 불필요
    if (firstDataIndex <= CONFIG.ELLIPSIS_THRESHOLD) {
      return { show: false, firstDataIndex: -1 };
    }

    return { show: true, firstDataIndex };
  }

  /**
   * 차트 데이터를 JSON으로 내보내기
   * @param {Object} layerManager - 레이어 매니저 인스턴스
   * @param {Object} timeline - 타임라인 인스턴스
   * @param {Object} chartRenderer - 차트 렌더러 인스턴스 (좌표 시스템 정보)
   * @returns {Object} JSON 형식의 차트 데이터
   * @description 레이어 구조와 애니메이션 정보를 JSON으로 직렬화
   */
  static exportChartData(layerManager, timeline, chartRenderer = null) {
    /**
     * 레이어를 재귀적으로 직렬화
     * @param {Object} layer - 레이어 객체
     * @returns {Object} 직렬화된 레이어
     */
    const serializeLayer = (layer) => {
      const serialized = {
        id: layer.id || 'unknown',
        name: layer.name || layer.id || 'Untitled',
        type: layer.type || 'group',
        visible: layer.visible !== undefined ? layer.visible : true,
        order: layer.order !== undefined ? layer.order : 0,
        p_id: layer.p_id || null,
        children: [],
        data: {}
      };

      // 레이어 데이터 추가 (data 속성이 있으면)
      if (layer.data && typeof layer.data === 'object') {
        serialized.data = { ...layer.data };
      }

      // 자식 레이어 재귀 직렬화
      if (layer.children && Array.isArray(layer.children) && layer.children.length > 0) {
        serialized.children = layer.children.map(serializeLayer);
      }

      return serialized;
    };

    // root 레이어 직렬화
    const rootLayer = layerManager.root || layerManager.rootLayer;
    if (!rootLayer) {
      throw new Error('Root layer not found');
    }

    const serializedRoot = serializeLayer(rootLayer);

    // 타임라인 애니메이션 정보
    let animations = [];

    // timeline.animations가 Map인 경우
    if (timeline.animations instanceof Map) {
      animations = Array.from(timeline.animations.entries()).map(([layerId, anim]) => ({
        layerId: layerId,
        startTime: anim.startTime || 0,
        duration: anim.duration || 1000,
        effect: anim.effect || 'auto',
        effectOptions: anim.effectOptions || {},
        easing: anim.easing || 'linear'
      }));
    }
    // timeline.animations가 배열인 경우
    else if (Array.isArray(timeline.animations)) {
      animations = timeline.animations.map(anim => ({
        layerId: anim.layerId,
        startTime: anim.startTime || 0,
        duration: anim.duration || 1000,
        effect: anim.effect || 'auto',
        effectOptions: anim.effectOptions || {},
        easing: anim.easing || 'linear'
      }));
    }
    // timeline.timeline 배열이 있는 경우
    else if (Array.isArray(timeline.timeline)) {
      animations = timeline.timeline.map(anim => ({
        layerId: anim.layerId,
        startTime: anim.startTime || 0,
        duration: anim.duration || 1000,
        effect: anim.effect || 'auto',
        effectOptions: anim.effectOptions || {},
        easing: anim.easing || 'linear'
      }));
    }

    // 차트 설정 정보 (좌표 시스템, 축 라벨, 데이터 타입 등)
    const chartConfig = {};

    if (chartRenderer) {
      // 좌표 시스템 정보
      if (chartRenderer.currentCoords) {
        chartConfig.coords = {
          xScale: chartRenderer.currentCoords.xScale,
          chartH: chartRenderer.currentCoords.chartH,
          gridDivisions: chartRenderer.currentCoords.gridDivisions,
          adjustedMaxY: chartRenderer.currentCoords.adjustedMaxY
        };
      }

      // 축 라벨
      if (chartRenderer.currentAxisLabels) {
        chartConfig.axisLabels = chartRenderer.currentAxisLabels;
      }

      // 데이터 타입
      if (chartRenderer.currentDataType) {
        chartConfig.dataType = chartRenderer.currentDataType;
      }

      // 중략 정보
      if (chartRenderer.currentEllipsisInfo) {
        chartConfig.ellipsisInfo = chartRenderer.currentEllipsisInfo;
      }

      // 차트 요소 표시 설정
      chartConfig.chartElements = {
        showHistogram: CONFIG.SHOW_HISTOGRAM,
        showPolygon: CONFIG.SHOW_POLYGON,
        showBarLabels: CONFIG.SHOW_BAR_LABELS,
        showDashedLines: CONFIG.SHOW_DASHED_LINES
      };

      // 격자선 설정
      chartConfig.gridSettings = {
        showHorizontal: CONFIG.GRID_SHOW_HORIZONTAL,
        showVertical: CONFIG.GRID_SHOW_VERTICAL
      };

      // 축 라벨 설정
      chartConfig.axisLabelSettings = {
        showYLabels: CONFIG.AXIS_SHOW_Y_LABELS,
        showXLabels: CONFIG.AXIS_SHOW_X_LABELS
      };

      // 캔버스 크기
      if (chartRenderer.canvas) {
        chartConfig.canvasSize = {
          width: chartRenderer.canvas.width,
          height: chartRenderer.canvas.height
        };
      }

      // 테이블 데이터
      if (chartRenderer.currentClasses && chartRenderer.currentTableConfig) {
        const total = chartRenderer.currentClasses.reduce((sum, c) => sum + c.frequency, 0);
        chartConfig.tableData = {
          classes: chartRenderer.currentClasses,
          total: total,
          config: chartRenderer.currentTableConfig
        };
      }
    }

    return {
      version: '3.0.0',
      root: serializedRoot,
      timeline: {
        animations: animations,
        currentTime: timeline.currentTime || 0,
        duration: timeline.duration || 0
      },
      chartConfig: chartConfig
    };
  }
}

export default DataProcessor;
