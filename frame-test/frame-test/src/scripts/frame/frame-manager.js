/**
 * Frame Manager Module
 * Handles frame initialization, activation, and transitions
 */

import { renderMathJax } from '../shared/media/visualization-renderer.js';
import { log, warn, error } from '../shared/utils/logger.js';

/**
 * Initialize all frames to hidden state
 * @param {Object} instance - LectureTemplate instance
 */
export function initializeFrames(instance) {
    // Set all frames to inactive state
    instance.frames.forEach((frameData) => {
        const frameElement = frameData.element;
        frameElement.classList.remove('active');
        frameElement.classList.add('hidden');
        const animatedElements = frameElement.querySelectorAll('.text-animate-in');
        animatedElements.forEach(el => el.classList.remove('show'));
    });

    // Activate first frame
    if (instance.frames.length > 0) {
        const firstFrame = instance.frames[0];
        firstFrame.element.classList.remove('hidden');
        firstFrame.element.classList.add('active');
        instance.currentFrameIndex = 0;

        // Move to cut 0 explicitly (without transition for initialization)
        if (instance.allCuts.length > 0) {
            instance.moveToCut(0, true);
        }

        // Add scale-up animation to chapter badges
        const chapterBadges = firstFrame.element.querySelectorAll('.chapter-badge');
        chapterBadges.forEach(badge => {
            badge.classList.add('badge-scale-up');
        });
    }
}

/**
 * Activate a specific frame
 * @param {Object} instance - LectureTemplate instance
 * @param {number} frameIndex - Index of frame to activate
 */
export function activateFrame(instance, frameIndex) {
    log(`activateFrame 원본 호출됨: frameIndex=${frameIndex}, 현재 currentFrameIndex=${instance.currentFrameIndex}, frames.length=${instance.frames.length}`);

    if (frameIndex < 0 || frameIndex >= instance.frames.length) {
        warn(`activateFrame early return: frameIndex=${frameIndex}, frames.length=${instance.frames.length}`);
        return;
    }

    // Deactivate previous frames
    instance.frames.forEach((frameData, index) => {
        if (frameData && frameData.element && index !== frameIndex) {
            const frameElement = frameData.element;
            frameElement.classList.remove('active');
            frameElement.classList.add('hidden');
            const animatedElements = frameElement.querySelectorAll('.text-animate-in');
            animatedElements.forEach(el => el.classList.remove('show'));
        }
    });

    // Activate current frame
    const currentFrame = instance.frames[frameIndex];
    const frameElement = currentFrame.element;
    frameElement.classList.remove('hidden');
    frameElement.classList.add('active');

    log(`currentFrameIndex 업데이트 직전: ${instance.currentFrameIndex} → ${frameIndex}`);
    instance.currentFrameIndex = frameIndex;
    log(`currentFrameIndex 업데이트 완료: ${instance.currentFrameIndex}`);

    // Clear glow effects tracking on frame transition
    instance.glowEffectsApplied.clear();
    log(`Glow 효과 추적 초기화됨 (프레임 전환)`);

    log(`프레임 ${frameIndex + 1} 활성화, ${currentFrame.cuts.length}개 cut 준비됨`);
}

/**
 * Transition between frames with animation
 * @param {Object} instance - LectureTemplate instance
 * @param {number} fromIndex - Source frame index
 * @param {number} toIndex - Target frame index
 * @param {string} transitionType - Type of transition ('smooth', 'fade', etc.)
 * @param {number|null} targetCutNum - Target cut number after transition
 */
