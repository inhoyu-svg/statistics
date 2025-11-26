// ===== Review Utility Functions =====
// Extracted from lecture-template.js for better code organization

/**
 * Extracts review context from a cut object
 * @param {Object} cut - The cut object containing targetElement
 * @returns {Object|null} Object with frameIndex and reviewNumber, or null if no review found
 */
export function extractReviewContext(cut) {
    // targetElement에서 review 번호 추출 (예: focusReviewTitle1_1 -> {frame: 1, review: 1})
    if (!cut.targetElement) return null;

    const match = cut.targetElement.match(/focusReview(?:Title|Content)?(\d+)_(\d+)/);
    if (match) {
        return {
            frameIndex: cut.frameIndex,
            reviewNumber: `${match[1]}_${match[2]}` // 예: "1_1"
        };
    }
    return null;
}

/**
 * Checks if two review contexts represent the same review transition
 * @param {Object} prevContext - Previous review context
 * @param {Object} currentContext - Current review context
 * @returns {boolean} True if both contexts represent the same review
 */
export function isSameReviewTransition(prevContext, currentContext) {
    if (!prevContext || !currentContext) return false;
    return prevContext.frameIndex === currentContext.frameIndex &&
        prevContext.reviewNumber === currentContext.reviewNumber;
}

/**
 * Extracts review number from an element ID
 * @param {string} elementId - Element ID (e.g., focusReviewTitle1_1, focusReview1_1)
 * @returns {string|null} Review number (e.g., "1_1") or null if not found
 */
export function extractReviewNumber(elementId) {
    if (!elementId) return null;
    // focusReview, focusReviewTitle, focusReviewContent, visualizationContainer 모두 매칭
    const match = elementId.match(/(?:focusReview(?:Title|Content)?|visualizationContainer)(\d+)_(\d+)/);
    return match ? `${match[1]}_${match[2]}` : null;
}

/**
 * Checks if an element ID represents the first review
 * @param {string} elementId - Element ID (e.g., focusReviewTitle1_1)
 * @returns {boolean} True if it's the first review (second number is 1)
 */
export function isFirstReview(elementId) {
    if (!elementId) return false;
    const match = elementId.match(/focusReview(?:Title|Content)?(\d+)_(\d+)/);
    return match && match[2] === '1'; // 두 번째 숫자가 1이면 첫 번째 review
}
