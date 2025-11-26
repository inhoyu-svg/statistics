// ===== Color Utility Functions =====
// Extracted from lecture-template.js for better code organization

/**
 * Gets the highlight color from an element by checking highlight spans, element color, nearby elements, or defaults to green
 * @param {HTMLElement} element - The element to get the highlight color from
 * @returns {string} RGB color string
 */
export function getHighlightColor(element) {
    // 방어 코드: element가 유효한 DOM 요소인지 확인
    if (!element || !element.querySelectorAll || !(element instanceof HTMLElement)) {
        console.warn('[color-utils] Invalid element passed to getHighlightColor:', element);
        return getGreenColorFromCSS();
    }

    // 1. 하이라이트 스팬이 있는지 확인 (화살표만 있는 스팬 제외)
    const highlightSpans = element.querySelectorAll('[class*="highlight-"]');
    if (highlightSpans.length > 0) {
        for (const span of highlightSpans) {
            const text = span.textContent.trim();
            const onlyArrows = /^[▲▼◀▶\s]+$/.test(text);
            if (!onlyArrows) {
                const spanColor = window.getComputedStyle(span).color;
                if (!isWhiteColor(spanColor)) {
                    return spanColor;
                }
            }
        }
    }

    // 2. element 자체의 색상 확인
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;

    if (!isWhiteColor(color)) {
        return color;
    }

    // 3. 가까운 요소(형제, 부모)에서 색상 찾기
    const nearbyColor = findNearbyColor(element);
    if (nearbyColor) {
        return nearbyColor;
    }

    // 4. 기본값: CSS 초록색
    return getGreenColorFromCSS();
}

/**
 * Finds a non-white color from nearby elements (siblings or parent elements up to 3 levels)
 * @param {HTMLElement} element - The element to search from
 * @returns {string|null} RGB color string or null if not found
 */
export function findNearbyColor(element) {
    // 방어 코드: element가 유효한지 확인
    if (!element || !(element instanceof HTMLElement)) {
        return null;
    }

    // 형제 요소들 확인
    if (element.parentElement) {
        const siblings = Array.from(element.parentElement.children);
        for (const sibling of siblings) {
            if (sibling === element) continue;
            const siblingColor = window.getComputedStyle(sibling).color;
            if (!isWhiteColor(siblingColor)) {
                return siblingColor;
            }
        }
    }

    // 부모 요소들 확인 (최대 3단계)
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 3) {
        const parentColor = window.getComputedStyle(parent).color;
        if (!isWhiteColor(parentColor)) {
            return parentColor;
        }
        parent = parent.parentElement;
        depth++;
    }

    return null;
}

/**
 * Checks if a color is white or black (unusable colors)
 * @param {string} color - CSS color string (name, hex, or rgb/rgba)
 * @returns {boolean} True if color is white or black
 */
export function isWhiteColor(color) {
    if (!color) return true;

    const normalized = color.toLowerCase().replace(/\s/g, '');

    // 명시적 흰색 체크
    if (normalized === 'white' || normalized === '#ffffff' || normalized === '#fff') {
        return true;
    }

    // 명시적 검정색 체크
    if (normalized === 'black' || normalized === '#000000' || normalized === '#000') {
        return true;
    }

    // rgb/rgba 파싱
    const rgbMatch = normalized.match(/rgba?\((\d+),(\d+),(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        // RGB 값이 모두 230 이상이면 흰색으로 간주 (거의 흰색도 포함)
        if (r >= 230 && g >= 230 && b >= 230) {
            return true;
        }
        // RGB 값이 모두 30 이하면 검정색으로 간주 (거의 검정색도 포함)
        if (r <= 30 && g <= 30 && b <= 30) {
            return true;
        }
    }

    return false;
}

/**
 * Gets the green color defined in CSS by temporarily creating a highlight-green element
 * @returns {string} RGB color string of the CSS-defined green
 */
export function getGreenColorFromCSS() {
    const tempElement = document.createElement('span');
    tempElement.className = 'highlight-green';
    tempElement.style.display = 'none';
    document.body.appendChild(tempElement);
    const greenColor = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);
    return greenColor;
}
