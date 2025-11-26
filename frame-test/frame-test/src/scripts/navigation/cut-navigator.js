/**
 * Cut Navigator Module
 * Core navigation logic - orchestrates frame transitions, camera movements,
 * reveal updates, and all cut-related functionality
 */

import { transitionToFrame } from '../frame/frame-manager.js';
import { updateSceneVisibility } from '../frame/scene-manager.js';
import { hideSummary, handleSummaryCut, updateRevealElementsInSummary } from '../summary/summary-manager.js';
import { updateRevealElements, applyTextAnimations } from './reveal-manager.js';
import { calculateCameraPosition, calculateRevealElementsHeight } from '../camera/camera-system.js';
import { removeFocusTestBorder, addFocusTestBorder, updateFocusHole } from '../shared/utils/focus-utils.js';
import { renderMathJax } from '../shared/media/visualization-renderer.js';
import { playSoundEffect } from '../shared/media/sound-manager.js';
import { log, warn, error } from '../shared/utils/logger.js';

/**
 * Start auto-advance timer
 * @param {Object} instance - LectureTemplate instance
 * @param {number} delay - Delay in milliseconds before auto-advancing (default: 3000ms)
 */
export function startAutoAdvanceTimer(instance, delay = 2000) {
    console.log('[AUTO-ADVANCE] startAutoAdvanceTimer 호출됨', {
        isManualMode: instance._isManualMode,
        currentCut: instance.currentCut,
        totalCuts: instance.allCuts.length
    });

    // Don't start auto-advance if in manual mode
    if (instance._isManualMode) {
        console.log('[AUTO-ADVANCE] 수동 모드이므로 자동 진행 타이머 시작 안함');
        return;
    }

    // Clear any existing timer
    clearAutoAdvanceTimer(instance);

    // Don't auto-advance if we're at the last cut
    if (instance.currentCut >= instance.allCuts.length - 1) {
        console.log('[AUTO-ADVANCE] 마지막 Cut이므로 자동 진행 안함');
        return;
    }

    console.log(`[AUTO-ADVANCE] 자동 진행 타이머 시작: ${delay}ms 후 다음 Cut으로 이동`);
    instance._autoAdvanceTimer = setTimeout(() => {
        console.log('[AUTO-ADVANCE] 자동 진행: 다음 Cut으로 이동');
        nextCut(instance, false); // false = not manual
    }, delay);
}

/**
 * Clear auto-advance timer
 * @param {Object} instance - LectureTemplate instance
 */
export function clearAutoAdvanceTimer(instance) {
    if (instance._autoAdvanceTimer) {
        clearTimeout(instance._autoAdvanceTimer);
        instance._autoAdvanceTimer = null;
        log(`자동 진행 타이머 취소`);
    }
}

/**
 * Move to a specific cut - THE HEART OF THE SYSTEM
 * This massive method orchestrates everything: summary handling, frame transitions,
 * camera focus, reveal updates, and effects
 * @param {Object} instance - LectureTemplate instance
 * @param {number} cutNum - Cut number to move to
 * @param {boolean} skipTransition - Whether to skip transition animations
 */
