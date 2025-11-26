/**
 * Summary Manager Module
 * Handles summary mode display, reveal elements, and auto-scaling
 */

import { getControlledElements, updateSceneBorderReveal } from '../frame/scene-manager.js';
import { playSoundForElementById } from '../shared/media/sound-manager.js';
import { applyCameraFocus } from '../camera/camera-system.js';

/**
 * Extract summary contents from DOM
 * @param {Object} instance - LectureTemplate instance
 */
export function extractSummaryContents(instance) {
    const summaryOverlay = document.getElementById('summaryOverlay');
    if (!summaryOverlay) {
        console.log('summary-overlay가 없습니다.');
        return;
    }

    const summaryContentElements = summaryOverlay.querySelectorAll('.summary-content');
    instance.summaryContents = Array.from(summaryContentElements);

    console.log(`${instance.summaryContents.length}개의 summary-content를 찾았습니다.`);

    // Hide all summary-content initially
    instance.summaryContents.forEach(content => {
        content.classList.remove('active');
    });

    // Hide all progressive elements in summary-overlay
    const allControlledElements = getControlledElements(summaryOverlay);

    allControlledElements.forEach(element => {
        element.classList.remove('reveal');
    });

    console.log('summary-overlay의 모든 progressive 요소들 초기 숨김 완료');
}

/**
 * Show summary overlay with specified index
 * @param {Object} instance - LectureTemplate instance
 * @param {number} summaryIndex - Index of summary to show
 */
export function showSummary(instance, summaryIndex) {
    const summaryOverlay = document.getElementById('summaryOverlay');
    if (!summaryOverlay) return;

    if (summaryIndex < 0 || summaryIndex >= instance.summaryContents.length) {
        console.warn(`유효하지 않은 summary 인덱스: ${summaryIndex}`);
        return;
    }

    instance.isSummaryMode = true;
    instance.currentSummaryIndex = summaryIndex;

    // Reset border state for all summary scenes
    const summaryContent = instance.summaryContents[summaryIndex];
    const summaryScenes = summaryContent.querySelectorAll('.math-scene.summary-scene');
    summaryScenes.forEach(scene => {
        const sceneTag = scene.querySelector('.scene-tag');
        const sceneTagId = sceneTag?.getAttribute('id');
        if (sceneTagId) {
            instance.scenesBorderRevealed.set(sceneTagId, false);
            scene.classList.add('pending-border-reveal');
        }
    });
    console.log(`Summary ${summaryIndex}의 모든 씬 border 상태 초기화`);

    summaryOverlay.classList.add('active');

    summaryContent.classList.add('active');
    summaryContent.classList.add('entering');

    console.log(`Summary ${summaryIndex} 표시`);
}

/**
 * Hide summary overlay
 * @param {Object} instance - LectureTemplate instance
 */
export function hideSummary(instance) {
    const summaryOverlay = document.getElementById('summaryOverlay');
    if (!summaryOverlay) return;

    // Apply exiting animation to current summary-content
    if (instance.currentSummaryIndex >= 0 && instance.currentSummaryIndex < instance.summaryContents.length) {
        const summaryContent = instance.summaryContents[instance.currentSummaryIndex];
        summaryContent.classList.add('exiting');
        summaryContent.classList.remove('entering');

        setTimeout(() => {
            summaryContent.classList.remove('active', 'exiting');
        }, 800);
    }

    // Hide summary overlay
    setTimeout(() => {
        summaryOverlay.classList.remove('active');
        instance.isSummaryMode = false;
        instance.currentSummaryIndex = -1;
        console.log('Summary 숨김 완료');
    }, 800);
}

/**
 * Handle summary-type cut
 * @param {Object} instance - LectureTemplate instance
 * @param {Object} cut - Cut object
 * @param {number} cutNum - Cut number
 */
