/**
 * KaTeX 웹폰트 Canvas 렌더링 유틸리티
 * KaTeX 폰트를 Canvas에서 직접 사용하여 수학 스타일 텍스트 렌더링
 */

// 폰트 로드 상태
let fontsLoaded = false;

// KaTeX 폰트 패밀리
const KATEX_FONTS = {
  main: 'KaTeX_Main',      // 일반 숫자, 기호
  math: 'KaTeX_Math',      // 이탤릭 변수 (x, y, z)
  size1: 'KaTeX_Size1',    // 큰 기호
  ams: 'KaTeX_AMS'         // AMS 기호
};

/**
 * KaTeX 폰트 로드 대기
 * @param {number} timeout - 최대 대기 시간 (ms)
 * @returns {Promise<boolean>}
 */
export async function waitForFonts(timeout = 3000) {
  if (fontsLoaded) return true;

  try {
    // document.fonts API 사용
    if (document.fonts) {
      await Promise.race([
        document.fonts.ready,
        new Promise((_, reject) => setTimeout(() => reject('timeout'), timeout))
      ]);

      // KaTeX_Main 폰트 확인
      fontsLoaded = document.fonts.check('18px KaTeX_Main');
      if (!fontsLoaded) {
        // 폰트가 아직 없으면 약간 더 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        fontsLoaded = document.fonts.check('18px KaTeX_Main');
      }
    }
  } catch (e) {
    console.warn('폰트 로드 대기 중 오류:', e);
  }

  return fontsLoaded;
}

/**
 * 텍스트 타입 감지
 * @param {string} text - 분석할 텍스트
 * @returns {'number'|'variable'|'text'|'mixed'} 텍스트 타입
 */
function detectTextType(text) {
  const str = String(text).trim();

  // 숫자만 (소수점, 음수 포함)
  if (/^-?\d+\.?\d*$/.test(str)) {
    return 'number';
  }

  // 소문자 알파벳 (변수) - 이탤릭
  if (/^[a-z]$/.test(str)) {
    return 'variable';
  }

  // 대문자 알파벳 - regular
  if (/^[A-Z]$/.test(str)) {
    return 'text';
  }

  return 'mixed';
}

/**
 * 텍스트 타입에 따른 폰트 반환
 * @param {string} textType - 텍스트 타입
 * @param {number} fontSize - 폰트 크기
 * @param {boolean} italic - 이탤릭 여부
 * @returns {string} CSS font 문자열
 */
function getFont(textType, fontSize, italic = false) {
  const style = italic ? 'italic ' : '';

  switch (textType) {
    case 'number':
    case 'text':
      // 숫자, 대문자 알파벳: regular
      return `${fontSize}px ${KATEX_FONTS.main}, Times New Roman, serif`;
    case 'variable':
      // 소문자 알파벳: 이탤릭
      return `italic ${fontSize}px ${KATEX_FONTS.math}, ${KATEX_FONTS.main}, Times New Roman, serif`;
    default:
      return `${style}${fontSize}px ${KATEX_FONTS.main}, Times New Roman, serif`;
  }
}

