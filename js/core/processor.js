/**
 * 데이터 처리 레이어
 * 통계 계산 및 계급 생성 로직
 */

import Utils from '../utils/utils.js';
import MessageManager from '../utils/message.js';

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
   * 계급 구간 생성 (0부터 시작, 끝에 빈 구간 추가)
   */
  static createClasses(stats, classCount, customWidth = null) {
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

  /**
   * 중략 표시가 필요한지 판단
   * 첫 번째 데이터가 있는 계급 이전에 빈 계급이 3개 이상이면 중략 표시
   */
  static shouldShowEllipsis(classes) {
    const firstDataIndex = classes.findIndex(c => c.frequency > 0);

    // 첫 데이터가 0번째 계급이거나, 1~2번째 계급이면 중략 불필요
    if (firstDataIndex <= 2) {
      return { show: false, firstDataIndex: -1 };
    }

    return { show: true, firstDataIndex };
  }
}

export default DataProcessor;