export function handleSummaryCut(instance, cut, cutNum) {
    console.log(`Summary Cut 처리: ${cut.name}, frameIndex: ${cut.frameIndex}`);

    const summaryIndex = instance.summaryContents.findIndex(content => {
        const frameIndex = parseInt(content.getAttribute('data-frame-index'));
        return frameIndex === cut.frameIndex;
    });

    if (summaryIndex === -1) {
        console.error(`frameIndex ${cut.frameIndex}에 해당하는 summary-content를 찾을 수 없습니다.`);
        return;
    }

    showSummary(instance, summaryIndex);

    // Process reveal_elements in summary-overlay
    if (cut.revealElements && cut.revealElements.length > 0) {
        updateRevealElementsInSummary(instance, cut.revealElements, summaryIndex, cut.cutType);
    }

    // Apply zoom in/out in Summary mode
    const summaryContent = instance.summaryContents[summaryIndex];
    const summaryMainContainer = summaryContent.querySelector('.main-container');

    applyCameraFocus(summaryMainContainer, cut);

    instance.currentCut = cutNum;
    instance.updateUI();
}

/**
 * Update reveal elements in summary mode
 * @param {Object} instance - LectureTemplate instance
 * @param {Array} revealElements - Array of element IDs to reveal
 * @param {number} summaryIndex - Summary index
 * @param {string|null} cutType - Cut type
 */
export function updateRevealElementsInSummary(instance, revealElements, summaryIndex, cutType = null) {
    if (summaryIndex < 0 || summaryIndex >= instance.summaryContents.length) return;

    const summaryContent = instance.summaryContents[summaryIndex];

    const allControlledElements = getControlledElements(summaryContent);

    // Remove reveal class from all elements
    allControlledElements.forEach(element => {
        element.classList.remove('reveal');
    });

    // Add reveal class to specified elements
    revealElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('reveal');

            // Remove inline styles set by streaming mode
            element.style.opacity = '';
            element.style.visibility = '';

            // Play sound effect once
            if (!element.hasAttribute('data-sound-played')) {
                playSoundForElementById(element.id);
                element.setAttribute('data-sound-played', 'true');
            }

            // Add tag-animate class for scene-tag
            if (element.classList.contains('scene-tag')) {
                element.classList.add('tag-animate');
            }

            // Add mask reveal animation for titles
            if (element.classList.contains('scene-title') ||
                element.classList.contains('main-title') ||
                element.classList.contains('today-definition-text')) {
                element.classList.add('reveal-animate');
            }

            // Find child titles and add animation
            const childTitles = element.querySelectorAll('.scene-title, .main-title, .today-definition-text');
            childTitles.forEach(childTitle => {
                childTitle.classList.add('reveal');
                childTitle.classList.add('reveal-animate');

                if (element.id === 'focusTitle1') {
                    childTitle.style.animationDelay = '0.3s';
                }
            });
        }
    });

    // Review dimming handling
    updateReviewDimming(revealElements, cut?.targetElement);

    // Auto-scale summary content area
    autoScaleSummaryContent(summaryContent, cutType);

    // Handle summary scene borders
    const allSummaryScenes = summaryContent.querySelectorAll('.math-scene.summary-scene');
    allSummaryScenes.forEach(scene => {
        updateSceneBorderReveal(instance, scene, revealElements, false, cutType);
    });

    console.log(`Summary ${summaryIndex}의 Reveal elements 업데이트 완료:`, revealElements);
}

/**
 * Update review dimming state
 * @param {Array} revealElements - Array of element IDs to reveal
 * @param {string|null} targetElement - Target element ID
 */
export function updateReviewDimming(revealElements, targetElement) {
    const allReviewScenes = document.querySelectorAll('[id^="focusReview"]');

    allReviewScenes.forEach(reviewScene => {
        const reviewId = reviewScene.id;

        if (revealElements.includes(reviewId)) {
            if (!targetElement) {
                reviewScene.classList.remove('review-dim');
                reviewScene.classList.add('review-active');
            } else {
                const targetEl = document.getElementById(targetElement);
                const isActiveReview = targetEl && reviewScene.contains(targetEl);

                if (isActiveReview) {
                    reviewScene.classList.remove('review-dim');
                    reviewScene.classList.add('review-active');
                } else {
                    reviewScene.classList.remove('review-active');
                    reviewScene.classList.add('review-dim');
                }
            }
        } else {
            reviewScene.classList.remove('review-dim', 'review-active');
        }
    });
}

