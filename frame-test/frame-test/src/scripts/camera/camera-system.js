/**
 * Camera System Module
 * Handles all camera positioning, scaling, and focus calculations
 */

import { updateFocusHole, addFocusTestBorder, removeFocusTestBorder } from '../shared/utils/focus-utils.js';
import { log, warn, error } from '../shared/utils/logger.js';

/**
 * Calculate content area size based on visible children
 * @param {HTMLElement} containerElement - Container element
 * @returns {Object|null} Size object with width, height, and bounds
 */
export function calculateContentAreaSize(containerElement) {
    const contentArea = containerElement.querySelector('.content-area');
    if (!contentArea) return null;

    const visibleChildren = Array.from(contentArea.children).filter(child => {
        const style = window.getComputedStyle(child);
        return style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            style.display !== 'none';
    });

    if (visibleChildren.length === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    visibleChildren.forEach(child => {
        const rect = child.getBoundingClientRect();
        const contentAreaRect = contentArea.getBoundingClientRect();

        const relativeLeft = rect.left - contentAreaRect.left;
        const relativeTop = rect.top - contentAreaRect.top;
        const relativeRight = relativeLeft + rect.width;
        const relativeBottom = relativeTop + rect.height;

        minX = Math.min(minX, relativeLeft);
        minY = Math.min(minY, relativeTop);
        maxX = Math.max(maxX, relativeRight);
        maxY = Math.max(maxY, relativeBottom);
    });

    const totalWidth = maxX - minX;
    const totalHeight = maxY - minY;

    return {
        width: totalWidth,
        height: totalHeight,
        minX,
        minY,
        maxX,
        maxY
    };
}

/**
 * Calculate scale for target element or full frame
 * @param {Object} instance - LectureTemplate instance
 * @param {string|null} targetElementId - Target element ID or null for full frame
 * @param {HTMLElement|null} containerElement - Container element or null to use current frame
 * @returns {number} Calculated scale value
 */
export function calculateScale(instance, targetElementId, containerElement = null) {
    if (!containerElement) {
        const currentFrame = instance.frames[instance.currentFrameIndex];
        if (!currentFrame) return 1;
        containerElement = currentFrame.element;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const currentTransform = containerElement.style.transform;
    let currentScale = 1;

    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
    if (scaleMatch) {
        currentScale = parseFloat(scaleMatch[1]);
    }

    // Calculate based on full content-area if no targetElement
    if (!targetElementId) {
        const contentAreaSize = calculateContentAreaSize(containerElement);
        if (!contentAreaSize) return 1;

        const padding = 100;
        const desiredWidth = contentAreaSize.width + (padding * 2);
        const desiredHeight = contentAreaSize.height + (padding * 2);

        const scaleX = viewportWidth / desiredWidth;
        const scaleY = viewportHeight / desiredHeight;

        let calculatedScale = Math.min(scaleX, scaleY);

        const minScale = 0.5;
        const maxScale = 1.5;

        let finalScale = Math.max(minScale, Math.min(maxScale, calculatedScale));

        const devicePixelRatio = window.devicePixelRatio || 1;
        if (devicePixelRatio > 1) {
            finalScale = finalScale * Math.min(devicePixelRatio * 0.8, 1.2);
        }

        log(`전체 프레임 스케일 계산: ${finalScale.toFixed(3)}, 콘텐츠 크기: ${contentAreaSize.width.toFixed(0)}x${contentAreaSize.height.toFixed(0)}px`);
        return finalScale;
    }

    // Individual element focus scale calculation
    let targetElement = document.getElementById(targetElementId);
    if (!targetElement) return 1;

    // For visualizationContainer or any element inside math-scene, use the math-scene container
    const mathSceneParent = targetElement.closest('.math-scene');
    if (mathSceneParent) {
        targetElement = mathSceneParent;
        log(`math-scene 컨테이너 감지: math-scene을 중앙 배치 (${mathSceneParent.className})`);
    }

    const targetRect = targetElement.getBoundingClientRect();
    const targetWidth = targetRect.width / currentScale;
    const targetHeight = targetRect.height / currentScale;

    const padding = 150;  // Increased padding for better framing
    const desiredWidth = targetWidth + (padding * 2);
    const desiredHeight = targetHeight + (padding * 2);

    const scaleX = viewportWidth / desiredWidth;
    const scaleY = viewportHeight / desiredHeight;

    // Always use the minimum of both scales to ensure entire element fits
    let calculatedScale = Math.min(scaleX, scaleY);

    const minScale = 0.5;
    const maxScale = 1.2;  // Reduced max scale to prevent over-zooming

    let finalScale = Math.max(minScale, Math.min(maxScale, calculatedScale));

    const devicePixelRatio = window.devicePixelRatio || 1;
    if (devicePixelRatio > 1) {
        finalScale = finalScale * Math.min(devicePixelRatio * 0.8, 1.2);
    }

    return finalScale;
}

/**
 * Calculate height of reveal elements for overview scaling
 * @param {Array} revealElements - Array of element IDs to reveal
 * @param {HTMLElement} contentArea - Content area element
 * @returns {number} Calculated height in pixels
 */
export function calculateRevealElementsHeight(revealElements, contentArea) {
    if (!revealElements || revealElements.length === 0) return 0;

    let currentScale = 1;

    if (contentArea) {
        const transform = window.getComputedStyle(contentArea).transform;
        if (transform && transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            currentScale = matrix.a;
        }
    }

    const layoutClass = contentArea.className.match(/scene-layout-[\w-]+/)?.[0] || '';

    const sceneGroups = {};
    const scenePositions = {};

    revealElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const style = window.getComputedStyle(element);
            if (style.visibility !== 'hidden' && style.opacity !== '0') {
                const sceneElement = element.closest('.math-scene');
                if (sceneElement) {
                    const sceneId = sceneElement.querySelector('.scene-tag')?.id || 'default';
                    if (!sceneGroups[sceneId]) {
                        sceneGroups[sceneId] = [];
                        const sceneRect = sceneElement.getBoundingClientRect();
                        scenePositions[sceneId] = {
                            top: sceneRect.top,
                            left: sceneRect.left
                        };
                    }
                    sceneGroups[sceneId].push(element);
                }
            }
        }
    });

    let contentHeight = 0;

    const isGridLayout = layoutClass.includes('x');

    if (isGridLayout) {
        // Grid layout: calculate height per row
        const rows = {};
        const threshold = 50;

        Object.keys(sceneGroups).forEach(sceneId => {
            const sceneTop = scenePositions[sceneId].top;
            let foundRow = false;

            for (const rowKey in rows) {
                const rowTop = parseFloat(rowKey);
                if (Math.abs(sceneTop - rowTop) < threshold) {
                    rows[rowKey].push(sceneId);
                    foundRow = true;
                    break;
                }
            }

            if (!foundRow) {
                rows[sceneTop.toFixed(0)] = [sceneId];
            }
        });

        log(`  그리드 레이아웃 (${layoutClass}): ${Object.keys(rows).length}개 행 감지`);

        let totalHeight = 0;
        Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach((rowKey, rowIndex) => {
            const scenesInRow = rows[rowKey];
            let maxRowHeight = 0;

            scenesInRow.forEach(sceneId => {
                const elements = sceneGroups[sceneId];
                let sceneMinY = Infinity;
                let sceneMaxY = -Infinity;

                elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    sceneMinY = Math.min(sceneMinY, rect.top);
                    sceneMaxY = Math.max(sceneMaxY, rect.bottom);
                });

                if (sceneMinY !== Infinity && sceneMaxY !== -Infinity) {
                    const sceneHeight = (sceneMaxY - sceneMinY) / currentScale;
                    log(`    행${rowIndex + 1} 씬 "${sceneId}" 높이: ${sceneHeight.toFixed(0)}px`);
                    maxRowHeight = Math.max(maxRowHeight, sceneHeight);
                }
            });

            log(`    행${rowIndex + 1} 최대 높이: ${maxRowHeight.toFixed(0)}px`);
            totalHeight += maxRowHeight;
        });

        contentHeight = totalHeight;
        log(`Reveal 요소 높이 계산 (그리드 ${layoutClass}): 전체 높이=${contentHeight.toFixed(0)}px`);
    } else {
        // Vertical layout: use total height
        let globalMinY = Infinity;
        let globalMaxY = -Infinity;

        Object.keys(sceneGroups).forEach(sceneId => {
            const elements = sceneGroups[sceneId];
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                globalMinY = Math.min(globalMinY, rect.top);
                globalMaxY = Math.max(globalMaxY, rect.bottom);
            });
            log(`  씬 "${sceneId}" 포함됨`);
        });

        if (globalMinY !== Infinity && globalMaxY !== -Infinity) {
            contentHeight = (globalMaxY - globalMinY) / currentScale;
            log(`Reveal 요소 높이 계산 (세로배치 ${layoutClass}): 전체 높이=${contentHeight.toFixed(0)}px`);
        }
    }

    return contentHeight;
}

