// ===== Focus/Test Utility Functions =====
// Extracted from lecture-template.js for better code organization

/**
 * Adds a focus test border to a target element and creates an overlay
 * @param {string} targetElementId - The ID of the element to add border to
 */
export function addFocusTestBorder(targetElementId) {
    if (!targetElementId) return;

    // 기존 오버레이 제거
    removeFocusTestOverlay();

    // 타겟 요소에 약한 테두리 추가 (원본 요소 표시용)
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
        targetElement.classList.add('focus-test-border');
    }

    // 70px 여백을 가진 고정 오버레이 추가
    addFocusTestOverlay();
}

/**
 * Removes all focus test borders and overlay
 */
export function removeFocusTestBorder() {
    const focusedElements = document.querySelectorAll('.focus-test-border');
    focusedElements.forEach(element => {
        element.classList.remove('focus-test-border');
    });
    removeFocusTestOverlay();
    if (focusedElements.length > 0) {
        console.log(`테스트 테두리 제거: ${focusedElements.length}개 요소`);
    }
}

/**
 * Creates and adds a focus test overlay to the document body
 */
export function addFocusTestOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'focusTestOverlay';
    overlay.className = 'focus-test-overlay';
    document.body.appendChild(overlay);
}

/**
 * Removes the focus test overlay from the document
 */
export function removeFocusTestOverlay() {
    const overlay = document.getElementById('focusTestOverlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Updates the focus hole overlay to highlight a specific element
 * @param {string} targetElementId - The ID of the element to focus on
 */
export function updateFocusHole(targetElementId) {
    const overlay = document.getElementById('focusOverlay');
    if (!overlay) {
        return;
    }

    if (!targetElementId) {
        // 포커스 해제
        overlay.style.clipPath = '';
        return;
    }

    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        console.warn(`updateFocusHole: 요소를 찾을 수 없습니다 - ${targetElementId}`);
        overlay.style.clipPath = '';
        return;
    }

    // 요소의 위치와 크기 계산
    const rect = targetElement.getBoundingClientRect();
    const padding = 20; // 포커스 구멍 주변 여백

    // clip-path를 사용하여 구멍 생성
    const clipPath = `polygon(
        0% 0%,
        0% 100%,
        ${rect.left - padding}px 100%,
        ${rect.left - padding}px ${rect.top - padding}px,
        ${rect.right + padding}px ${rect.top - padding}px,
        ${rect.right + padding}px ${rect.bottom + padding}px,
        ${rect.left - padding}px ${rect.bottom + padding}px,
        ${rect.left - padding}px 100%,
        100% 100%,
        100% 0%
    )`;

    overlay.style.clipPath = clipPath;
}