/**
 * Auto-scale summary content to fit viewport
 * @param {HTMLElement} summaryContent - Summary content element
 * @param {string|null} cutType - Cut type
 */
export function autoScaleSummaryContent(summaryContent, cutType = null) {
    setTimeout(() => {
        const contentArea = summaryContent.querySelector('.content-area');
        if (!contentArea) return;

        const allChildren = Array.from(contentArea.children);
        const visibleElements = allChildren.filter(child => {
            const style = window.getComputedStyle(child);
            return style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                style.display !== 'none';
        });

        if (visibleElements.length === 0) return;

        const contentAreaStyle = window.getComputedStyle(contentArea);
        const gap = parseFloat(contentAreaStyle.gap) || 0;

        let actualWidth = contentArea.scrollWidth;
        let actualHeight = contentArea.scrollHeight;

        const maxHeight = 820;

        if (cutType === 'scene_overview') {
            console.log(`scene_overview 계산 시작, visibleElements 개수: ${visibleElements.length}`);

            const allRevealedElements = summaryContent.querySelectorAll('[style*="visibility: visible"]');
            console.log(`visibility: visible인 요소 개수: ${allRevealedElements.length}`);

            if (allRevealedElements.length === 0) {
                console.warn('reveal된 요소가 없습니다. 기본 로직으로 전환');
                const viewportWidth = window.innerWidth * 0.90;
                const viewportHeight = window.innerHeight * 0.80;
                const scaleX = actualWidth > viewportWidth ? viewportWidth / actualWidth : 1;
                const scaleY = actualHeight > viewportHeight ? viewportHeight / actualHeight : 1;
                const finalScale = Math.min(scaleX, scaleY, 1);

                contentArea.style.transform = `scale(${finalScale})`;
                contentArea.style.transformOrigin = 'center center';
                contentArea.style.transition = 'transform 0.8s ease-in-out';
            } else {
                let minY = Infinity;
                let maxY = -Infinity;
                const contentAreaRect = contentArea.getBoundingClientRect();

                allRevealedElements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    const relativeTop = rect.top - contentAreaRect.top;
                    const relativeBottom = relativeTop + rect.height;

                    console.log(`요소 ${element.id || 'unknown'}: top=${relativeTop.toFixed(0)}px, bottom=${relativeBottom.toFixed(0)}px, height=${rect.height.toFixed(0)}px`);

                    minY = Math.min(minY, relativeTop);
                    maxY = Math.max(maxY, relativeBottom);
                });

                console.log(`바운딩 박스: minY=${minY.toFixed(0)}px, maxY=${maxY.toFixed(0)}px`);

                actualHeight = maxY - minY;

                const finalScale = (maxHeight / actualHeight) * 0.7;

                contentArea.style.transform = `scale(${finalScale})`;
                contentArea.style.transformOrigin = 'center center';
                contentArea.style.transition = 'transform 0.8s ease-in-out';

                console.log(`scene_overview 타입: maxHeight=${maxHeight}px, actualHeight=${actualHeight.toFixed(0)}px, scale=${finalScale.toFixed(3)}`);
            }
        } else {
            const viewportWidth = window.innerWidth * 0.90;
            const viewportHeight = window.innerHeight * 0.80;

            const scaleX = actualWidth > viewportWidth ? viewportWidth / actualWidth : 1;
            const scaleY = actualHeight > viewportHeight ? viewportHeight / actualHeight : 1;
            const finalScale = Math.min(scaleX, scaleY, 1);

            contentArea.style.transform = `scale(${finalScale})`;
            contentArea.style.transformOrigin = 'center center';
            contentArea.style.transition = 'transform 0.5s ease-in-out';
        }

        console.log(`Summary 콘텐츠 자동 축소: 표시된 요소: ${visibleElements.length}개, 실제 크기: ${actualWidth.toFixed(0)}x${actualHeight.toFixed(0)}px, gap: ${gap}px, cutType: ${cutType || 'none'}`);
    }, 100);
}