/**
 * Canvas에 수학 스타일 텍스트 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} text - 렌더링할 텍스트
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
export function renderMathText(ctx, text, x, y, options = {}) {
  const {
    fontSize = 18,
    color = '#e5e7eb',
    align = 'left',
    baseline = 'middle',
    italic = null  // null이면 자동 감지
  } = options;

  ctx.save();

  const textType = detectTextType(text);
  const useItalic = italic !== null ? italic : textType === 'variable';

  ctx.font = getFont(textType, fontSize, useItalic);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  ctx.fillText(text, x, y);

  const metrics = ctx.measureText(text);
  const width = metrics.width;
  const height = fontSize;

  ctx.restore();

  return { width, height };
}

/**
 * Canvas에 첨자가 있는 텍스트 렌더링 (예: x², A₁)
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} base - 기본 텍스트
 * @param {string} superscript - 위 첨자 (선택)
 * @param {string} subscript - 아래 첨자 (선택)
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
export function renderWithScript(ctx, base, superscript, subscript, x, y, options = {}) {
  const {
    fontSize = 18,
    color = '#e5e7eb',
    align = 'left',
    baseline = 'middle'
  } = options;

  ctx.save();
  ctx.fillStyle = color;

  // 기본 텍스트
  const baseType = detectTextType(base);
  ctx.font = getFont(baseType, fontSize);
  ctx.textAlign = 'left';
  ctx.textBaseline = baseline;

  // 정렬 처리를 위한 전체 너비 계산
  const baseMetrics = ctx.measureText(base);
  const scriptFontSize = fontSize * 0.7;
  ctx.font = getFont('number', scriptFontSize);

  let totalWidth = baseMetrics.width;
  if (superscript) totalWidth += ctx.measureText(superscript).width;
  if (subscript) totalWidth += ctx.measureText(subscript).width;

  // 시작 위치 계산
  let startX = x;
  if (align === 'center') {
    startX = x - totalWidth / 2;
  } else if (align === 'right') {
    startX = x - totalWidth;
  }

  // 기본 텍스트 그리기
  ctx.font = getFont(baseType, fontSize);
  ctx.textBaseline = baseline;
  ctx.fillText(base, startX, y);
  startX += baseMetrics.width;

  // 위 첨자 그리기
  if (superscript) {
    ctx.font = getFont('number', scriptFontSize);
    const superOffset = fontSize * 0.35;
    ctx.fillText(superscript, startX, y - superOffset);
    startX += ctx.measureText(superscript).width;
  }

  // 아래 첨자 그리기
  if (subscript) {
    ctx.font = getFont('number', scriptFontSize);
    const subOffset = fontSize * 0.2;
    ctx.fillText(subscript, startX, y + subOffset);
  }

  ctx.restore();

  return { width: totalWidth, height: fontSize };
}

/**
 * Canvas에 분수 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} numerator - 분자
 * @param {string} denominator - 분모
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
export function renderFraction(ctx, numerator, denominator, x, y, options = {}) {
  const {
    fontSize = 18,
    color = '#e5e7eb',
    align = 'center',
    baseline = 'middle'
  } = options;

  ctx.save();
  ctx.fillStyle = color;

  const fracFontSize = fontSize * 0.75;
  ctx.font = getFont('number', fracFontSize);

  // 분자, 분모 너비 측정
  const numWidth = ctx.measureText(numerator).width;
  const denWidth = ctx.measureText(denominator).width;
  const lineWidth = Math.max(numWidth, denWidth) + 4;

  // 전체 크기
  const totalWidth = lineWidth;
  const totalHeight = fontSize * 1.5;

  // 시작 위치 계산
  let startX = x;
  if (align === 'center') {
    startX = x - totalWidth / 2;
  } else if (align === 'right') {
    startX = x - totalWidth;
  }

  let startY = y;
  if (baseline === 'middle') {
    startY = y;
  } else if (baseline === 'top') {
    startY = y + totalHeight / 2;
  } else if (baseline === 'bottom') {
    startY = y - totalHeight / 2;
  }

  // 분자 그리기
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(numerator, startX + lineWidth / 2, startY - 2);

  // 분수선 그리기
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + lineWidth, startY);
  ctx.stroke();

  // 분모 그리기
  ctx.textBaseline = 'top';
  ctx.fillText(denominator, startX + lineWidth / 2, startY + 2);

  ctx.restore();

  return { width: totalWidth, height: totalHeight };
}

/**
 * 간편 API: 텍스트를 자동으로 분석하여 렌더링
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} text - 렌더링할 텍스트 (예: "145", "x", "x^2", "1/2")
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {Object} options - 옵션
 * @returns {{width: number, height: number}} 렌더링된 크기
 */
export function render(ctx, text, x, y, options = {}) {
  const str = String(text).trim();

  // 분수 패턴 (예: 1/2, a/b)
  const fractionMatch = str.match(/^(.+)\/(.+)$/);
  if (fractionMatch && !str.includes(' ')) {
    return renderFraction(ctx, fractionMatch[1], fractionMatch[2], x, y, options);
  }

  // 첨자 패턴 (예: x^2, A_1, x^2_1)
  const scriptMatch = str.match(/^([^_^]+)(?:\^([^_]+))?(?:_(.+))?$/);
  if (scriptMatch && (scriptMatch[2] || scriptMatch[3])) {
    return renderWithScript(ctx, scriptMatch[1], scriptMatch[2], scriptMatch[3], x, y, options);
  }

  // 일반 텍스트
  return renderMathText(ctx, str, x, y, options);
}

/**
 * 폰트 로드 상태 확인
 * @returns {boolean}
 */
export function isFontsLoaded() {
  return fontsLoaded;
}

export default {
  waitForFonts,
  render,
  renderMathText,
  renderWithScript,
  renderFraction,
  isFontsLoaded
};
