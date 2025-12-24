/**
 * 데이터 처리 레이어
 * 통계 계산 및 계급 생성 로직
 */

import CONFIG from '../config.js';
import Utils from '../utils/utils.js';
import MessageManager from '../utils/message.js';
import DataExporter from './serializer/DataExporter.js';
import DataImporter from './serializer/DataImporter.js';

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
   * @precondition viz-api에서 ConfigValidator.validate()로 먼저 검증됨
   * @param {number[]} data - 숫자 배열
   * @returns {{min: number, max: number, range: number, mean: number, median: number, count: number}} 통계 객체
   * @throws {Error} 데이터가 비어있는 경우 (방어적 검증)
   * @example
   * calculateBasicStats([1, 2, 3, 4, 5])
   * // { min: 1, max: 5, range: 4, mean: 3, median: 3, count: 5 }
   */
  static calculateBasicStats(data) {
    // 방어적 검증: ConfigValidator에서 이미 검증되었지만, 직접 호출 시 안전장치
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
   * @param {Object|null} customRange - 커스텀 범위 설정 { firstStart, secondStart, lastEnd }
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
   * @precondition viz-api에서 ConfigValidator.validate()로 classRange 검증됨
   * @param {Object} customRange - { firstStart, secondStart, lastEnd }
   * @returns {{classes: Array, classWidth: number}} 계급 배열과 계급 간격
   * @throws {Error} 범위 값이 논리적으로 올바르지 않은 경우 (방어적 검증)
   * @description
   * - firstStart: 전체 구간의 시작값 (첫 계급 시작)
   * - secondStart: 두 번째 계급의 시작값 (간격 결정용)
   * - lastEnd: 전체 구간의 끝값 (마지막 계급 끝)
   * @example
   * // { firstStart: 12, secondStart: 14, lastEnd: 22 }
   * // → 간격 2, 계급: 0~12(빈), 12~14, 14~16, 16~18, 18~20, 20~22
   */
  static createCustomRangeClasses(customRange) {
    const { firstStart, secondStart, lastEnd } = customRange;

    // 방어적 검증: ConfigValidator에서 이미 검증되었지만, 직접 호출 시 안전장치
    if (firstStart < 0) {
      throw new Error('첫 계급의 시작값은 0 이상이어야 합니다.');
    }
    if (secondStart <= firstStart) {
      throw new Error('두 번째 계급의 시작값은 첫 계급의 시작값보다 커야 합니다.');
    }
    if (lastEnd <= secondStart) {
      throw new Error('마지막 계급의 끝값은 두 번째 계급의 시작값보다 커야 합니다.');
    }

    // 간격 계산 (첫 번째와 두 번째 계급 시작값의 차이)
    const classWidth = secondStart - firstStart;

    // 간격으로 나누어 떨어지는지 검증
    const totalRange = lastEnd - firstStart;
    if (totalRange % classWidth !== 0) {
      console.warn(`classRange 경고: 전체 범위(${totalRange})가 간격(${classWidth})으로 나누어 떨어지지 않습니다.`);
    }

    const classes = [];

    // firstStart가 0보다 크면 0~firstStart 빈 구간 추가 (중략 표시용)
    if (firstStart > 0) {
      classes.push({
        min: 0,
        max: firstStart,
        frequency: 0,
        data: [],
        midpoint: firstStart / 2
      });
    }

    // firstStart부터 lastEnd까지 classWidth 간격으로 계급 생성
    let currentMin = firstStart;
    while (currentMin < lastEnd) {
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

    // lastEnd 이후에 빈 구간 추가 (축 라벨 표시용)
    classes.push({
      min: lastEnd,
      max: lastEnd + classWidth,
      frequency: 0,
      data: [],
      midpoint: lastEnd + (classWidth / 2)
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

    // 첫 번째 계급에 데이터가 있으면 마지막 빈 구간 제거 (왼쪽 여유 없으면 오른쪽도 없애기)
    if (classes.length >= 2 && classes[0].frequency > 0) {
      const lastClass = classes[classes.length - 1];
      if (lastClass.frequency === 0) {
        classes.pop();
      }
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

    // 첫 데이터가 없으면 중략 불필요
    if (firstDataIndex === -1) {
      return { show: false, firstDataIndex: -1 };
    }

    // 기존 조건: 첫 데이터가 threshold 이상 계급에 있으면 중략 필요
    if (firstDataIndex >= CONFIG.ELLIPSIS_THRESHOLD) {
      return { show: true, firstDataIndex };
    }

    // 추가 조건: 첫 계급이 비어있고 범위가 크면 중략 필요 (커스텀 범위 대응)
    if (firstDataIndex >= 1 && classes[0].frequency === 0) {
      const firstClassRange = classes[0].max - classes[0].min;
      const classWidth = classes.length >= 2 ? classes[1].max - classes[1].min : firstClassRange;
      // 첫 계급의 범위가 일반 계급 간격의 threshold배 이상이면 중략 표시
      if (firstClassRange >= classWidth * CONFIG.ELLIPSIS_THRESHOLD) {
        return { show: true, firstDataIndex };
      }
    }

    return { show: false, firstDataIndex };
  }

  /**
   * 차트 및 테이블 데이터를 JSON으로 내보내기
   * @deprecated DataExporter.exportData()를 직접 사용하세요
   * @see DataExporter
   */
  static exportData(chartLayerManager, chartTimeline, chartRenderer = null, tableRenderers = []) {
    return DataExporter.exportData(chartLayerManager, chartTimeline, chartRenderer, tableRenderers);
  }

  /**
   * JSON 데이터 불러오기 (기본값 복원)
   * @deprecated DataImporter.importData()를 직접 사용하세요
   * @see DataImporter
   */
  static importData(jsonData) {
    return DataImporter.importData(jsonData);
  }
}

export default DataProcessor;
