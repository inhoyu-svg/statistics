/**
 * Reveal Manager Module
 * Handles reveal elements updates, dimming, and animations
 */

import { getControlledElements } from '../frame/scene-manager.js';
import { extractReviewNumber } from '../shared/utils/review-utils.js';
import { playSoundForElementById } from '../shared/media/sound-manager.js';
import { renderVisualization, renderVisualizations } from '../shared/media/visualization-renderer.js';
import { updateReviewDimming } from '../summary/summary-manager.js';
import { log, warn, error } from '../shared/utils/logger.js';

/**
 * Update reveal elements for current frame
 * @param {Object} instance - LectureTemplate instance
 * @param {Array} revealElements - Array of element IDs to reveal
 * @param {string|null} targetElement - Target element ID
 * @param {Object|null} currentCut - Current cut object
 */
export function updateRevealElements(instance, revealElements, targetElement = null, currentCut = null) {
    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) return;

    const allControlledElements = getControlledElements(currentFrame.element);

    console.log(`현재 프레임의 제어 가능 요소들 (총 ${allControlledElements.length}개):`,
        Array.from(allControlledElements).map(el => el.id));

    // Hide all elements if no revealElements
    if (!revealElements || revealElements.length === 0) {
        console.log(`>>>>>>> revealElements가 없어서 모든 요소 숨김`);
        allControlledElements.forEach(element => {
            element.classList.remove('reveal', 'reveal-dimmed', 'reveal-focus');
        });
        return;
    }

    // Pre-dimming for focus-area-title when today-scene.border-animate exists with content
    if (!targetElement) {
        const todayScenes = currentFrame.element.querySelectorAll('.math-scene.today-scene.border-animate');
        const hasTodayContent = todayScenes.length > 0 && revealElements.some(id =>
            id && id.includes('focus') && !id.includes('todaySceneTag')
        );

        if (todayScenes.length > 0 && hasTodayContent) {
            console.log(`  today-scene.border-animate + 내부 콘텐츠 발견 - focus-area-title dimmed 처리`);
            const focusAreaTitle = currentFrame.element.querySelector('.focus-area-title');
            if (focusAreaTitle && focusAreaTitle.classList.contains('reveal')) {
                focusAreaTitle.classList.add('reveal-dimmed');
                focusAreaTitle.classList.remove('reveal-focus');
                console.log(`  [PRE-LOOP] today-scene 시점: focus-area-title 강제 dimmed`);
            }
        }
    }

    // Pre-check for review title in reveal elements
    const hasReviewTitleInReveal = revealElements.some(id => id && id.includes('focusReviewTitle'));

    // Dim focus-area-title when review title appears
    if ((targetElement && targetElement.includes('focusReviewTitle')) || hasReviewTitleInReveal) {
        console.log(`  review-title 감지 (targetElement: ${targetElement}, hasInReveal: ${hasReviewTitleInReveal}) - focus-area-title dimmed 처리`);
        const focusAreaTitle = currentFrame.element.querySelector('.focus-area-title');
        if (focusAreaTitle && focusAreaTitle.classList.contains('reveal')) {
            focusAreaTitle.classList.add('reveal-dimmed');
            focusAreaTitle.classList.remove('reveal-focus');
            console.log(`  review-title 등장 시점: focus-area-title 강제 dimmed`);
        }
    }

    // Check for today-scene.border-animate (outside forEach for efficiency)
    const todaySceneBorderAnimate = currentFrame.element.querySelector('.math-scene.today-scene.border-animate') !== null;

    // Process each controlled element
    allControlledElements.forEach(element => {
        const shouldReveal = revealElements.includes(element.id);
        const isTargetElement = element.id === targetElement;
        const isSceneTag = element.classList.contains('scene-tag');
        const isVisualizationContainer = element.classList.contains('visualization-container');

        const isChapterBadge = element.classList.contains('chapter-badge');
        const isAlreadyRevealed = element.classList.contains('reveal');

        if (isChapterBadge) {
            console.log(`[chapter-badge] shouldReveal=${shouldReveal}, isAlreadyRevealed=${isAlreadyRevealed}, isTarget=${isTargetElement}, targetElement=${targetElement}, todayAnimate=${todaySceneBorderAnimate}`);
        }

        // Chapter badge continues processing if already revealed
        if (shouldReveal || (isChapterBadge && isAlreadyRevealed)) {
            element.classList.add('reveal');

            // Remove inline styles set by streaming mode
            element.style.opacity = '';
            element.style.visibility = '';

            // Play sound effect once
            if (!element.hasAttribute('data-sound-played')) {
                playSoundForElementById(element.id);
                element.setAttribute('data-sound-played', 'true');
            }

            // Visualization containers always get reveal-focus
            if (isVisualizationContainer) {
                element.classList.add('reveal-focus');
                element.classList.remove('reveal-dimmed');
                if (element.style.visibility === 'hidden' && element.style.opacity === '0') {
                    element.style.visibility = '';
                    element.style.opacity = '';
                    console.log(`  ${element.id} 시각화 컨테이너 visibility/opacity 복원`);
                }

                // Render visualization if not already rendered
                if (!element.hasAttribute('data-viz-rendered')) {
                    renderVisualization(element);
                    element.setAttribute('data-viz-rendered', 'true');
                }

                console.log(`  ${element.id} 시각화 컨테이너 표시됨`);
                return;
            }

            // Determine overview mode
            const cut = currentCut || instance.allCuts.find(c => c.cutIndex === instance.currentCut);
            const isOverviewMode = cut && cut.isOverviewMode;
            const isSceneOverview = cut && (
                cut.cutType === 'scene_overview' ||
                cut.cutType === 'outro_scene_overview' ||
                (isOverviewMode && !cut.targetElement)
            );

            // Track scene-tag first appearance
            const isSceneTagFirstAppearance = isSceneTag && !instance.sceneTagFirstAppearance.has(element.id);

            if (isSceneTagFirstAppearance) {
                instance.sceneTagFirstAppearance.set(element.id, true);
            }

            // Check if in same review
            const targetReviewNumber = targetElement ? extractReviewNumber(targetElement) : null;
            const elementReviewNumber = extractReviewNumber(element.id);
            const isSameReviewElement = targetReviewNumber && elementReviewNumber &&
                targetReviewNumber === elementReviewNumber;

            const isFocusAreaTitle = element.classList.contains('focus-area-title');

            const isTargetReviewTitle = targetElement && targetElement.includes('focusReviewTitle');

            // Apply dimming logic
            if (isSceneTag && isSceneOverview) {
                console.log(`  scene-tag "${element.id}" in overview: dimmed 제거`);
                element.classList.remove('reveal-dimmed');
                element.classList.remove('reveal-focus');
            } else if ((isTargetReviewTitle || hasReviewTitleInReveal) && isFocusAreaTitle && !isTargetElement) {
                console.log(`  [LOOP] review-title 감지: "${element.id}" dimmed 유지`);
                element.classList.add('reveal-dimmed');
                element.classList.remove('reveal-focus');
            } else if (isFocusAreaTitle && !isTargetElement && todaySceneBorderAnimate) {
                console.log(`  [LOOP] today-scene title: "${element.id}" dimmed 유지`);
                element.classList.add('reveal-dimmed');
                element.classList.remove('reveal-focus');
            } else if (isSceneTagFirstAppearance) {
                console.log(`  scene-tag 첫 등장: "${element.id}" dimmed 제거`);
                element.classList.remove('reveal-dimmed');
                element.classList.remove('reveal-focus');
            } else if (targetElement && !isOverviewMode && !isTargetElement && !isSameReviewElement) {
                element.classList.add('reveal-dimmed');
                element.classList.remove('reveal-focus');
            } else {
                element.classList.remove('reveal-dimmed');
                element.classList.remove('reveal-focus');
            }

            // Add tag-animate for scene-tag
            if (isSceneTag) {
                element.classList.add('tag-animate');
            }

            // Add show class for text-animate-in
            if (element.classList.contains('text-animate-in')) {
                element.classList.add('show');
            }

            // Add mask reveal animation for titles
            if (element.classList.contains('scene-title') ||
                element.classList.contains('main-title') ||
                element.classList.contains('today-definition-text')) {
                element.classList.add('reveal-animate');
            }

            // Add reveal animation to child titles
            const childTitles = element.querySelectorAll('.scene-title, .main-title, .today-definition-text');
            childTitles.forEach(childTitle => {
                childTitle.classList.add('reveal');
                childTitle.classList.add('reveal-animate');

                if (element.id === 'focusTitle1') {
                    childTitle.style.animationDelay = '0.8s';
                }
            });

            // Apply random animations to explanation-text (excluding frame 0)
            if (instance.currentFrameIndex !== 0) {
                const explanationTexts = element.querySelectorAll('.explanation-text');
                explanationTexts.forEach(explanationText => {
                    if (!explanationText.hasAttribute('data-animation-applied')) {
                        const animations = ['anim-slide-left', 'anim-slide-up-smooth', 'anim-scale-up'];
                        const randomAnim = animations[Math.floor(Math.random() * animations.length)];

                        explanationText.classList.add(randomAnim);
                        explanationText.setAttribute('data-animation-applied', 'true');

                        console.log(`  ${element.id} 내부 explanation-text에 랜덤 애니메이션 적용: ${randomAnim}`);
                    }
                });
            }

            // If element itself is explanation-text (excluding frame 0)
            if (instance.currentFrameIndex !== 0 && element.classList.contains('explanation-text')) {
                if (!element.hasAttribute('data-animation-applied')) {
                    const animations = ['anim-slide-left', 'anim-slide-up-smooth', 'anim-scale-up'];
                    const randomAnim = animations[Math.floor(Math.random() * animations.length)];

                    element.classList.add(randomAnim);
                    element.setAttribute('data-animation-applied', 'true');

                    console.log(`  ${element.id} (explanation-text 자체)에 랜덤 애니메이션 적용: ${randomAnim}`);
                }
            }
        } else {
            // Hide element
            element.classList.remove('reveal', 'reveal-dimmed', 'reveal-focus');
        }
    });

    // Handle Review dimming
    updateReviewDimming(revealElements, targetElement);

    // Render visualizations
    renderVisualizations(revealElements);

    // Trigger glow effects for new elements
    triggerGlowEffectsForNewElements(instance, revealElements);

    console.log(`Reveal elements 업데이트 완료`);
}