/**
 * Calculate position offset for target element
 * @param {string|null} targetElement - Target element ID
 * @returns {Object} Position object with x and y offsets
 */
export function calculatePosition(targetElement) {
    const positions = {
        title: { x: 0, y: 10 },
        card1: { x: 25, y: 15 },
        card2: { x: -25, y: 15 },
        card3: { x: 0, y: 25 },
        default: { x: 0, y: 0 }
    };

    if (!targetElement) return positions.default;

    if (targetElement && targetElement.includes('focusTitle')) return positions.title;

    const sceneMatch = targetElement.match(/focusScene\d+_(\d+)/);
    if (sceneMatch) {
        const sceneNum = parseInt(sceneMatch[1]);
        if (sceneNum === 1) return positions.card1;
        if (sceneNum === 2) return positions.card2;
        if (sceneNum === 3) return positions.card3;
    }

    if (targetElement.includes('Title')) return positions.title;

    return positions.default;
}

/**
 * Calculate camera position for target element
 * @param {Object} instance - LectureTemplate instance
 * @param {string} targetElementId - Target element ID
 * @returns {Object} Camera position with scale, translateX, translateY
 */
export function calculateCameraPosition(instance, targetElementId, cameraPosition = 'center') {
    if (!targetElementId) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    let targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        warn(`Target element not found: ${targetElementId}`);
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    // For any element inside math-scene, use the math-scene container
    const mathSceneParent = targetElement.closest('.math-scene');
    if (mathSceneParent) {
        log(`[Camera] math-scene 컨테이너 감지: math-scene을 중앙 배치 (${targetElementId} → ${mathSceneParent.className})`);
        targetElement = mathSceneParent;
    }

    // Special handling for reviewSceneTag
    if (targetElementId.startsWith('reviewSceneTag')) {
        log(`[reviewSceneTag] 뷰포트 정 가운데 배치: ${targetElementId}`);
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    // Special handling for Review Content/Visualization only (frame 0)
    if (targetElementId.match(/focusReviewContent\d+_\d+/) ||
        (targetElementId.match(/visualizationContainer1_\d+_\d+/) && instance.currentFrameIndex === 0)) {
        return calculateCameraPositionForReviewItem(instance, targetElementId);
    }

    // Determine container element
    let containerElement;
    if (instance.isSummaryMode && instance.currentSummaryIndex >= 0) {
        const summaryContent = instance.summaryContents[instance.currentSummaryIndex];
        containerElement = summaryContent.querySelector('.main-container');
    } else {
        const currentFrame = instance.frames[instance.currentFrameIndex];
        if (!currentFrame) {
            return { scale: 1, translateX: 0, translateY: 0 };
        }
        containerElement = currentFrame.element;
    }

    const scale = calculateScale(instance, targetElementId, containerElement);

    const containerRect = containerElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const targetCenterXInContainer = (targetRect.left + targetRect.width / 2) - containerRect.left;
    const targetCenterYInContainer = (targetRect.top + targetRect.height / 2) - containerRect.top;

    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    let offsetX, offsetY;

    // Apply camera position mode
    if (cameraPosition === 'top-center') {
        // Position element at 1/3 from top of viewport
        const containerTopThird = containerRect.height / 3;
        offsetX = containerCenterX - targetCenterXInContainer;
        offsetY = containerTopThird - targetCenterYInContainer;
        log(`카메라 위치 모드: top-center (1/3 지점)`);
    } else {
        // Default: center positioning
        offsetX = containerCenterX - targetCenterXInContainer;
        offsetY = containerCenterY - targetCenterYInContainer;
    }

    const translateX = (offsetX / containerRect.width) * 100;
    const translateY = (offsetY / containerRect.height) * 100;

    const position = { scale, translateX, translateY };

    log(`카메라 절대 위치: ${targetElementId}, mode: ${cameraPosition}, scale: ${scale}, translate: ${translateX.toFixed(1)}%, ${translateY.toFixed(1)}%`);
    return position;
}

/**
 * Calculate camera position for Review title with top-center positioning
 * @param {Object} instance - LectureTemplate instance
 * @param {string} reviewElementId - Review element ID
 * @param {string} cameraPosition - Camera position mode ('top-center' or 'center')
 * @returns {Object} Camera position with scale, translateX, translateY
 */
export function calculateCameraPositionForReviewTitle(instance, reviewElementId, cameraPosition = 'top-center') {
    if (!reviewElementId) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    const reviewElement = document.getElementById(reviewElementId);
    if (!reviewElement) {
        warn(`Review element not found: ${reviewElementId}`);
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    let containerElement;
    if (instance.isSummaryMode && instance.currentSummaryIndex >= 0) {
        const summaryContent = instance.summaryContents[instance.currentSummaryIndex];
        containerElement = summaryContent.querySelector('.main-container');
    } else {
        const currentFrame = instance.frames[instance.currentFrameIndex];
        if (!currentFrame) {
            return { scale: 1, translateX: 0, translateY: 0 };
        }
        containerElement = currentFrame.element;
    }

    const scale = calculateScale(instance, reviewElementId, containerElement);

    const containerRect = containerElement.getBoundingClientRect();
    const reviewRect = reviewElement.getBoundingClientRect();

    const reviewTitle = reviewElement.querySelector('.review-title');
    const titleRect = reviewTitle ? reviewTitle.getBoundingClientRect() : reviewRect;

    const reviewCenterXInContainer = (reviewRect.left + reviewRect.width / 2) - containerRect.left;

    let targetYInContainer;
    if (cameraPosition === 'top-center') {
        const titleTopInContainer = titleRect.top - containerRect.top;
        const titleCenterYInContainer = titleTopInContainer + titleRect.height / 2;
        const containerTopThird = containerRect.height / 3;
        targetYInContainer = titleCenterYInContainer - (containerTopThird - titleCenterYInContainer);
    } else {
        targetYInContainer = (reviewRect.top + reviewRect.height / 2) - containerRect.top;
    }

    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    const offsetX = containerCenterX - reviewCenterXInContainer;
    const offsetY = cameraPosition === 'top-center'
        ? containerRect.height / 3 - (titleRect.top - containerRect.top + titleRect.height / 2)
        : containerCenterY - targetYInContainer;

    const translateX = (offsetX / containerRect.width) * 100;
    const translateY = (offsetY / containerRect.height) * 100;

    const position = { scale, translateX, translateY };

    log(`[Review 카메라] ${reviewElementId}, position: ${cameraPosition}, scale: ${scale}, translate: ${translateX.toFixed(1)}%, ${translateY.toFixed(1)}%`);
    return position;
}

/**
 * Calculate camera position for Review content/visualization items
 * @param {Object} instance - LectureTemplate instance
 * @param {string} targetElementId - Target element ID
 * @returns {Object} Camera position with scale, translateX, translateY
 */
export function calculateCameraPositionForReviewItem(instance, targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    const isVisualization = targetElementId.includes('visualizationContainer');

    const match = targetElementId.match(/\d+_(\d+)/);
    const reviewNumber = match ? match[1] : null;

    const isSameReview = instance.currentReviewNumber === reviewNumber;

    if (!isVisualization) {
        instance.currentReviewNumber = reviewNumber;
    }

    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }
    const containerElement = currentFrame.element;

    const scale = calculateScale(instance, targetElementId, containerElement);
    const containerRect = containerElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const reviewContainer = targetElement.closest('[id^="focusReview"]');
    if (!reviewContainer) {
        return { scale: 1, translateX: 0, translateY: 0 };
    }

    let translateX, translateY;

    if (isVisualization) {
        const reviewContainerRect = reviewContainer.getBoundingClientRect();
        const reviewCenterXInContainer = (reviewContainerRect.left + reviewContainerRect.width / 2) - containerRect.left;
        const reviewCenterYInContainer = (reviewContainerRect.top + reviewContainerRect.height / 2) - containerRect.top;
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        const offsetX = containerCenterX - reviewCenterXInContainer;
        const offsetY = containerCenterY - reviewCenterYInContainer;
        translateX = (offsetX / containerRect.width) * 100;
        translateY = (offsetY / containerRect.height) * 100;
        instance.lastReviewTranslateY = translateY;
    } else if (isSameReview) {
        const reviewContainerRect = reviewContainer.getBoundingClientRect();
        const targetCenterXInContainer = (reviewContainerRect.left + reviewContainerRect.width / 2) - containerRect.left;
        const containerCenterX = containerRect.width / 2;
        const offsetX = containerCenterX - targetCenterXInContainer;
        translateX = (offsetX / containerRect.width) * 100;
        if (instance.lastReviewTranslateY !== undefined) {
            translateY = instance.lastReviewTranslateY;
        } else {
            translateY = 0;
        }
    } else {
        const reviewContainerRect = reviewContainer.getBoundingClientRect();
        const targetCenterXInContainer = (reviewContainerRect.left + reviewContainerRect.width / 2) - containerRect.left;
        let targetCenterYInContainer;
        const reviewTitle = reviewContainer.querySelector('.review-title');
        const titleRect = reviewTitle ? reviewTitle.getBoundingClientRect() : null;
        if (titleRect) {
            targetCenterYInContainer = (titleRect.top + titleRect.height / 2) - containerRect.top;
        } else {
            targetCenterYInContainer = (reviewContainerRect.top + reviewContainerRect.height / 2) - containerRect.top;
        }
        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;
        const offsetX = containerCenterX - targetCenterXInContainer;
        let offsetY;
        if (titleRect) {
            const titleCenterYInContainer = (titleRect.top + titleRect.height / 2) - containerRect.top;
            const desiredYPosition = containerRect.height * 0.4;
            offsetY = desiredYPosition - titleCenterYInContainer;
        } else {
            offsetY = containerCenterY - targetCenterYInContainer;
        }
        translateX = (offsetX / containerRect.width) * 100;
        translateY = (offsetY / containerRect.height) * 100;
        instance.lastReviewTranslateY = translateY;
    }

    const position = { scale, translateX, translateY };

    log(`[Review Item 카메라] ${targetElementId}, isVisualization: ${isVisualization}, isSameReview: ${isSameReview}, scale: ${scale}, translate: ${translateX.toFixed(1)}%, ${translateY.toFixed(1)}%`);
    return position;
}

/**
 * Apply camera focus with calculated position
 * @param {HTMLElement} container - Container element to apply transform
 * @param {Object} cut - Cut object with target and mode information
 * @param {boolean} skipTransition - Whether to skip transition animation
 */
export function applyCameraFocus(container, cut, skipTransition = false) {
    removeFocusTestBorder();

    if (cut.isOverviewMode || !cut.targetElement) {
        if (skipTransition) {
            container.style.transition = 'none';
        } else {
            container.style.transition = 'transform 0.8s ease-in-out';
        }
        container.style.transformOrigin = '50% 50%';
        container.style.transform = 'scale(1) translate(0, 0)';
    } else if (cut.targetElement) {
        if (skipTransition) {
            container.style.transition = 'none';
        } else {
            container.style.transition = 'transform 0.8s ease-in-out';
        }

        // Calculate and apply dynamic camera position
        // Note: This requires access to the instance's calculateCameraPosition method
        // In the actual implementation, this would be called from the cut-navigator
        container.style.transformOrigin = '50% 50%';
        // Transform will be set by the caller
    }
}

/**
 * Move content area to specific review position
 * @param {string} reviewNumber - Review number (format: "frameIndex_reviewIndex")
 * @param {HTMLElement} contentArea - Content area element
 */
export function moveContentAreaToReview(reviewNumber, contentArea) {
    if (!contentArea || !reviewNumber) return;

    const parts = reviewNumber.split('_');
    if (parts.length !== 2) return;

    const reviewIndex = parseInt(parts[1], 10);
    if (isNaN(reviewIndex)) return;

    const firstReviewId = `focusReview${parts[0]}_1`;
    const currentReviewId = `focusReview${reviewNumber}`;

    const firstReview = document.getElementById(firstReviewId);
    const currentReview = document.getElementById(currentReviewId);

    if (!firstReview || !currentReview) return;

    const firstRect = firstReview.getBoundingClientRect();
    const currentRect = currentReview.getBoundingClientRect();
    const offset = firstRect.left - currentRect.left;

    contentArea.style.transform = `translateX(${offset}px)`;
    contentArea.style.transition = 'transform 0.8s ease-out';

    log(`Content-area 이동: review ${reviewNumber}, offset: ${offset}px`);
}
