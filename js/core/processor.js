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
   * parseInput("16*18") // [16, 16, ...(18번)]
   * parseInput("40*2 50*11") // 40 2개, 50 11개
   */
  static parseInput(input) {
    const tokens = input.split(/[,\s]+/);
    const result = [];

    tokens.forEach(token => {
      // 숫자*반복횟수 패턴 체크 (예: 16*18, -5*3, 3.14*2)
      const repeatMatch = token.match(/^(-?\d+\.?\d*)\*(\d+)$/);
      if (repeatMatch) {
        const value = Number(repeatMatch[1]);
        const count = parseInt(repeatMatch[2], 10);
        if (!isNaN(value) && isFinite(value) && count > 0) {
          for (let i = 0; i < count; i++) {
            result.push(value);
          }
        }
      } else {
        const num = Number(token);
        if (!isNaN(num) && isFinite(num)) {
          result.push(num);
        }
      }
    });

    return result;
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

    // 최대값을 포함하는 계급까지 생성
    let i = 0;
    let classMax = 0;

    while (classMax <= max || i < classCount) {
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

      // 최대값을 포함하는 계급을 생성한 후 종료
      if (classMax > max && i >= classCount) break;
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
      const maxDisplay = CONFIG.OUT_OF_RANGE_MAX_DISPLAY;
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
   * 차트 및 테이블 데이터를 JSON으로 내보내기
   * @param {Object} chartLayerManager - 차트 레이어 매니저 인스턴스
   * @param {Object} chartTimeline - 차트 타임라인 인스턴스
   * @param {Object} chartRenderer - 차트 렌더러 인스턴스 (좌표 시스템 정보)
   * @param {Array<Object>} tableRenderers - 테이블 렌더러 배열 (옵셔널)
   * @returns {Object} JSON 형식의 차트 및 테이블 데이터
   * @description 레이어 구조와 애니메이션 정보를 JSON으로 직렬화
   */
  static exportData(chartLayerManager, chartTimeline, chartRenderer = null, tableRenderers = []) {
    const defaults = CONFIG.JSON_DEFAULTS;

    /**
     * 레이어를 재귀적으로 직렬화 (기본값 생략)
     * @param {Object} layer - 레이어 객체
     * @returns {Object} 직렬화된 레이어
     */
    const serializeLayer = (layer) => {
      // 필수 필드만 포함
      const serialized = {
        id: layer.id || 'unknown',
        name: layer.name || layer.id || 'Untitled',
        type: layer.type || 'group'
      };

      // 기본값과 다른 경우만 포함
      const visible = layer.visible !== undefined ? layer.visible : true;
      if (visible !== defaults.layer.visible) {
        serialized.visible = visible;
      }

      const order = layer.order !== undefined ? layer.order : 0;
      if (order !== defaults.layer.order) {
        serialized.order = order;
      }

      const p_id = layer.p_id || null;
      if (p_id !== defaults.layer.p_id) {
        serialized.p_id = p_id;
      }

      // 레이어별 색상 정보 추가
      const currentPreset = CONFIG.POLYGON_COLOR_PRESETS[CONFIG.POLYGON_COLOR_PRESET] || CONFIG.POLYGON_COLOR_PRESETS.default;

      if (layer.id === 'polygon') {
        serialized.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
      } else if (layer.id === 'points') {
        serialized.color = currentPreset.pointColor;
      } else if (layer.id === 'lines') {
        serialized.color = `linear-gradient(180deg, ${currentPreset.gradientStart} 0%, ${currentPreset.gradientEnd} 100%)`;
      } else if (layer.id === 'histogram') {
        const barColorStart = CONFIG.getColor('--chart-bar-color');
        const barColorEnd = CONFIG.getColor('--chart-bar-color-end');
        serialized.color = `linear-gradient(180deg, ${barColorStart} 0%, ${barColorEnd} 100%)`;
      } else if (layer.id === 'dashed-lines') {
        serialized.color = CONFIG.getColor('--chart-dashed-line-color');
      }

      // 레이어 데이터 추가 (비어있지 않은 경우만)
      if (layer.data && typeof layer.data === 'object' && Object.keys(layer.data).length > 0) {
        serialized.data = { ...layer.data };
      }

      // 자식 레이어 재귀 직렬화 (비어있지 않은 경우만)
      if (layer.children && Array.isArray(layer.children) && layer.children.length > 0) {
        serialized.children = layer.children.map(serializeLayer);
      }

      return serialized;
    };

    // 차트 root 레이어 직렬화
    const chartRootLayer = chartLayerManager.root || chartLayerManager.rootLayer;
    if (!chartRootLayer) {
      throw new Error('Chart root layer not found');
    }

    const serializedChartRoot = serializeLayer(chartRootLayer);

    /**
     * 애니메이션 객체 정규화 (기본값 생략)
     * @param {Object} anim - 애니메이션 객체
     * @param {string} layerId - 레이어 ID
     * @returns {Object} 정규화된 애니메이션
     */
    const normalizeAnimation = (anim, layerId = null) => {
      const result = {
        layerId: layerId || anim.layerId
      };

      const startTime = anim.startTime || 0;
      if (startTime !== defaults.animation.startTime) {
        result.startTime = startTime;
      }

      const duration = anim.duration || 1000;
      if (duration !== defaults.animation.duration) {
        result.duration = duration;
      }

      const effect = anim.effect || 'auto';
      if (effect !== defaults.animation.effect) {
        result.effect = effect;
      }

      // effectOptions: 비어있지 않은 경우만 포함
      if (anim.effectOptions && Object.keys(anim.effectOptions).length > 0) {
        result.effectOptions = anim.effectOptions;
      }

      const easing = anim.easing || 'linear';
      if (easing !== defaults.animation.easing) {
        result.easing = easing;
      }

      return result;
    };

    // 차트 타임라인 애니메이션 정보
    let chartAnimations = [];

    if (chartTimeline.animations instanceof Map) {
      chartAnimations = Array.from(chartTimeline.animations.entries())
        .map(([layerId, anim]) => normalizeAnimation(anim, layerId));
    } else if (Array.isArray(chartTimeline.animations)) {
      chartAnimations = chartTimeline.animations.map(anim => normalizeAnimation(anim));
    } else if (Array.isArray(chartTimeline.timeline)) {
      chartAnimations = chartTimeline.timeline.map(anim => normalizeAnimation(anim));
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

      // 차트 요소 표시 설정 (기본값과 다른 경우만 포함)
      const chartElements = {};
      if (CONFIG.SHOW_HISTOGRAM !== defaults.chartElements.showHistogram) {
        chartElements.showHistogram = CONFIG.SHOW_HISTOGRAM;
      }
      if (CONFIG.SHOW_POLYGON !== defaults.chartElements.showPolygon) {
        chartElements.showPolygon = CONFIG.SHOW_POLYGON;
      }
      if (CONFIG.SHOW_BAR_LABELS !== defaults.chartElements.showBarLabels) {
        chartElements.showBarLabels = CONFIG.SHOW_BAR_LABELS;
      }
      if (CONFIG.SHOW_DASHED_LINES !== defaults.chartElements.showDashedLines) {
        chartElements.showDashedLines = CONFIG.SHOW_DASHED_LINES;
      }
      if (Object.keys(chartElements).length > 0) {
        chartConfig.chartElements = chartElements;
      }

      // 격자선 설정 (기본값과 다른 경우만 포함)
      const gridSettings = {};
      if (CONFIG.GRID_SHOW_HORIZONTAL !== defaults.gridSettings.showHorizontal) {
        gridSettings.showHorizontal = CONFIG.GRID_SHOW_HORIZONTAL;
      }
      if (CONFIG.GRID_SHOW_VERTICAL !== defaults.gridSettings.showVertical) {
        gridSettings.showVertical = CONFIG.GRID_SHOW_VERTICAL;
      }
      if (Object.keys(gridSettings).length > 0) {
        chartConfig.gridSettings = gridSettings;
      }

      // 축 라벨 설정 (기본값과 다른 경우만 포함)
      const axisLabelSettings = {};
      if (CONFIG.AXIS_SHOW_Y_LABELS !== defaults.axisLabelSettings.showYLabels) {
        axisLabelSettings.showYLabels = CONFIG.AXIS_SHOW_Y_LABELS;
      }
      if (CONFIG.AXIS_SHOW_X_LABELS !== defaults.axisLabelSettings.showXLabels) {
        axisLabelSettings.showXLabels = CONFIG.AXIS_SHOW_X_LABELS;
      }
      if (Object.keys(axisLabelSettings).length > 0) {
        chartConfig.axisLabelSettings = axisLabelSettings;
      }

      // 색상 프리셋 정보 (기본값과 다른 경우만 포함)
      if (CONFIG.POLYGON_COLOR_PRESET !== defaults.colorPreset) {
        chartConfig.colorPreset = CONFIG.POLYGON_COLOR_PRESET;
      }

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

    // 테이블 레이어 직렬화
    const tables = [];
    if (tableRenderers && tableRenderers.length > 0) {
      tableRenderers.forEach((tableRenderer, index) => {
        try {
          const tableLayerManager = tableRenderer.getLayerManager();
          const tableTimeline = tableRenderer.timeline;

          if (!tableLayerManager) {
            console.warn(`테이블 ${index + 1} LayerManager를 찾을 수 없습니다.`);
            return;
          }

          const tableRootLayer = tableLayerManager.root || tableLayerManager.rootLayer;
          if (!tableRootLayer) {
            console.warn(`테이블 ${index + 1} root 레이어를 찾을 수 없습니다.`);
            return;
          }

          const serializedTableRoot = serializeLayer(tableRootLayer);

          // 테이블 타임라인 애니메이션 정보 (normalizeAnimation 재사용)
          let tableAnimations = [];
          if (tableTimeline) {
            if (tableTimeline.animations instanceof Map) {
              tableAnimations = Array.from(tableTimeline.animations.entries())
                .map(([layerId, anim]) => normalizeAnimation(anim, layerId));
            } else if (Array.isArray(tableTimeline.animations)) {
              tableAnimations = tableTimeline.animations.map(anim => normalizeAnimation(anim));
            } else if (Array.isArray(tableTimeline.timeline)) {
              tableAnimations = tableTimeline.timeline.map(anim => normalizeAnimation(anim));
            }
          }

          // 테이블 데이터 구성 (기본값 생략)
          const tableData = {
            id: tableRenderer.tableId || `table-${index + 1}`,
            canvasId: tableRenderer.canvasId || `frequencyTable-${index + 1}`,
            root: serializedTableRoot
          };

          // 타임라인 (애니메이션이 있거나 기본값과 다른 경우만 포함)
          const tableTimelineData = {};
          if (tableAnimations.length > 0) {
            tableTimelineData.animations = tableAnimations;
          }
          const tableCurrentTime = tableTimeline?.currentTime || 0;
          if (tableCurrentTime !== defaults.timeline.currentTime) {
            tableTimelineData.currentTime = tableCurrentTime;
          }
          const tableDuration = tableTimeline?.duration || 0;
          if (tableDuration !== defaults.timeline.duration) {
            tableTimelineData.duration = tableDuration;
          }
          if (Object.keys(tableTimelineData).length > 0) {
            tableData.timeline = tableTimelineData;
          }

          tables.push(tableData);
        } catch (error) {
          console.error(`테이블 ${index + 1} 직렬화 오류:`, error);
        }
      });
    }

    // 차트 타임라인 구성 (기본값 생략)
    const chartTimelineData = {};
    if (chartAnimations.length > 0) {
      chartTimelineData.animations = chartAnimations;
    }
    const chartCurrentTime = chartTimeline.currentTime || 0;
    if (chartCurrentTime !== defaults.timeline.currentTime) {
      chartTimelineData.currentTime = chartCurrentTime;
    }
    const chartDuration = chartTimeline.duration || 0;
    if (chartDuration !== defaults.timeline.duration) {
      chartTimelineData.duration = chartDuration;
    }

    // 최종 결과 구성
    const result = {
      version: '4.0.0',
      chart: {
        root: serializedChartRoot
      }
    };

    // 타임라인 (비어있지 않은 경우만 포함)
    if (Object.keys(chartTimelineData).length > 0) {
      result.chart.timeline = chartTimelineData;
    }

    // config (비어있지 않은 경우만 포함)
    if (Object.keys(chartConfig).length > 0) {
      result.chart.config = chartConfig;
    }

    // 테이블 (비어있지 않은 경우만 포함)
    if (tables.length > 0) {
      result.tables = tables;
    }

    return result;
  }

  /**
   * JSON 데이터 불러오기 (기본값 복원)
   * @param {Object} jsonData - 경량화된 JSON 데이터
   * @returns {Object} 기본값이 복원된 데이터 객체
   * @description 생략된 필드에 기본값을 적용하여 완전한 데이터 구조 복원
   */
  static importData(jsonData) {
    const defaults = CONFIG.JSON_DEFAULTS;
    const version = jsonData.version || '3.0.0';

    /**
     * 레이어 역직렬화 (기본값 적용)
     * @param {Object} layerData - 직렬화된 레이어 데이터
     * @returns {Object} 기본값이 복원된 레이어
     */
    const deserializeLayer = (layerData) => {
      return {
        id: layerData.id,
        name: layerData.name || layerData.id,
        type: layerData.type || 'group',
        visible: layerData.visible ?? defaults.layer.visible,
        order: layerData.order ?? defaults.layer.order,
        p_id: layerData.p_id ?? defaults.layer.p_id,
        color: layerData.color || null,
        children: (layerData.children || []).map(deserializeLayer),
        data: layerData.data || {}
      };
    };

    /**
     * 애니메이션 역직렬화 (기본값 적용)
     * @param {Object} anim - 직렬화된 애니메이션 데이터
     * @returns {Object} 기본값이 복원된 애니메이션
     */
    const deserializeAnimation = (anim) => {
      return {
        layerId: anim.layerId,
        startTime: anim.startTime ?? defaults.animation.startTime,
        duration: anim.duration ?? defaults.animation.duration,
        effect: anim.effect ?? defaults.animation.effect,
        effectOptions: anim.effectOptions || {},
        easing: anim.easing ?? defaults.animation.easing
      };
    };

    /**
     * 차트 설정 역직렬화 (기본값 병합)
     * @param {Object} config - 직렬화된 설정 데이터
     * @returns {Object} 기본값이 복원된 설정
     */
    const deserializeConfig = (config) => {
      if (!config) return null;

      return {
        chartElements: {
          ...defaults.chartElements,
          ...config.chartElements
        },
        gridSettings: {
          ...defaults.gridSettings,
          ...config.gridSettings
        },
        axisLabelSettings: {
          ...defaults.axisLabelSettings,
          ...config.axisLabelSettings
        },
        colorPreset: config.colorPreset ?? defaults.colorPreset,
        coords: config.coords || null,
        axisLabels: config.axisLabels || null,
        dataType: config.dataType || null,
        ellipsisInfo: config.ellipsisInfo || null,
        canvasSize: config.canvasSize || null,
        tableData: config.tableData || null
      };
    };

    // 차트 데이터 복원
    const chartRoot = jsonData.chart?.root
      ? deserializeLayer(jsonData.chart.root)
      : null;

    const chartTimeline = {
      animations: (jsonData.chart?.timeline?.animations || []).map(deserializeAnimation),
      currentTime: jsonData.chart?.timeline?.currentTime ?? defaults.timeline.currentTime,
      duration: jsonData.chart?.timeline?.duration ?? defaults.timeline.duration
    };

    const chartConfig = deserializeConfig(jsonData.chart?.config);

    // 테이블 데이터 복원
    const tables = (jsonData.tables || []).map(table => ({
      id: table.id,
      canvasId: table.canvasId,
      root: deserializeLayer(table.root),
      timeline: {
        animations: (table.timeline?.animations || []).map(deserializeAnimation),
        currentTime: table.timeline?.currentTime ?? defaults.timeline.currentTime,
        duration: table.timeline?.duration ?? defaults.timeline.duration
      }
    }));

    return {
      version,
      chart: {
        root: chartRoot,
        timeline: chartTimeline,
        config: chartConfig
      },
      tables,
      // 원본 데이터 및 테이블 타입 (데이터셋 폼 복원용)
      rawData: jsonData.rawData || null,
      tableType: jsonData.tableType || 'frequency'
    };
  }
}

export default DataProcessor;