export function transitionToFrame(instance, fromIndex, toIndex, transitionType = 'smooth', targetCutNum = null) {
    log(`transitionToFrame 호출: ${fromIndex} → ${toIndex}, targetCutNum=${targetCutNum}, currentFrameIndex=${instance.currentFrameIndex}`);

    const fromFrame = instance.frames[fromIndex];
    const toFrame = instance.frames[toIndex];

    if (transitionType === 'smooth') {
        // Smooth transition with fade effect
        const isLastFrame = toIndex === instance.frames.length - 1;

        // Apply background decoration common logic
        updateBackgroundDecoration(fromIndex, toIndex);

        if (isLastFrame) {
            // Special handling for last frame
            toFrame.element.classList.remove('hidden');

            // Set initial state for background circles (if any)
            const bgCircles = toFrame.element.querySelectorAll('.bg-circle');
            bgCircles.forEach(circle => {
                circle.style.opacity = '0';
                circle.classList.remove('bg-circle-fade-in-animation');
            });

            // Fade out previous frame
            fromFrame.element.classList.add('frame-fade-out');
            toFrame.element.classList.add('frame-fade-in');

            setTimeout(() => {
                activateFrame(instance, toIndex);

                // Move to target cut or first cut of frame
                const nextFrameCuts = instance.allCuts.filter(c => c.frameIndex === toIndex);
                if (nextFrameCuts.length > 0) {
                    const targetCut = targetCutNum || nextFrameCuts[0].cutIndex;
                    instance.moveToCut(targetCut);
                }

                // Clean up animation classes
                setTimeout(() => {
                    fromFrame.element.classList.remove('frame-fade-out');
                    toFrame.element.classList.remove('frame-fade-in');
                    renderMathJax(toFrame.element);
                }, 800);
            }, 300);
        } else {
            // Regular transition
            fromFrame.element.classList.add('frame-fade-out');

            setTimeout(() => {
                activateFrame(instance, toIndex);
                log(`activateFrame(${toIndex}) 완료 후, currentFrameIndex=${instance.currentFrameIndex}`);

                // Move to target cut or first cut of frame
                const nextFrameCuts = instance.allCuts.filter(c => c.frameIndex === toIndex);
                if (nextFrameCuts.length > 0) {
                    const targetCut = targetCutNum || nextFrameCuts[0].cutIndex;
                    log(`moveToCut(${targetCut}) 호출 직전, currentFrameIndex=${instance.currentFrameIndex}`);
                    instance.moveToCut(targetCut);
                }

                // Clean up animation classes
                setTimeout(() => {
                    fromFrame.element.classList.remove('frame-fade-out');
                    renderMathJax(toFrame.element);
                }, 200);
            }, 500);
        }
    } else {
        // CSS class-based transition animation
        const transitionClass = `frame-transition-${transitionType}`;
        const exitingClass = `frame-transition-${transitionType} exiting`;

        updateBackgroundDecoration(fromIndex, toIndex);

        fromFrame.element.classList.add(...exitingClass.split(' '));
        toFrame.element.classList.add(...transitionClass.split(' '));

        setTimeout(() => {
            activateFrame(instance, toIndex);

            // Move to target cut or first cut of frame
            const nextFrameCuts = instance.allCuts.filter(c => c.frameIndex === toIndex);
            if (nextFrameCuts.length > 0) {
                const targetCut = targetCutNum || nextFrameCuts[0].cutIndex;
                instance.moveToCut(targetCut);
            }

            // Clean up transition classes
            setTimeout(() => {
                fromFrame.element.classList.remove(...exitingClass.split(' '));
                toFrame.element.classList.remove(...transitionClass.split(' '));
                renderMathJax(toFrame.element);
            }, 800);
        }, 500);
    }
}

/**
 * Move to next frame
 * @param {Object} instance - LectureTemplate instance
 */
export function moveToNextFrame(instance) {
    if (instance.currentFrameIndex < instance.frames.length - 1) {
        const nextFrame = instance.frames[instance.currentFrameIndex + 1];
        const transitionType = nextFrame.transition || 'fade';

        transitionToFrame(instance, instance.currentFrameIndex, instance.currentFrameIndex + 1, transitionType);
    }
}

/**
 * Move to previous frame
 * @param {Object} instance - LectureTemplate instance
 */
export function moveToPreviousFrame(instance) {
    if (instance.currentFrameIndex > 0) {
        const prevFrame = instance.frames[instance.currentFrameIndex - 1];
        const transitionType = getOppositeTransition(instance.frames[instance.currentFrameIndex].transition || 'fade');

        transitionToFrame(instance, instance.currentFrameIndex, instance.currentFrameIndex - 1, transitionType);

        // Move to last cut of previous frame
        setTimeout(() => {
            if (prevFrame.cuts && prevFrame.cuts.length > 0) {
                instance.currentCut = prevFrame.cuts.length;
                instance.moveToCut(instance.currentCut);
            }
        }, 800);
    }
}

/**
 * Get opposite transition type
 * @param {string} transition - Original transition type
 * @returns {string} Opposite transition type
 */
export function getOppositeTransition(transition) {
    const opposites = {
        'slide-left': 'slide-right',
        'slide-right': 'slide-left',
        'slide-up': 'slide-down',
        'slide-down': 'slide-up',
        'fade': 'fade'
    };
    return opposites[transition] || 'fade';
}

/**
 * Update background decoration visibility based on frame transition
 * @param {number} fromIndex - Source frame index
 * @param {number} toIndex - Target frame index
 */
export function updateBackgroundDecoration(fromIndex, toIndex) {
    const backgroundDecoration = document.querySelector('.background-decoration');
    if (!backgroundDecoration) return;

    // Hide background-decoration when leaving frame 0
    if (fromIndex === 0 && toIndex !== 0) {
        backgroundDecoration.classList.add('hidden');
        console.log('Frame 0 -> Frame ' + toIndex + ': background-decoration 숨김');
    }

    // Show background-decoration when returning to frame 0
    if (toIndex === 0 && fromIndex !== 0) {
        backgroundDecoration.classList.remove('hidden');
        console.log('Frame ' + fromIndex + ' -> Frame 0: background-decoration 표시');
    }
}
