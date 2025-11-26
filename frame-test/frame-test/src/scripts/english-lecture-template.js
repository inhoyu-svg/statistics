// English Lecture Template Animation System

class EnglishLectureTemplate {
    constructor() {
        this.currentFrameIndex = 0;
        this.currentCut = 0;
        this.frames = [];
        this.allCuts = [];
        this.config = {
            totalFrames: 0,
            cutAnimations: {},
            cameraPositions: {}
        };
        this.initializeSystem();
    }

    // Initialize System
    initializeSystem() {
        this.extractFrames();

        // JSON data takes priority
        if (window.cutsData && Array.isArray(window.cutsData)) {
            console.log('JSON data detected. Starting JSON-based initialization.');
            const validation = this.validateJSONData(window.cutsData);
            if (validation.valid) {
                const success = this.generateCutsFromJSON(window.cutsData);
                if (success) {
                    console.log('JSON-based Cut generation successful');
                } else {
                    console.warn('JSON-based Cut generation failed.');
                }
            } else {
                console.error('JSON data validation failed:', validation.error);
            }
        } else {
            console.log('No JSON data found.');
        }

        this.hideAllProgressiveElements();
        this.setupEventListeners();
        this.initializeFrames();
    }

    // Extract frames from HTML
    extractFrames() {
        const frameElements = document.querySelectorAll('.chalk-frame');
        this.config.totalFrames = frameElements.length;

        frameElements.forEach((element, index) => {
            this.frames.push({
                index: index,
                element: element,
                cuts: [],
                frameType: element.getAttribute('data-frame-type')
            });
        });

        console.log(`Extracted ${this.config.totalFrames} frames`);
    }

    // Generate cuts from JSON
    generateCutsFromJSON(cutsData) {
        if (!cutsData || !Array.isArray(cutsData)) {
            console.warn('Invalid JSON cuts data');
            return false;
        }

        console.log('JSON-based Cut generation started:', cutsData.length, 'cuts');

        this.allCuts = [];
        this.frames.forEach(frame => {
            if (frame.cuts) frame.cuts = [];
        });

        cutsData.forEach((cutData) => {
            const cut = {
                name: cutData.visual_script || `Cut ${cutData.cut_index}`,
                cutIndex: cutData.cut_index,
                globalCutIndex: cutData.cut_index,
                frameIndex: cutData.frame_index,
                targetElement: cutData.target_element,
                revealElements: cutData.reveal_elements || [],
                isOverviewMode: cutData.is_overview_mode || false,
                cameraPosition: cutData.camera_position || 'center',
                animationType: cutData.animation_type || 'focus',
                animationDuration: cutData.animation_duration || 800,
                cutType: cutData.cut_type,
                visualScript: cutData.visual_script,
                voiceScript: cutData.voice_script
            };

            this.allCuts.push(cut);

            const frameIndex = cut.frameIndex;
            if (this.frames[frameIndex]) {
                if (!this.frames[frameIndex].cuts) {
                    this.frames[frameIndex].cuts = [];
                }
                this.frames[frameIndex].cuts.push(cut);
            } else {
                console.warn(`Frame ${frameIndex} does not exist. Skipping Cut ${cut.cutIndex}`);
            }
        });

        this.allCuts.sort((a, b) => a.cutIndex - b.cutIndex);
        this.frames.forEach(frame => {
            if (frame.cuts) {
                frame.cuts.sort((a, b) => a.cutIndex - b.cutIndex);
            }
        });

        console.log('JSON-based Cut generation completed:', this.allCuts.length, 'cuts');
        console.log('Cut distribution per frame:', this.frames.map((frame, idx) =>
            `Frame ${idx}: ${frame.cuts?.length || 0} cuts`));
        return true;
    }

    // Validate JSON data
    validateJSONData(cutsData) {
        if (!cutsData || !Array.isArray(cutsData)) {
            return { valid: false, error: 'cuts data is not an array' };
        }

        for (let i = 0; i < cutsData.length; i++) {
            const cut = cutsData[i];
            if (typeof cut.cut_index !== 'number') {
                return { valid: false, error: `Cut ${i}: cut_index is not a number` };
            }
            if (typeof cut.frame_index !== 'number') {
                return { valid: false, error: `Cut ${i}: frame_index is not a number` };
            }
            if (!cut.visual_script) {
                return { valid: false, error: `Cut ${i}: visual_script is missing` };
            }
        }

        return { valid: true };
    }

    // Hide all progressive elements initially (following lecture-template.js rules)
    hideAllProgressiveElements() {
        this.frames.forEach(frame => {
            const allControlledElements = this.getControlledElements(frame.element);

            // CSS already handles hiding, just remove reveal class
            allControlledElements.forEach(element => {
                element.classList.remove('reveal');
            });
        });

        console.log('All progressive elements hidden');
    }

