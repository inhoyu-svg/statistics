/**
 * 유틸리티 함수 모음
 */

import CONFIG from '../config.js';

class Utils {
  /**
   * 숫자를 지정된 소수점 자릿수로 포맷
   */
  static formatNumber(num, decimals = CONFIG.DECIMAL_PLACES) {
    return Number(num).toFixed(decimals);
  }

  /**
   * 숫자를 포맷하고 불필요한 .00 제거
   * @param {number} num - 포맷할 숫자
   * @param {number} decimals - 소수점 자릿수
   * @returns {string} 포맷된 숫자 (불필요한 .00 제거)
   */
  static formatNumberClean(num, decimals = CONFIG.DECIMAL_PLACES) {
    const formatted = Number(num).toFixed(decimals);
    // .00 제거 (예: 20.00 → 20, 33.33은 유지)
    return formatted.replace(/\.00$/, '');
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
   * HTML 특수문자 이스케이프 (XSS 방어)
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  static escapeHtml(text) {
    if (text === null || text === undefined) return '';

    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * 계급명 생성 헬퍼 (min~max 형식)
   * @param {Object} classData - 계급 데이터 ({ min, max })
   * @returns {string} 계급명 (예: "140~150")
   */
  static getClassName(classData) {
    return `${classData.min}~${classData.max}`;
  }

  /**
   * 수직 그라디언트 생성 (Canvas)
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x - 시작 X 좌표
   * @param {number} y - 시작 Y 좌표
   * @param {number} height - 그라디언트 높이
   * @param {string} startColor - 시작 색상
   * @param {string} endColor - 끝 색상
   * @returns {CanvasGradient} 그라디언트 객체
   */
  static createVerticalGradient(ctx, x, y, height, startColor, endColor) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }

  /**
   * 선 그라디언트 생성 (Canvas) - 두 점 사이
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} x1 - 시작 X
   * @param {number} y1 - 시작 Y
   * @param {number} x2 - 끝 X
   * @param {number} y2 - 끝 Y
   * @param {string} startColor - 시작 색상
   * @param {string} endColor - 끝 색상
   * @returns {CanvasGradient} 그라디언트 객체
   */
  static createLineGradient(ctx, x1, y1, x2, y2, startColor, endColor) {
    const gradient = ctx.createLinearGradient(x1, Math.min(y1, y2), x2, Math.max(y1, y2));
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }

  /**
   * 타임스탬프 문자열 생성 (YYYYMMDD-HHmmss 형식)
   * @param {Date} date - Date 객체 (기본값: 현재 시간)
   * @returns {string} 포맷된 타임스탬프
   */
  static formatTimestamp(date = new Date()) {
    return date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0') + '-' +
      String(date.getHours()).padStart(2, '0') +
      String(date.getMinutes()).padStart(2, '0') +
      String(date.getSeconds()).padStart(2, '0');
  }

  /**
   * 상대도수 포맷팅 (설정에 따라 백분율 또는 소수)
   * @param {number} percentValue - 백분율 값 (예: 15 = 15%)
   * @param {string} format - 'percent' 또는 'decimal'
   * @returns {string} 포맷된 문자열
   */
  static formatRelativeFrequency(percentValue, format = 'percent') {
    if (format === 'percent') {
      // 백분율 형식: 15%
      return `${this.formatNumberClean(percentValue)}%`;
    } else {
      // 소수 형식: 0.15
      const decimalValue = percentValue / 100;
      return this.formatDecimalValue(decimalValue);
    }
  }

  /**
   * 소수 값 포맷팅 (끝자리 0 생략, 무한소수 처리)
   * @param {number} value - 소수 값 (예: 0.15)
   * @returns {string} 포맷된 문자열
   */
  static formatDecimalValue(value) {
    // 정수인 경우 (1, 0 등)
    if (Number.isInteger(value)) {
      return String(value);
    }

    // 소수점 4자리까지 확인하여 무한소수 판별
    const str4 = value.toFixed(4);
    const decimal4 = str4.split('.')[1];

    // 같은 숫자가 반복되는지 확인 (예: 3333, 6666)
    const isRepeating = decimal4 && /^(\d)\1{3}$/.test(decimal4);

    if (isRepeating) {
      // 무한소수: 0.33..
      const str2 = value.toFixed(2);
      return `${str2}..`;
    }

    // 일반 소수: 끝자리 0 생략
    const str = value.toFixed(CONFIG.DECIMAL_PLACES);
    // 끝자리 0 제거 (0.30 → 0.3, 0.10 → 0.1, 0.00 → 0)
    return str.replace(/\.?0+$/, '') || '0';
  }

}

export default Utils;