export function moveToCut(instance, cutNum, skipTransition = false) {
    log(`moveToCut 호출: cutNum=${cutNum}, skipTransition=${skipTransition}, currentFrameIndex=${instance.currentFrameIndex}, frames.length=${instance.frames.length}`);

    // Prevent duplicate calls during frame transitions
    if (instance._isTransitioning && !skipTransition) {
        log(`프레임 전환 중이므로 moveToCut 호출 무시: cutNum=${cutNum}`);
        return;
    }

    const cut = instance.allCuts.find(c => c.cutIndex === cutNum);
    if (!cut) {
        error(`Cut ${cutNum}을 찾을 수 없습니다.`);
        return;
    }

    log(`Cut ${cutNum} 찾음:`, cut);

    // Handle Summary type cut
    if (cut.cutType === 'summary_title') {
        handleSummaryCut(instance, cut, cutNum);
        return;
    }

    // Transition from Summary to regular frame
    if (instance.isSummaryMode && cut.cutType !== 'outro_scene_title' && cut.cutType !== 'outro_scene_content' && cut.cutType !== 'outro_scene_overview') {
        const toFrame = instance.frames[cut.frameIndex];
        if (toFrame) {
            toFrame.element.classList.remove('hidden');
            toFrame.element.classList.add('active');
        }

        hideSummary(instance);

        setTimeout(() => {
            instance.activateFrame(cut.frameIndex);
            const nextFrameCuts = instance.allCuts.filter(c => c.frameIndex === cut.frameIndex);
            if (nextFrameCuts.length > 0) {
                moveToCut(instance, cutNum);
            }
            renderMathJax(toFrame.element);
        }, 100);
        return;
    }

    // Handle frame transition
    if (cut.frameIndex !== instance.currentFrameIndex) {
        const fromIndex = instance.currentFrameIndex;
        instance._isTransitioning = true;
        log(`프레임 전환 시작: ${fromIndex} → ${cut.frameIndex}, _isTransitioning=true`);

        transitionToFrame(instance, fromIndex, cut.frameIndex, 'smooth', cutNum);

        // Clear transition flag after animation completes
        setTimeout(() => {
            instance._isTransitioning = false;
            log(`프레임 전환 완료: _isTransitioning=false`);

            // Start auto-advance timer after frame transition completes
            startAutoAdvanceTimer(instance);
        }, 1200); // 800ms transition + 400ms buffer

        return;
    }

    // Handle summary-related cuts (outro_scene_*)
    if (instance.isSummaryMode && (cut.cutType === 'outro_scene_title' || cut.cutType === 'outro_scene_content' || cut.cutType === 'outro_scene_overview')) {
        if (cut.revealElements && cut.revealElements.length > 0) {
            updateRevealElementsInSummary(instance, cut.revealElements, instance.currentSummaryIndex, cut.cutType);
        }

        const summaryContent = instance.summaryContents[instance.currentSummaryIndex];
        const summaryMainContainer = summaryContent.querySelector('.main-container');
        const overlay = document.getElementById('focusOverlay');

        removeFocusTestBorder();

        // Overview Mode or full screen view
        if (cut.isOverviewMode || !cut.targetElement) {
            summaryMainContainer.style.transform = 'scale(1) translate(0, 0)';
            summaryMainContainer.style.transformOrigin = '50% 50%';
            summaryMainContainer.style.transition = 'transform 0.8s ease-in-out';

            // Handle outro_scene_overview: scale content-area
            if (cut.cutType === 'outro_scene_overview' && cut.revealElements && cut.revealElements.length > 0) {
                const contentArea = summaryContent.querySelector('.content-area');
                if (contentArea) {
                    contentArea.style.transform = 'scale(1)';
                    contentArea.style.transformOrigin = 'top center';
                    contentArea.style.transition = 'none';

                    setTimeout(() => {
                        const contentHeight = calculateRevealElementsHeight(cut.revealElements, contentArea);
                        if (contentHeight > 0) {
                            let calculatedScale = 820 / contentHeight;
                            const minScale = 0.5;
                            const maxScale = 1.2;
                            calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale));

                            contentArea.style.transform = `scale(${calculatedScale})`;
                            contentArea.style.transformOrigin = 'top center';
                            contentArea.style.transition = 'transform 0.8s ease-in-out';
                            log(`Summary ${cut.cutType} 스케일 계산: 컨텐츠 높이=${contentHeight.toFixed(0)}px, 원본 scale=${(820 / contentHeight).toFixed(3)}, 제한 적용 후=${calculatedScale.toFixed(3)}`);
                        } else {
                            contentArea.style.transform = 'scale(1)';
                            contentArea.style.transformOrigin = 'top center';
                            contentArea.style.transition = 'transform 0.8s ease-in-out';
                        }
                    }, 100);
                }
            } else {
                const contentArea = summaryContent.querySelector('.content-area');
                if (contentArea) {
                    contentArea.style.transform = 'scale(1)';
                    contentArea.style.transformOrigin = 'top center';
                    contentArea.style.transition = 'transform 0.8s ease-in-out';
                }
            }

            if (overlay) {
                overlay.classList.remove('active');
            }
            updateFocusHole(null);

            // Start auto-advance timer for summary overview mode
            setTimeout(() => {
                startAutoAdvanceTimer(instance);
            }, 900);

        } else if (cut.targetElement) {
            if (overlay && !overlay.classList.contains('active')) {
                overlay.classList.add('active');
            }

            // Start camera animation - block input
            instance._isCameraAnimating = true;
            log(`[Summary] 카메라 애니메이션 시작: _isCameraAnimating=true`);

            addFocusTestBorder(cut.targetElement);

            const summaryContentArea = summaryContent.querySelector('.content-area');
            const pos = calculateCameraPosition(instance, cut.targetElement, cut.cameraPosition);
            log(`[Summary] 요소 포커스: 카메라 위치 계산 (element: ${cut.targetElement}, position: ${cut.cameraPosition || 'center'})`);

            summaryMainContainer.style.transform = `scale(${pos.scale}) translate(${pos.translateX}%, ${pos.translateY}%)`;
            summaryMainContainer.style.transformOrigin = '50% 50%';
            summaryMainContainer.style.transition = 'transform 0.8s ease-in-out';

            const targetEl = document.getElementById(cut.targetElement);
            if (targetEl) {
                targetEl.style.opacity = '1';

                if (cut.targetElement.includes('focusReviewTitle')) {
                    const titleEl = targetEl.querySelector('.scene-title');
                    if (titleEl) {
                        titleEl.style.color = '#4CAF50';
                    }
                } else if (cut.targetElement.includes('focusReviewContent')) {
                    const contentEl = targetEl.querySelector('.explanation-text');
                    if (contentEl) {
                        contentEl.style.color = '#FFFFFF';
                    }
                }
            }

            // Unlock input after camera transition completes (850ms)
            setTimeout(() => {
                updateFocusHole(cut.targetElement);
                instance._isCameraAnimating = false;
                log(`[Summary] 카메라 애니메이션 완료: _isCameraAnimating=false`);

                // Start auto-advance timer after animation completes
                startAutoAdvanceTimer(instance);
            }, 850);
        }

        instance.currentCut = cutNum;
        instance.updateUI();
        return;
    }

    // Regular frame cut processing
    const currentFrame = instance.frames[instance.currentFrameIndex];
    if (!currentFrame) {
        error(`현재 프레임이 없습니다: frameIndex=${instance.currentFrameIndex}`);
        return;
    }

    const chalkFrame = currentFrame.element;
    const overlay = document.getElementById('focusOverlay');
    const transitionStyle = skipTransition ? 'none' : 'transform 0.8s ease-in-out';

    log(`Cut 전환: ${cut.name}, targetElement: ${cut.targetElement}`);

    // Process reveal_elements
    if (cut.revealElements && cut.revealElements.length > 0) {
        updateRevealElements(instance, cut.revealElements, cut.targetElement, cut);
    }

    // Determine if should not zoom
    const shouldNotZoom = cut.cutType === 'today_tag_reveal' ||
        cut.cutType === 'review_tag_reveal' ||
        cut.cutType === 'review_titles_reveal';

    const modifiedCut = shouldNotZoom ? { ...cut, isOverviewMode: true } : cut;

    const shouldCalculateRevealHeight = cut.cutType === 'scene_overview' ||
        cut.cutType === 'frame_overview' ||
        cut.cutType === 'outro_scene_overview';

    // Play zoom out sound for scene_overview
    if (cut.cutType === 'scene_overview') {
        playSoundEffect('화면 이동 Main (챠악).mp3', 0.5);
        log(`[Sound] ${cut.cutType} 줌아웃 효과음 재생`);
    }

    // Overview Mode or full screen view
    if ((cut.isOverviewMode || !cut.targetElement || shouldNotZoom) && !cut.targetElement) {
        const hasReviewScene = cut.revealElements?.some(id => id.includes('reviewSceneTag'));
        const hasReviewTitles = cut.revealElements?.some(id => id.includes('focusReviewTitle'));
        const isReviewOverview = cut.cutType === 'review_titles_reveal' ||
            (hasReviewScene && hasReviewTitles && !cut.targetElement);
        const isTodayOverview = false;

        if (isReviewOverview || isTodayOverview) {
            const sceneSelector = isReviewOverview ? '.review-scene' : '.today-scene';
            const scene = chalkFrame.querySelector(sceneSelector);

            if (scene) {
                const containerRect = chalkFrame.getBoundingClientRect();

                let sceneRect;
                if (isTodayOverview) {
                    const todayBorder = scene.querySelector('.today-scene-border');
                    sceneRect = todayBorder ? todayBorder.getBoundingClientRect() : scene.getBoundingClientRect();
                } else {
                    sceneRect = scene.getBoundingClientRect();
                }

                const sceneCenterX = (sceneRect.left + sceneRect.width / 2) - containerRect.left;
                const sceneCenterY = (sceneRect.top + sceneRect.height / 2) - containerRect.top;

                const containerCenterX = containerRect.width / 2;
                const containerCenterY = containerRect.height / 2;

                const offsetX = containerCenterX - sceneCenterX;
                const offsetY = containerCenterY - sceneCenterY;

                const translateX = (offsetX / containerRect.width) * 100;
                const translateY = (offsetY / containerRect.height) * 100;

                const scaleX = (containerRect.width * 0.88) / sceneRect.width;
                const scaleY = (containerRect.height * 0.88) / sceneRect.height;
                const scale = Math.min(scaleX, scaleY, 1.5);

                chalkFrame.style.transform = `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
                chalkFrame.style.transformOrigin = '50% 50%';
                chalkFrame.style.transition = transitionStyle;

                log(`[${isReviewOverview ? 'Review' : 'Today'} Overview] 중앙 배치: scale=${scale.toFixed(2)}, translate=${translateX.toFixed(1)}%, ${translateY.toFixed(1)}%`);
            } else {
                chalkFrame.style.transform = 'scale(1) translate(0, 0)';
                chalkFrame.style.transformOrigin = '50% 50%';
                chalkFrame.style.transition = transitionStyle;
            }
        } else {
            if (cut.isOverviewMode || cut.cutType === 'scene_overview' || cut.cutType === 'frame_overview' || cut.cutType === 'outro_scene_overview') {
                chalkFrame.style.transform = 'scale(1) translate(0, 0)';
                chalkFrame.style.transformOrigin = '50% 50%';
                chalkFrame.style.transition = transitionStyle;
            }
        }

        // Scale content-area for overview types
        if (shouldCalculateRevealHeight && cut.revealElements && cut.revealElements.length > 0) {
            const contentArea = chalkFrame.querySelector('.content-area');
            if (contentArea) {
                contentArea.style.transform = 'scale(1)';
                contentArea.style.transformOrigin = 'top center';
                contentArea.style.transition = 'none';

                setTimeout(() => {
                    const contentHeight = calculateRevealElementsHeight(cut.revealElements, contentArea);
                    if (contentHeight > 0) {
                        let calculatedScale = 820 / contentHeight;
                        const minScale = 0.5;
                        const maxScale = 1.2;
                        calculatedScale = Math.max(minScale, Math.min(maxScale, calculatedScale));

                        contentArea.style.transform = `scale(${calculatedScale})`;
                        contentArea.style.transformOrigin = 'top center';
                        contentArea.style.transition = transitionStyle;
                        log(`${cut.cutType} 스케일 계산: 컨텐츠 높이=${contentHeight.toFixed(0)}px, 원본 scale=${(820 / contentHeight).toFixed(3)}, 제한 적용 후=${calculatedScale.toFixed(3)}`);
                    } else {
                        contentArea.style.transform = 'scale(1)';
                        contentArea.style.transformOrigin = 'top center';
                        contentArea.style.transition = transitionStyle;
                    }
                }, 100);
            }
        } else {
            const contentArea = chalkFrame.querySelector('.content-area');
            if (contentArea) {
                contentArea.style.transform = 'scale(1)';
                contentArea.style.transformOrigin = 'top center';
                contentArea.style.transition = transitionStyle;
            }
        }

        if (overlay) {
            overlay.classList.remove('active');
        }
        updateFocusHole(null);

        applyTextAnimations(instance, cutNum);

        // Start auto-advance timer for overview mode (after content area scale completes)
        setTimeout(() => {
            startAutoAdvanceTimer(instance);
        }, 900); // Wait for scale animation (800ms) + buffer

    } else if (cut.targetElement && cut.targetElement.includes('todaySceneTag')) {
        // Today Scene Tag: center based on border
        const todayScene = chalkFrame.querySelector('.today-scene');
        if (todayScene) {
            const todayBorder = todayScene.querySelector('.today-scene-border');
            const targetElement = todayBorder || todayScene;

            const containerRect = chalkFrame.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();

            const targetCenterX = (targetRect.left + targetRect.width / 2) - containerRect.left;
            const targetCenterY = (targetRect.top + targetRect.height / 2) - containerRect.top;

            const containerCenterX = containerRect.width / 2;
            const containerCenterY = containerRect.height / 2;

            const offsetX = containerCenterX - targetCenterX;
            const offsetY = containerCenterY - targetCenterY;

            const translateX = (offsetX / containerRect.width) * 100;
            const translateY = (offsetY / containerRect.height) * 100;

            const scaleX = (containerRect.width * 0.7) / targetRect.width;
            const scaleY = (containerRect.height * 0.7) / targetRect.height;
            const scale = Math.min(scaleX, scaleY, 1.5);

            chalkFrame.style.transform = `scale(${scale}) translate(${translateX}%, ${translateY}%)`;
            chalkFrame.style.transformOrigin = '50% 50%';
            chalkFrame.style.transition = transitionStyle;

            log(`[Today Scene Tag] Border 중앙 배치: scale=${scale.toFixed(2)}, translate=${translateX.toFixed(1)}%, ${translateY.toFixed(1)}%`);
        }

        applyTextAnimations(instance, cutNum);

        // Start auto-advance timer for today scene tag
        setTimeout(() => {
            startAutoAdvanceTimer(instance);
        }, 850);

    } else if (cut.targetElement) {
        // Specific element focus
        if (overlay && !overlay.classList.contains('active')) {
            overlay.classList.add('active');
        }

        // Start camera animation - block input
        instance._isCameraAnimating = true;
        log(`카메라 애니메이션 시작: _isCameraAnimating=true`);

        // Camera position calculation handles all scaling
        const pos = calculateCameraPosition(instance, cut.targetElement, cut.cameraPosition);
        log(`요소 포커스: 카메라 위치 계산 (element: ${cut.targetElement}, position: ${cut.cameraPosition || 'center'})`);

        chalkFrame.style.transform = `scale(${pos.scale}) translate(${pos.translateX}%, ${pos.translateY}%)`;
        chalkFrame.style.transformOrigin = '50% 50%';
        chalkFrame.style.transition = transitionStyle;

        const targetEl = document.getElementById(cut.targetElement);
        if (targetEl) {
            targetEl.style.opacity = '1';

            if (cut.targetElement.includes('focusReviewTitle')) {
                const titleEl = targetEl.querySelector('.scene-title');
                if (titleEl) {
                    titleEl.style.color = '#4CAF50';
                }
            } else if (cut.targetElement.includes('focusReviewContent')) {
                const contentEl = targetEl.querySelector('.explanation-text');
                if (contentEl) {
                    contentEl.style.color = '#FFFFFF';
                }
            }
        }

        applyTextAnimations(instance, cutNum);

        // Update focus hole and unlock input after camera transition completes (850ms)
        setTimeout(() => {
            updateFocusHole(cut.targetElement);
            instance._isCameraAnimating = false;
            log(`카메라 애니메이션 완료: _isCameraAnimating=false`);

            // Start auto-advance timer after animation completes
            startAutoAdvanceTimer(instance);
        }, 850);
    }

    instance.currentCut = cutNum;
    updateSceneVisibility(instance, cutNum);
    instance.updateUI();

    // Start auto-advance timer if skipTransition (for initial load)
    if (skipTransition) {
        startAutoAdvanceTimer(instance);
    }
}

/**
 * Move to next cut
 * @param {Object} instance - LectureTemplate instance
 * @param {boolean} isManual - Whether this is a manual navigation (keyboard)
 */
export function nextCut(instance, isManual = false) {
    console.log('[AUTO-ADVANCE] nextCut 호출됨', {
        isManual,
        isTransitioning: instance._isTransitioning,
        isCameraAnimating: instance._isCameraAnimating,
        currentCut: instance.currentCut
    });

    // Block input during camera animation
    if (instance._isTransitioning || instance._isCameraAnimating) {
        console.log('[AUTO-ADVANCE] 애니메이션 중이므로 입력 무시');
        return;
    }

    // If manual navigation, switch to manual mode and clear auto-advance timer
    if (isManual) {
        instance._isManualMode = true;
        clearAutoAdvanceTimer(instance);
        console.log('[AUTO-ADVANCE] 수동 모드로 전환: _isManualMode=true');
    }

    const nextCutIndex = instance.currentCut + 1;
    const nextCut = instance.allCuts.find(c => c.cutIndex === nextCutIndex);

    console.log(`[AUTO-ADVANCE] nextCut() 호출: 현재=${instance.currentCut}, 다음=${nextCutIndex}, 찾은 Cut:`, nextCut);

    if (nextCut) {
        console.log('[AUTO-ADVANCE] moveToCut 호출 예정:', nextCutIndex);
        moveToCut(instance, nextCutIndex);
    } else {
        console.log('[AUTO-ADVANCE] 다음 Cut이 없습니다. 전체 Cuts:', instance.allCuts.map(c => c.cutIndex));
    }
}

/**
 * Move to previous cut
 * @param {Object} instance - LectureTemplate instance
 * @param {boolean} isManual - Whether this is a manual navigation (keyboard)
 */
export function previousCut(instance, isManual = false) {
    // Block input during camera animation
    if (instance._isTransitioning || instance._isCameraAnimating) {
        log(`애니메이션 중이므로 입력 무시 (transitioning: ${instance._isTransitioning}, camera: ${instance._isCameraAnimating})`);
        return;
    }

    // If manual navigation, switch to manual mode and clear auto-advance timer
    if (isManual) {
        instance._isManualMode = true;
        clearAutoAdvanceTimer(instance);
        log(`수동 모드로 전환: _isManualMode=true`);
    }

    const prevCutIndex = instance.currentCut - 1;
    const prevCut = instance.allCuts.find(c => c.cutIndex === prevCutIndex);

    log(`previousCut() 호출: 현재=${instance.currentCut}, 이전=${prevCutIndex}, 찾은 Cut:`, prevCut);

    if (prevCut) {
        moveToCut(instance, prevCutIndex);
    } else {
        log('이전 Cut이 없습니다. 전체 Cuts:', instance.allCuts.map(c => c.cutIndex));
    }
}

/**
 * Move to next (compatibility wrapper)
 * @param {Object} instance - LectureTemplate instance
 * @param {boolean} isManual - Whether this is a manual navigation (default: true for compatibility)
 */
export function moveToNext(instance, isManual = true) {
    nextCut(instance, isManual);
}

/**
 * Move to previous (compatibility wrapper)
 * @param {Object} instance - LectureTemplate instance
 * @param {boolean} isManual - Whether this is a manual navigation (default: true for compatibility)
 */
export function moveToPrevious(instance, isManual = true) {
    previousCut(instance, isManual);
}

/**
 * Update UI with current cut information
 * @param {Object} instance - LectureTemplate instance
 */
export function updateUI(instance) {
    const cutInfo = document.getElementById('cutInfo');
    const progressFill = document.getElementById('progressFill');
    const nextcut = document.getElementById('nextcut');

    if (!cutInfo || !progressFill) return;

    const currentCut = instance.allCuts.find(c => c.cutIndex === instance.currentCut);
    const currentFrame = instance.frames[instance.currentFrameIndex];

    if (currentCut && currentFrame) {
        cutInfo.textContent = `cut ${instance.currentCut}: ${currentCut.name}`;
        progressFill.style.width = `${((instance.currentCut + 1) / instance.allCuts.length) * 100}%`;
    }

    if (nextcut) {
        if (instance.currentCut < instance.allCuts.length - 1) {
            const mode = instance._isManualMode ? '수동' : '자동';
            nextcut.textContent = `${mode} 모드 - 방향키로 조작 (${instance.currentCut}/${instance.allCuts.length - 1})`;
        } else {
            nextcut.textContent = '모든 단계 완료';
        }
    }
}
