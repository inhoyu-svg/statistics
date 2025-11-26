/**
 * Scene Manager Module
 * Handles scene visibility, border reveals, and scene-specific logic
 */

import { createBorderSVG } from '../shared/effects/svg-effects.js';

/**
 * Update scene visibility based on current cut
 * @param {Object} instance - LectureTemplate instance
 * @param {number} cutNum - Current cut number
 */
export function updateSceneVisibility(instance, cutNum) {
    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) return;

    const currentCut = instance.allCuts.find(c => c.cutIndex === cutNum);
    if (!currentCut) return;

    const frameElement = currentFrame.element;
    const allScenes = frameElement.querySelectorAll('.math-scene');

    // Hide scenes when showing Frame Title
    if (currentCut.targetElement &&
        (currentCut.targetElement.match(/^focusTitle\d+$/))) {

        allScenes.forEach(scene => {
            scene.classList.add('future-scene');
        });

        console.log(`Frame Title 표시 중 - 모든 Scene 숨김`);

    } else {
        // Show scenes based on reveal_elements
        const scenesToShow = new Set();

        if (currentCut.revealElements && currentCut.revealElements.length > 0) {
            currentCut.revealElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element) {
                    const parentScene = element.closest('.math-scene');
                    if (parentScene) {
                        scenesToShow.add(parentScene);
                    }
                }
            });
        }

        // Hide all scenes first
        allScenes.forEach(scene => {
            scene.classList.add('future-scene');
        });

        // Show only scenes containing revealed elements
        scenesToShow.forEach(scene => {
            scene.classList.remove('future-scene');
        });

        // Update border state for all visible scenes
        const isTargetNull = !currentCut.targetElement;

        allScenes.forEach(scene => {
            if (!scene.classList.contains('future-scene')) {
                updateSceneBorderReveal(instance, scene, currentCut.revealElements, isTargetNull, currentCut.cutType);
            }
        });

        console.log(`표시할 Scene 개수: ${scenesToShow.size}`);
    }
}

/**
 * Update scene border reveal state
 * @param {Object} instance - LectureTemplate instance
 * @param {HTMLElement} scene - Scene element
 * @param {Array} revealElements - Array of element IDs to reveal
 * @param {boolean} isTargetNull - Whether target element is null
 * @param {string|null} cutType - Type of current cut
 */