/**
 * Trigger glow effects for newly revealed elements
 * @param {Object} instance - LectureTemplate instance
 * @param {Array} revealElements - Array of element IDs to reveal
 */
function triggerGlowEffectsForNewElements(instance, revealElements) {
    if (!revealElements || revealElements.length === 0) return;

    revealElements.forEach(elementId => {
        if (!instance.glowEffectsApplied.has(elementId)) {
            const element = document.getElementById(elementId);
            if (element && element.classList.contains('reveal')) {
                instance.glowEffectsApplied.add(elementId);
            }
        }
    });
}

/**
 * Apply text animations for specific cut
 * @param {Object} instance - LectureTemplate instance
 * @param {number} cutNum - Cut number
 */
export function applyTextAnimations(instance, cutNum) {
    log(`[applyTextAnimations] 호출: cutNum=${cutNum}`);

    const cut = instance.allCuts.find(c => c.cutIndex === cutNum);
    if (!cut || !cut.targetElement) {
        log(`[applyTextAnimations] cut 또는 targetElement 없음:`, cut);
        return;
    }

    const element = document.getElementById(cut.targetElement);
    if (!element) {
        log(`[applyTextAnimations] element 없음: ${cut.targetElement}`);
        return;
    }

    log(`[applyTextAnimations] element 찾음: ${cut.targetElement}, classList:`, Array.from(element.classList));

    if (element.classList.contains('text-animate-in')) {
        element.classList.add('show');
    }

    // Show related elements (child elements of the scene)
    const relatedElements = document.querySelectorAll(`[id*="${cut.targetElement}"]`);
    relatedElements.forEach(el => {
        if (el.classList.contains('text-animate-in')) {
            el.classList.add('show');
        }
    });

    // SVG 효과 적용 - element 자체 또는 내부 자식 요소에서 찾기
    let todayDefinitionText = element.classList.contains('today-definition-text') ? element : element.querySelector('.today-definition-text');
    let contentText = null;
    if (element.classList.contains('explanation-text') || element.classList.contains('definition-text') || element.classList.contains('equation-aligned') || element.classList.contains('review-content')) {
        contentText = element;
    } else {
        contentText = element.querySelector('.explanation-text, .definition-text, .equation-aligned, .review-content');
    }
    let sceneTitle = element.classList.contains('scene-title') ? element : element.querySelector('.scene-title');
    let mainTitle = element.classList.contains('main-title') ? element : element.querySelector('.main-title');

    if (todayDefinitionText) {
        log(`[applyTextAnimations] today-definition-text 감지 - SVG 효과 트리거`);
        instance.triggerTodayDefinitionKeywordEffectsOnElement(todayDefinitionText);
    } else if (contentText) {
        log(`[applyTextAnimations] content text 감지 - SVG 효과 트리거`);
        instance.triggerContentTextEffectsOnElement(contentText);
    } else if (sceneTitle) {
        const parentDiv = sceneTitle.parentElement;
        const isSummaryScene = parentDiv && parentDiv.id && parentDiv.id.includes('focusOutroScene');
        if (isSummaryScene) {
            log(`[applyTextAnimations] summary scene-title 감지 - SVG 효과 트리거`);
            instance.triggerSummarySceneTitleEffectsOnElement(sceneTitle);
        } else {
            log(`[applyTextAnimations] scene-title이지만 summary 씬 아님`);
        }
    } else if (mainTitle) {
        log(`[applyTextAnimations] main-title 감지 - SVG 효과 트리거`);
        instance.triggerContentTextEffectsOnElement(mainTitle);
    } else {
        log(`[applyTextAnimations] SVG 효과 대상 아님 - classList:`, Array.from(element.classList));
    }
}