    // Get all controlled elements (following lecture-template.js rules)
    getControlledElements(containerElement) {
        // Collect all elements with IDs that should be controlled
        const elements = [];

        // ID-based selection for focus elements (excluding system UI overlays)
        const focusElements = containerElement.querySelectorAll(
            '[id*="focus"]:not(#focusOverlay):not([class*="overlay"])'
        );
        focusElements.forEach(el => elements.push(el));

        // Headers with IDs (for Concept/Problem/Outro frames)
        const headers = containerElement.querySelectorAll('.header[id]');
        headers.forEach(el => elements.push(el));

        // Scene tags
        const sceneTags = containerElement.querySelectorAll('.scene-tag[id]');
        sceneTags.forEach(el => elements.push(el));

        // All text-animate-in elements with IDs
        const textAnimateElements = containerElement.querySelectorAll('.text-animate-in[id]');
        textAnimateElements.forEach(el => elements.push(el));

        // Visualization containers
        const vizContainers = containerElement.querySelectorAll('.visualization-container[id]');
        vizContainers.forEach(el => elements.push(el));

        // Step headers
        const stepHeaders = containerElement.querySelectorAll('.step-header');
        stepHeaders.forEach(el => elements.push(el));

        // Step content elements (any class starting with step-content)
        const stepContents = containerElement.querySelectorAll('[class*="step-content"][id]');
        stepContents.forEach(el => elements.push(el));

        // Remove duplicates by using a Set based on element identity
        return [...new Set(elements)];
    }

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    this.nextCut();
                    break;
                case 'ArrowLeft':
                    this.previousCut();
                    break;
            }
        });

        console.log('Event listeners setup complete');
    }

    // Initialize frames
    initializeFrames() {
        // 모든 프레임을 비활성 상태로 설정
        this.frames.forEach((frameData) => {
            const frameElement = frameData.element;
            frameElement.classList.remove('active');
            frameElement.classList.add('hidden');
            // 모든 애니메이션 요소 초기화
            const animatedElements = frameElement.querySelectorAll('.text-animate-in');
            animatedElements.forEach(el => el.classList.remove('show'));

            // intro 프레임(focusTitle1)을 제외한 모든 header를 .main-container 밖으로 이동
            const header = frameElement.querySelector('.header');
            const hasFocusTitle1 = header && header.querySelector('#focusTitle1');

            if (header && !hasFocusTitle1) {
                const mainContainer = frameElement.querySelector('.main-container');
                if (mainContainer && header.parentElement === mainContainer) {
                    // header를 .chalk-frame의 직접 자식으로 이동
                    frameElement.insertBefore(header, mainContainer);
                }
            }
        });

        // 첫 번째 프레임을 활성화
        if (this.frames.length > 0) {
            const firstFrame = this.frames[0];
            firstFrame.element.classList.remove('hidden');
            firstFrame.element.classList.add('active');
            this.currentFrameIndex = 0;

            // Cut 0으로 명시적으로 이동 (초기화 시에는 transition 없이)
            if (this.allCuts.length > 0) {
                this.executeFirstCut();
                // this.executeCut(0, true);
            }

            // chapter-badge에 scale-up 애니메이션 추가
            const chapterBadges = firstFrame.element.querySelectorAll('.chapter-badge');
            chapterBadges.forEach(badge => {
                badge.classList.add('badge-scale-up');
            });
        }
    }

    // Execute first cut
    executeFirstCut() {
        this.currentCut = 0;
        this.executeCut(this.allCuts[0]);
    }

    // Next cut
    nextCut() {
        if (this.currentCut < this.allCuts.length - 1) {
            this.currentCut++;
            const cut = this.allCuts[this.currentCut];
            this.executeCut(cut);
            this.updateProgressIndicator();
        }
    }

    // Previous cut
    previousCut() {
        if (this.currentCut > 0) {
            this.currentCut--;
            const cut = this.allCuts[this.currentCut];
            this.executeCut(cut);
            this.updateProgressIndicator();
        }
    }

    // Execute cut
    executeCut(cut) {
        if (!cut) return;

        console.log(`Executing Cut ${cut.cutIndex}:`, cut.name);

        // Frame transition handling
        if (cut.frameIndex !== this.currentFrameIndex) {
            this.transitionToFrame(cut.frameIndex, () => {
                // Execute after frame transition completes
                this.updateRevealElements(cut.revealElements, cut);

                // Apply intro frame border animation for focusTitle1
                if (cut.targetElement === 'focusTitle1') {
                    this.applyIntroFrameBorderAnimation();
                }
            });
        } else {
            // Same frame - update immediately
            this.updateRevealElements(cut.revealElements, cut);

            // Apply intro frame border animation for focusTitle1
            if (cut.targetElement === 'focusTitle1') {
                this.applyIntroFrameBorderAnimation();
            }
        }

        // Apply camera focus for target element
        this.applyCameraFocus(cut);

        this.updateProgressIndicator();
    }

    // Transition to frame with fade effect
    transitionToFrame(newFrameIndex, callback) {
        const oldFrame = this.frames[this.currentFrameIndex];
        const newFrame = this.frames[newFrameIndex];

        if (!newFrame) return;

        console.log(`Transitioning from Frame ${this.currentFrameIndex} to Frame ${newFrameIndex}`);

        // Fade out old frame
        if (oldFrame) {
            oldFrame.element.style.opacity = '0';
            setTimeout(() => {
                oldFrame.element.style.visibility = 'hidden';
            }, 500);
        }

        // Fade in new frame
        setTimeout(() => {
            newFrame.element.style.visibility = 'visible';
            newFrame.element.style.opacity = '1';
            this.currentFrameIndex = newFrameIndex;

            // Execute callback after frame transition completes
            if (callback && typeof callback === 'function') {
                callback();
            }
        }, 500);
    }

    // Update reveal elements (following lecture-template.js rules)
    updateRevealElements(revealElements, cut) {
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) return;

        const allControlledElements = this.getControlledElements(currentFrame.element);

        console.log(`========== UPDATE REVEAL ELEMENTS ==========`);
        console.log(`Cut Index: ${this.currentCut}, Frame Index: ${this.currentFrameIndex}`);
        console.log(`Current frame controlled elements (total ${allControlledElements.length}):`,
            Array.from(allControlledElements).map(el => el.id));
        console.log(`Reveal Elements:`, revealElements);
        console.log(`Target Element:`, cut?.targetElement);
        console.log(`Overview Mode:`, cut?.isOverviewMode);

        // If no revealElements, hide all elements
        if (!revealElements || revealElements.length === 0) {
            console.log(`No revealElements - hiding all elements`);
            allControlledElements.forEach(element => {
                element.classList.remove('reveal', 'reveal-dimmed', 'reveal-focus');
            });
            return;
        }

        // Get target element and overview mode from cut
        const targetElement = cut ? cut.targetElement : null;
        const isOverviewMode = cut ? cut.isOverviewMode : false;

        // Set visibility and dimmed state for each element
        allControlledElements.forEach(element => {
            const shouldReveal = revealElements.includes(element.id);
            const isTargetElement = element.id === targetElement;

            if (shouldReveal) {
                element.classList.add('reveal');

                // Remove inline styles set by streaming mode
                // (inline styles have higher priority than CSS classes)
                element.style.opacity = '';
                element.style.visibility = '';

                // In overview mode or when element is target: focus
                // Otherwise: dimmed
                if (isOverviewMode || !targetElement || isTargetElement) {
                    element.classList.add('reveal-focus');
                    element.classList.remove('reveal-dimmed');
                    console.log(`  ✓ ${element.id} - REVEALED (FOCUS)`);
                } else {
                    element.classList.add('reveal-dimmed');
                    element.classList.remove('reveal-focus');
                    console.log(`  ✓ ${element.id} - REVEALED (DIMMED)`);
                }

                // scene-tag: add tag-animate class
                if (element.classList.contains('scene-tag')) {
                    element.classList.add('tag-animate');
                }

                // title elements: add reveal-animate class
                if (element.classList.contains('scene-title') ||
                    element.classList.contains('main-title')) {
                    element.classList.add('reveal-animate');
                }

                // Find and animate child title elements
                const childTitles = element.querySelectorAll('.scene-title, .main-title');
                childTitles.forEach(childTitle => {
                    childTitle.classList.add('reveal');
                    childTitle.classList.add('reveal-animate');

                    // focusTitle1: add 0.3s delay
                    if (element.id === 'focusTitle1') {
                        childTitle.style.animationDelay = '0.3s';
                    }
                });
            } else {
                // Not in revealElements: completely hide
                element.classList.remove('reveal', 'reveal-dimmed', 'reveal-focus');
                console.log(`  ✗ ${element.id} - HIDDEN (not in revealElements)`);
            }
        });

        // Update scene visibility based on revealed elements
        this.updateSceneVisibility(currentFrame.element, revealElements);

        console.log(`==========================================`);
    }

    // Update visibility of .math-scene containers
    updateSceneVisibility(frameElement, revealElements) {
        const allScenes = frameElement.querySelectorAll('.math-scene');

        allScenes.forEach(scene => {
            // Check if any child element of this scene is in revealElements
            const sceneChildren = scene.querySelectorAll('[id]');
            let hasRevealedChild = false;

            sceneChildren.forEach(child => {
                if (revealElements && revealElements.includes(child.id)) {
                    hasRevealedChild = true;
                }
            });

            // Show scene if it has revealed children, hide otherwise
            if (hasRevealedChild) {
                scene.classList.add('scene-visible');
            } else {
                scene.classList.remove('scene-visible');
            }
        });
    }

    // Apply camera focus
    applyCameraFocus(cut) {
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) return;

        const mainContainer = currentFrame.element.querySelector('.main-container');
        if (!mainContainer) return;

        if (cut.isOverviewMode) {
            // Overview mode: reset camera
            mainContainer.style.transform = 'scale(1) translate(0%, 0%)';
            console.log('Camera reset to overview mode');
        } else if (cut.targetElement) {
            // Focus mode: calculate camera position
            const cameraPosition = this.calculateCameraPosition(cut.targetElement);
            mainContainer.style.transform =
                `scale(${cameraPosition.scale}) translate(${cameraPosition.translateX}%, ${cameraPosition.translateY}%)`;

            console.log(`Camera focused on ${cut.targetElement}: scale ${cameraPosition.scale}, translate ${cameraPosition.translateX}%, ${cameraPosition.translateY}%`);
        }

        mainContainer.style.transition = `transform ${cut.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    }

    // Calculate camera position
    calculateCameraPosition(targetElementId) {
        if (!targetElementId) {
            return { scale: 1, translateX: 0, translateY: 0 };
        }

        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.warn(`Target element not found: ${targetElementId}`);
            return { scale: 1, translateX: 0, translateY: 0 };
        }

        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) {
            return { scale: 1, translateX: 0, translateY: 0 };
        }

        const containerElement = currentFrame.element.querySelector('.main-container');
        if (!containerElement) {
            return { scale: 1, translateX: 0, translateY: 0 };
        }

        // If target is a sceneTag, focus on parent .math-scene instead
        let focusElement = targetElement;
        if (targetElementId.includes('sceneTag') || targetElement.classList.contains('scene-tag')) {
            const parentScene = targetElement.closest('.math-scene');
            if (parentScene) {
                focusElement = parentScene;
                console.log(`SceneTag detected - focusing on parent scene: ${parentScene.id}`);
            }
        }

        const scale = this.calculateScale(targetElementId, containerElement);

        const containerRect = containerElement.getBoundingClientRect();
        const targetRect = focusElement.getBoundingClientRect();

        const targetCenterXInContainer = (targetRect.left + targetRect.width / 2) - containerRect.left;
        const targetCenterYInContainer = (targetRect.top + targetRect.height / 2) - containerRect.top;

        const containerCenterX = containerRect.width / 2;
        const containerCenterY = containerRect.height / 2;

        const offsetX = containerCenterX - targetCenterXInContainer;
        const offsetY = containerCenterY - targetCenterYInContainer;

        // Move camera so targetElement appears at screen center
        const translateX = (offsetX / containerRect.width) * 100;
        const translateY = (offsetY / containerRect.height) * 100;

        return { scale, translateX, translateY };
    }

    // Calculate scale based on target element
    calculateScale(targetElementId, containerElement) {
        // Default scale based on element type
        if (targetElementId.includes('focusTitle')) return 1.0;
        if (targetElementId.includes('sceneTag')) return 1.2;
        if (targetElementId.includes('Scene') && targetElementId.includes('Title')) return 1.3;
        if (targetElementId.includes('text')) return 1.5;
        if (targetElementId.includes('equation')) return 1.4;
        if (targetElementId.includes('Step')) return 1.3;
        if (targetElementId.includes('Summary')) return 1.2;

        return 1.2;
    }

    // Apply intro frame border drawing animation
    applyIntroFrameBorderAnimation() {
        const focusTitle1 = document.getElementById('focusTitle1');
        if (!focusTitle1) return;

        // Add border-draw animation class
        focusTitle1.classList.add('border-draw');

        console.log('Intro frame border animation applied');
    }

    // Update progress indicator
    updateProgressIndicator() {
        const cutInfo = document.getElementById('cutInfo');
        const progressFill = document.getElementById('progressFill');

        if (cutInfo) {
            const currentCut = this.allCuts[this.currentCut];
            cutInfo.textContent = `Cut ${this.currentCut + 1}/${this.allCuts.length}: ${currentCut?.name || ''}`;
        }

        if (progressFill) {
            const progress = ((this.currentCut + 1) / this.allCuts.length) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lectureTemplate = new EnglishLectureTemplate();
    console.log('English Lecture Template initialized');
});