export function updateSceneBorderReveal(instance, scene, revealElements, isTargetNull = false, cutType = null) {
    const sceneTag = scene.querySelector('.scene-tag');
    const sceneTagId = sceneTag?.getAttribute('id');

    if (!sceneTagId) return;

    const isTodayScene = scene.classList.contains('today-scene');
    const isSummaryScene = scene.classList.contains('summary-scene');
    const isReviewScene = scene.classList.contains('review-scene');

    if (isTodayScene || isSummaryScene || isReviewScene) {
        const sceneType = isTodayScene ? 'Today' : isSummaryScene ? 'Summary' : 'Review';

        if (isSummaryScene) {
            const isOverviewCut = cutType === 'outro_scene_overview';
            console.log(`${sceneType} Scene 체크: sceneTagId=${sceneTagId}, isOverviewCut=${isOverviewCut}, cutType=${cutType}`);

            if (isOverviewCut) {
                instance.scenesBorderRevealed.set(sceneTagId, true);
                console.log(`${sceneType} Scene border reveal 기록 (overview): ${sceneTag?.textContent || 'unknown'}`);
            }
        } else {
            const isSceneTagRevealed = revealElements && revealElements.includes(sceneTagId);
            console.log(`${sceneType} Scene 체크: sceneTagId=${sceneTagId}, isSceneTagRevealed=${isSceneTagRevealed}, revealElements=`, revealElements);

            if (isSceneTagRevealed) {
                instance.scenesBorderRevealed.set(sceneTagId, true);
                console.log(`${sceneType} Scene border reveal 기록 (태그 등장): ${sceneTag?.textContent || 'unknown'}`);
            }
        }
    } else {
        // Regular scenes: check if target_element is null and child elements are revealed
        if (isTargetNull) {
            const sceneChildren = scene.querySelectorAll('[id]');
            let hasChildRevealed = false;

            sceneChildren.forEach(child => {
                const childId = child.getAttribute('id');
                if (childId && childId !== sceneTagId &&
                    revealElements &&
                    revealElements.includes(childId)) {
                    hasChildRevealed = true;
                }
            });

            if (hasChildRevealed) {
                instance.scenesBorderRevealed.set(sceneTagId, true);
                console.log(`Scene border reveal 기록 (null + 내부요소 reveal): ${sceneTag?.textContent || 'unknown'}`);
            }
        }
    }

    const hasBorderBeenRevealed = instance.scenesBorderRevealed.get(sceneTagId) === true;

    if (hasBorderBeenRevealed) {
        scene.classList.remove('pending-border-reveal');
        const sceneTypeName = isTodayScene ? 'Today Scene' : isSummaryScene ? 'Summary Scene' : isReviewScene ? 'Review Scene' : 'Scene';
        console.log(`${sceneTypeName} border 표시 시작: ${sceneTag?.textContent || 'unknown'}, cutType=${cutType}`);

        const borderSvg = scene.querySelector('.border-svg');
        if (borderSvg && sceneTag) {
            if (sceneTag.classList.contains('reveal-focus')) {
                borderSvg.style.transition = 'opacity 0.8s ease-out';
                borderSvg.style.opacity = '1';
                console.log(`${sceneTypeName} SVG border 선명: scene-tag reveal-focus`);
            } else if (sceneTag.classList.contains('reveal-dimmed')) {
                borderSvg.style.transition = 'opacity 0.8s ease-out';
                borderSvg.style.opacity = '0.3';
                console.log(`${sceneTypeName} SVG border dimmed: scene-tag reveal-dimmed`);
            } else if (sceneTag.classList.contains('reveal')) {
                borderSvg.style.transition = 'opacity 0.8s ease-out';
                borderSvg.style.opacity = '1';
                console.log(`${sceneTypeName} SVG border 선명: scene-tag reveal`);
            }
        }

        if (!scene.classList.contains('border-animate')) {
            // Review Scene: adjust review area widths
            if (isReviewScene) {
                const reviewAreas = scene.querySelectorAll('[id^="focusReview"]');
                if (reviewAreas.length > 0) {
                    let maxWidth = 0;
                    reviewAreas.forEach(area => {
                        const width = area.offsetWidth;
                        if (width > maxWidth) {
                            maxWidth = width;
                        }
                    });

                    if (maxWidth > 0) {
                        reviewAreas.forEach(area => {
                            area.style.width = `${maxWidth}px`;
                        });
                        console.log(`Review Scene area 너비 조정: ${maxWidth}px`);
                    }
                }
            }

            // Determine border radius
            let borderRadius = 0;
            if (!isTodayScene && !scene.classList.contains('number-scene')) {
                const vw = window.innerWidth / 100;
                borderRadius = Math.max(15, Math.min(1.25 * vw + 5, 20));
            }

            createBorderSVG(scene, borderRadius);
            scene.classList.add('border-animate');
            console.log(`${sceneTypeName} SVG border 애니메이션 시작 (radius: ${borderRadius}): ${sceneTag?.textContent || 'unknown'}`);
        }
    } else {
        scene.classList.add('pending-border-reveal');
        const sceneTypeName = isTodayScene ? 'Today Scene' : isSummaryScene ? 'Summary Scene' : isReviewScene ? 'Review Scene' : 'Scene';
        console.log(`${sceneTypeName} border 숨김: ${sceneTag?.textContent || 'unknown'}`);
    }
}

/**
 * Hide all progressive elements initially
 * @param {Array} frames - Array of frame data objects
 */
export function hideAllProgressiveElements(frames) {
    frames.forEach(frame => {
        const allMathScenes = frame.element.querySelectorAll('.math-scene');
        const allControlledElements = getControlledElements(frame.element);

        allControlledElements.forEach(element => {
            element.classList.remove('reveal');
        });

        allMathScenes.forEach(scene => {
            scene.classList.add('future-scene');
        });
    });

    console.log('모든 progressive 요소들 초기 숨김 완료');
}

/**
 * Get all controlled elements in a container
 * @param {HTMLElement} containerElement - Container element
 * @returns {Array} Array of controlled elements
 */
export function getControlledElements(containerElement) {
    const allFocusElements = containerElement.querySelectorAll(
        '[id*="focus"]:not(#focusOverlay):not([class*="overlay"])'
    );
    const allSceneTags = containerElement.querySelectorAll('.scene-tag');
    const allReviewTitles = containerElement.querySelectorAll('.review-title');
    const allReviewContents = containerElement.querySelectorAll('.review-content');
    const allVisualizationContainers = containerElement.querySelectorAll('.visualization-container');
    const allChapterBadges = containerElement.querySelectorAll('.chapter-badge');
    return [...allFocusElements, ...allSceneTags, ...allReviewTitles, ...allReviewContents, ...allVisualizationContainers, ...allChapterBadges];
}
