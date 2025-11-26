// ===== Solve Template 시스템 (동적 프레임 구조: 키워드 개수에 따라 5~7개) =====

// Import shared modules
import { getHighlightColor, findNearbyColor, isWhiteColor, getGreenColorFromCSS } from './shared/utils/color-utils.js';
import { playSoundEffect, playSoundForElementById } from './shared/media/sound-manager.js';
import { renderVisualization, renderImage, renderVideo, renderChart, renderMathJax, renderVisualizations } from './shared/media/visualization-renderer.js';
import { notifyFlutter, moveToNextFromFlutter, moveToPreviousFromFlutter, moveToCutFromFlutter, onFlutterReady, setupFlutterGlobalFunctions } from './shared/communication/flutter-bridge.js';

// Import shared effects modules
import { createSVGEffect, createTextEffect } from './shared/effects/svg-effects.js';

// Import solve-specific modules
import { OverviewSequenceController } from './solve/overview-sequence-controller.js';
import { initializeProblemOverlay, updateProblemOverlayVisibility, updateProblemOverlaySize, updateProblemOverlayPosition, toggleProblemOverlay } from './solve/problem-overlay-manager.js';
import { updateArrowVisibility } from './solve/arrow-visibility-manager.js';
import { calculateScale, calculateCameraPosition, calculateGroupRect, applyCameraToHighlight, resetCameraToOverview } from './solve/managers/camera-manager.js';

class SolveTemplate {
    constructor() {
        this.currentFrameIndex = 0;     // 현재 프레임 (0: 키워드소개, 1~N: 키워드상세(개수만큼), N+1: 스텝소개, N+2: 스텝풀이, N+3: 정답)
        this.currentCut = 0;            // 현재 Cut
        this.frames = [];               // 프레임 데이터
        this.allCuts = [];              // 전체 Cut 목록
        this.hasUserDragged = false;    // 사용자가 드래그했는지 여부
        this.sceneTagFirstAppearance = new Map(); // scene-tag별 첫 등장 여부 추적
        this.keywordItemHighlightApplied = new Set(); // keyword-item 하이라이트 효과 적용 추적
        this.keywordItemHighlightCount = 0; // keyword-item 하이라이트 효과 적용 카운터
        this.lastKeywordItemEffect = null; // keyword-item의 마지막 효과 추적
        this.sceneTagAnimations = {
            // element ID: animation name
            'keywordSceneTag1': 'bounceIn',
            'keywordDetailTag2': 'wobble-hor-bottom',
            'keywordDetailTag3': 'wobble-hor-bottom',
            'keywordDetailTag4': 'wobble-hor-bottom'
        };
        this.config = {
            totalFrames: 0,
            cutAnimations: {},
            cameraPositions: {},
            problemHeight: 'small'      // 문제 크기 결정
        };

        // Overview mode 시퀀스 컨트롤러
        this.overviewSequence = new OverviewSequenceController(this);

        // Scene 전환 관련 변수 제거: 각 키워드는 이제 독립 프레임이므로 불필요
        this.initializeSystem();
    }

    // ===== 프레임 타입 식별 헬퍼 메서드 =====
    getFrameType(frameIndex) {
        const frame = document.querySelector(`[data-frame-index="${frameIndex}"]`);
        return frame ? frame.getAttribute('data-frame-type') : null;
    }

    isIntroFrame(frameIndex = this.currentFrameIndex) {
        return this.getFrameType(frameIndex) === 'intro';
    }

    isKeywordDetailFrame(frameIndex = this.currentFrameIndex) {
        return this.getFrameType(frameIndex) === 'keyword-detail';
    }

    isStepIntroFrame(frameIndex = this.currentFrameIndex) {
        return this.getFrameType(frameIndex) === 'step-intro';
    }

    isStepFrame(frameIndex = this.currentFrameIndex) {
        return this.getFrameType(frameIndex) === 'step';
    }

    isAnswerFrame(frameIndex = this.currentFrameIndex) {
        return this.getFrameType(frameIndex) === 'answer';
    }

    // 오버뷰 프레임인지 확인 (intro, step-intro, answer)
    isOverviewFrame(frameIndex = this.currentFrameIndex) {
        const frameType = this.getFrameType(frameIndex);
        return frameType === 'intro' || frameType === 'step-intro' || frameType === 'answer';
    }

    // ===== review-keyword-item 텍스트 크기 자동 조정 =====
    // review-area 내의 모든 review-keyword-item을 같은 크기로 조정 (한 번만 실행)
    adjustReviewAreaItems(reviewArea) {
        if (!reviewArea) return;

        // 이미 조정되었으면 스킵
        if (reviewArea.hasAttribute('data-font-adjusted')) return;

        const reviewKeywordItems = reviewArea.querySelectorAll('.review-keyword-item');
        if (reviewKeywordItems.length === 0) return;

        // 사용 가능한 너비 계산
        const reviewAreaStyle = window.getComputedStyle(reviewArea);
        const paddingLeft = parseFloat(reviewAreaStyle.paddingLeft);
        const paddingRight = parseFloat(reviewAreaStyle.paddingRight);

        // 모든 항목의 폰트 사이즈 초기화하고 최소 비율 찾기
        let minRatio = 1.0;

        reviewKeywordItems.forEach(item => {
            const keywordText = item.querySelector('.keyword-text');
            if (!keywordText) return;

            const keywordNumber = item.querySelector('.keyword-number');
            const keywordNumberWidth = keywordNumber ? keywordNumber.offsetWidth + 20 : 0; // 20px는 margin

            const availableWidth = reviewArea.offsetWidth - paddingLeft - paddingRight - keywordNumberWidth - 40; // 40px 여유

            // 폰트 사이즈 초기화
            keywordText.style.fontSize = '';
            const currentWidth = keywordText.scrollWidth;

            // 너비 초과 시 필요한 비율 계산
            if (currentWidth > availableWidth) {
                const ratio = (availableWidth / currentWidth) * 0.95; // 95%로 약간 여유 주기
                minRatio = Math.min(minRatio, ratio);
            }
        });

        // 최소 비율을 모든 항목에 적용 (텍스트와 number-tag 모두)
        if (minRatio < 1.0) {
            reviewKeywordItems.forEach(item => {
                const keywordText = item.querySelector('.keyword-text');
                const keywordNumber = item.querySelector('.keyword-number');

                // 텍스트 크기 조정
                if (keywordText) {
                    const computedStyle = window.getComputedStyle(keywordText);
                    const currentFontSize = parseFloat(computedStyle.fontSize);
                    const newFontSize = currentFontSize * minRatio;

                    // 최소 폰트 사이즈 제한 (1.2rem = 약 19.2px)
                    const minFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.2;
                    const finalFontSize = Math.max(newFontSize, minFontSize);

                    keywordText.style.fontSize = `${finalFontSize}px`;
                }

                // number-tag 크기 조정
                if (keywordNumber) {
                    const computedStyle = window.getComputedStyle(keywordNumber);
                    const currentFontSize = parseFloat(computedStyle.fontSize);
                    const currentWidth = parseFloat(computedStyle.width);
                    const currentHeight = parseFloat(computedStyle.height);

                    keywordNumber.style.fontSize = `${currentFontSize * minRatio}px`;
                    keywordNumber.style.width = `${currentWidth * minRatio}px`;
                    keywordNumber.style.height = `${currentHeight * minRatio}px`;
                }
            });

            console.log(`[Font Adjust] review-area 내 모든 항목 폰트 조정: 비율 ${(minRatio * 100).toFixed(1)}%`);
        }

        // 조정 완료 마킹
        reviewArea.setAttribute('data-font-adjusted', 'true');
    }

    // 모든 review-area 크기 조정
    adjustAllReviewKeywordItems() {
        const reviewAreas = document.querySelectorAll('.review-area');
        reviewAreas.forEach(reviewArea => {
            // 초기화 후 재조정
            reviewArea.removeAttribute('data-font-adjusted');
            this.adjustReviewAreaItems(reviewArea);
        });
    }

    // ===== 효과음 재생 헬퍼 메서드 =====
    playSoundEffect(soundFileName, volume = 0.5) {
        playSoundEffect(soundFileName, volume);
    }

    // 요소가 등장할 때 적절한 효과음 재생
    playSoundForElement(element) {
        if (!element) return;

        // 1. keyword 요약씬의 scene-tag
        if (element.classList.contains('scene-tag') && element.closest('.keyword-list-scene')) {
            this.playSoundEffect('UI 선택_딸깍2.mp3');
            console.log('[Sound] keyword 요약씬 scene-tag 효과음 재생');
            return;
        }

        // 2. keyword 요약씬의 keyword-item
        if (element.classList.contains('keyword-item') && element.closest('.keyword-list-scene')) {
            this.playSoundEffect('UI 선택_중간.mp3');
            console.log('[Sound] keyword 요약씬 keyword-item 효과음 재생');
            return;
        }

        // 3. 상세 keyword scene에서의 scene-tag
        if (element.classList.contains('scene-tag') && element.closest('.keyword-detail-scene')) {
            this.playSoundEffect('등장 (띠리링).mp3');
            console.log('[Sound] 상세 keyword scene-tag 효과음 재생');
            return;
        }

        // 4. 상세 keyword scene에서의 타이틀
        if (element.classList.contains('keyword-title') && element.closest('.keyword-detail-scene')) {
            this.playSoundEffect('주목 (따랑).mp3');
            console.log('[Sound] 상세 keyword 타이틀 효과음 재생');
            return;
        }

        // 5. 인출 키워드 extraction-left
        if (element.classList.contains('extraction-left')) {
            this.playSoundEffect('기타_키보드.mp3');
            console.log('[Sound] 인출 키워드 extraction-left 효과음 재생');
            return;
        }

        // 6. 인출 키워드 extraction-right
        if (element.classList.contains('extraction-right')) {
            this.playSoundEffect('등장 (또로로롱).mp3');
            console.log('[Sound] 인출 키워드 extraction-right 효과음 재생');
            return;
        }

        // 7. 인출 키워드 extraction-bottom
        if (element.classList.contains('extraction-bottom')) {
            this.playSoundEffect('주목 (뾰로롱).mp3');
            console.log('[Sound] 인출 키워드 extraction-bottom 효과음 재생');
            return;
        }

        // 8. 적용 키워드 flow-step
        if (element.classList.contains('flow-step')) {
            this.playSoundEffect('주목 (따랑).mp3');
            console.log('[Sound] 적용 키워드 flow-step 효과음 재생');
            return;
        }

        // 9. step 요약씬의 scene-tag
        if (element.classList.contains('scene-tag') && element.closest('.step-list-scene')) {
            this.playSoundEffect('등장 (또로롱).mp3');
            console.log('[Sound] step 요약씬 scene-tag 효과음 재생');
            return;
        }

        // 10. step 요약씬의 step-item
        if (element.classList.contains('step-item') && element.closest('.step-list-scene')) {
            this.playSoundEffect('UI 선택_ 클릭.mp3');
            console.log('[Sound] step 요약씬 step-item 효과음 재생');
            return;
        }

        // 11. step 상세씬의 step-item
        if (element.classList.contains('step-item') && element.closest('.step-detail-scene')) {
            this.playSoundEffect('주목 (따랑).mp3');
            console.log('[Sound] step 상세씬 step-item 효과음 재생');
            return;
        }

        // 12. step 상세씬의 타이틀
        if (element.classList.contains('step-title') && element.closest('.step-detail-scene')) {
            this.playSoundEffect('주목 (따랑).mp3');
            console.log('[Sound] step 상세씬 타이틀 효과음 재생');
            return;
        }

        // 13. 독해 키워드의 keyword-comprehension-layout
        if (element.classList.contains('keyword-comprehension-layout') && element.closest('.keyword-detail-scene')) {
            this.playSoundEffect('등장 (또로로롱).mp3');
            console.log('[Sound] 독해 키워드 comprehension-layout 효과음 재생');
            return;
        }

        // 14. 마지막 프레임의 problem-block
        const isLastFrame = this.currentFrameIndex === this.frames.length - 1;
        if (element.classList.contains('problem-block') && isLastFrame) {
            this.playSoundEffect('등장 (또로로롱).mp3');
            console.log('[Sound] 마지막 프레임 problem-block 효과음 재생');
            return;
        }

        // 15. 마지막 프레임의 review-keyword-item
        if (element.classList.contains('review-keyword-item') && isLastFrame) {
            this.playSoundEffect('UI 선택_ 클릭3.mp3');
            console.log('[Sound] 마지막 프레임 review-keyword-item 효과음 재생');
            return;
        }

        // 16. 모든 프레임에서 function-plot (visualization-container with data-viz-type="function_plot")
        if (element.classList.contains('visualization-container') && element.dataset.vizType === 'function_plot') {
            this.playSoundEffect('주목 (뾰로롱).mp3');
            console.log('[Sound] function-plot 효과음 재생');
            return;
        }
    }

    // 요소 내의 하이라이트 요소들에 glow 밑줄 효과 추가
    applyGlowToHighlightedElements(element) {
        if (!element) return;

        // 요소 내에서 highlight 클래스를 가진 모든 span 찾기
        const highlightedElements = Array.from(element.querySelectorAll('[class*="highlight-"]'));

        if (highlightedElements.length === 0) return;

        // 이미 처리된 highlight 요소가 있는지 확인
        const hasScheduledElements = highlightedElements.some(el => el._glowScheduled);
        if (hasScheduledElements) {
            console.log('Some elements already scheduled, skipping this call');
            return;
        }

        // 요소들의 위치 정보 추출
        const elementsWithPosition = highlightedElements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
                element: el,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom
            };
        });

        // keyword 상세 씬은 DOM 순서 그대로 사용 (콘텐츠 1, 2, 3 순서)
        // 정렬 안 함

        // 정렬된 순서대로 순차적으로 glow 애니메이션 시작
        const baseDelay = 500; // 초기 지연 500ms
        const staggerDelay = 350; // 각 요소 사이의 지연 350ms (단차 더 확대)
        const animationDuration = 1700; // 애니메이션 duration (ms)

        console.log('Total elements to animate:', elementsWithPosition.length);
        // DOM 순서 (콘텐츠 1, 2, 3 순서)
        console.log('=== 하이라이트 순서 (DOM 순서) ===');
        elementsWithPosition.forEach((item, idx) => {
            console.log(`  [${idx}] "${item.element.textContent.substring(0, 30)}" top: ${item.top.toFixed(0)}, left: ${item.left.toFixed(0)} → delay: ${(500 + idx * 350)}ms`);
        });

        // setTimeout ID를 저장할 배열 (MathJax 완료 시 취소하기 위해)
        if (!element._glowTimeoutIds) {
            element._glowTimeoutIds = [];
        }

        // 각 요소에 대해 개별적으로 guard flag 설정
        elementsWithPosition.forEach((item, index) => {
            // 이미 애니메이션이 예약된 요소는 건너뛰기
            if (item.element._glowScheduled) {
                console.log(`Element ${index} already scheduled, skipping`);
                return;
            }
            item.element._glowScheduled = true;

            const totalDelay = baseDelay + (index * staggerDelay);
            console.log(`Element ${index} will be animated at ${totalDelay}ms`, item.element.textContent.substring(0, 20));

            const timeoutId = setTimeout(() => {
                console.log(`[${Date.now()}] Starting animation for element ${index}`);
                this.animateGlowUnderline(item.element, animationDuration, index);
            }, totalDelay);

            // setTimeout ID 저장
            element._glowTimeoutIds.push(timeoutId);
        });
    }

    // 밑줄 glow 애니메이션을 CSS 애니메이션으로 제어
    animateGlowUnderline(element, duration = 1700, elementIndex = -1) {
        console.log(`[animateGlowUnderline] Element ${elementIndex} starting animation`);

        // glow-pulse 클래스 추가 (CSS 애니메이션 시작)
        element.classList.add('glow-pulse');

        // 애니메이션 완료 후 클래스 제거
        setTimeout(() => {
            console.log('[animate] Animation complete for element', elementIndex);
            element.classList.remove('glow-pulse');
        }, duration);
    }

    // scene-tag에 지정된 애니메이션 적용
    getSceneTagAnimation(elementId) {
        return this.sceneTagAnimations[elementId] || null;
    }

    // ===== Scene 타입 판별 헬퍼 함수 (DOM 조회 없이 문자열 패턴으로 판단) =====
    isKeywordDetailSceneByName(elementId) {
        if (!elementId) return false;
        return elementId.includes('focusKeywordTitle') ||
            elementId.includes('focusKeywordContent') ||
            elementId.includes('keywordDetailScene') ||
            elementId.includes('keywordDetailTag');
    }

    isStepDetailSceneByName(elementId) {
        if (!elementId) return false;
        return elementId.includes('focusStepTitle') ||
            elementId.includes('stepContent') ||
            elementId.includes('stepDetailScene') ||
            elementId.includes('stepDetailTag') ||
            elementId.includes('focusStep');
    }

    // ===== 완전한 JSON 기반 Cut 생성 시스템 =====
    generateCutsFromJSON(cutsData) {
        if (!cutsData || !Array.isArray(cutsData)) {
            console.warn('JSON cuts 데이터가 없습니다. HTML 기반 생성을 시도합니다.');
            return false;
        }

        console.log('JSON 기반 Cut 생성 시작:', cutsData.length, '개 Cut');

        // 기존 Cut 데이터 완전 초기화
        this.allCuts = [];
        this.frames.forEach(frame => {
            if (frame.cuts) frame.cuts = [];
        });

        // JSON 데이터를 직접 활용하여 Cut 생성 (추측 로직 완전 제거)
        cutsData.forEach((cutData, index) => {
            // JSON에서 모든 메타데이터를 직접 가져옴
            const cut = {
                name: cutData.visual_script || `Cut ${cutData.cut_index}`,
                cutIndex: cutData.cut_index,
                frameIndex: cutData.frame_index, // JSON에서 직접 가져옴
                targetElement: cutData.target_element, // JSON에서 직접 가져옴
                revealElements: cutData.reveal_elements || [], // JSON에서 직접 가져옴
                problemSize: cutData.problem_size || 'large',
                isProblemFocus: cutData.is_problem_focus || false,
                isOverviewMode: cutData.is_overview_mode || false,
                cameraPosition: cutData.camera_position || 'center',
                animationType: cutData.animation_type || 'focus',
                animationDuration: cutData.animation_duration || 800,
                cutType: cutData.cut_type,
                visualScript: cutData.visual_script,
                voiceScript: cutData.voice_script
            };

            this.allCuts.push(cut);

            // 해당 프레임에 Cut 추가 (프레임 인덱스는 JSON에서 정확히 지정됨)
            const frameIndex = cut.frameIndex;
            if (this.frames[frameIndex]) {
                this.frames[frameIndex].cuts.push(cut);
            } else {
                console.warn(`프레임 ${frameIndex}가 존재하지 않습니다. Cut ${cut.cutIndex} 스킵.`);
            }
        });

        // Cut 정렬 (cut_index 순서대로)
        this.allCuts.sort((a, b) => a.cutIndex - b.cutIndex);
        this.frames.forEach(frame => {
            if (frame.cuts) {
                frame.cuts.sort((a, b) => a.cutIndex - b.cutIndex);
            }
        });

        console.log('JSON 기반 Cut 생성 완료:', this.allCuts.length, '개 Cut');
        console.log('프레임별 Cut 분배:', this.frames.map((frame, idx) => `Frame ${idx}: ${frame.cuts?.length || 0}개`));
        return true;
    }

    // JSON 데이터 검증
    validateJSONData(cutsData) {
        if (!cutsData || !Array.isArray(cutsData)) {
            return { valid: false, error: 'cuts 데이터가 배열이 아닙니다.' };
        }

        for (let i = 0; i < cutsData.length; i++) {
            const cut = cutsData[i];
            if (typeof cut.cut_index !== 'number') {
                return { valid: false, error: `Cut ${i}: cut_index가 숫자가 아닙니다.` };
            }
            if (typeof cut.frame_index !== 'number') {
                return { valid: false, error: `Cut ${i}: frame_index가 숫자가 아닙니다.` };
            }
            if (!cut.visual_script) {
                return { valid: false, error: `Cut ${i}: visual_script가 없습니다.` };
            }
        }

        return { valid: true };
    }

    // ===== 초기화 =====
    initializeSystem() {
        this.extractTemplateData();
        this.determineProblemHeight();

        // JSON 데이터 우선 처리
        if (window.cutsData && Array.isArray(window.cutsData)) {
            console.log('JSON 데이터 발견. JSON 기반 초기화 시작.');
            const validation = this.validateJSONData(window.cutsData);
            if (validation.valid) {
                const success = this.generateCutsFromJSON(window.cutsData);
                if (success) {
                    console.log('JSON 기반 Cut 생성 성공');
                } else {
                    console.warn('JSON 기반 Cut 생성 실패. HTML 기반으로 전환.');
                    // this.generateFramesAndCuts();
                }
            } else {
                console.error('JSON 데이터 검증 실패:', validation.error);
                // this.generateFramesAndCuts();
            }
        } else {
            console.log('JSON 데이터 없음. HTML 기반 Cut 생성.');
            // this.generateFramesAndCuts();
        }

        this.hideAllProgressiveElements(); // 모든 progressive 요소 초기 숨김
        this.initializeStepTagStyles(); // STEP 태그 스타일 초기화
        // this.initializeProblemOverlay();
        this.wrapArrowSymbols(); // 화살표 특수문자를 작게 표시
        this.setupEventListeners();
        this.setupProblemToggle();
        this.renderMathJax(); // 초기 MathJax 렌더링
    }

    // ===== 화살표 특수문자를 작게 표시 =====
    wrapArrowSymbols() {
        // 모든 텍스트 노드에서 화살표를 찾아서 span으로 감싸기
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToProcess = [];
        let node;
        while (node = walker.nextNode()) {
            // 화살표가 포함된 텍스트 노드만 수집
            if (/[▲▼◀▶]/.test(node.textContent)) {
                nodesToProcess.push(node);
            }
        }

        // 수집된 노드들 처리
        nodesToProcess.forEach(textNode => {
            const text = textNode.textContent;
            // 화살표를 span으로 감싸기
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            const arrowRegex = /[▲▼◀▶]/g;
            let match;

            while ((match = arrowRegex.exec(text)) !== null) {
                // 화살표 앞의 텍스트 추가
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                }

                // 화살표를 span으로 감싸기
                const arrowSpan = document.createElement('span');
                arrowSpan.className = 'arrow-symbol';
                arrowSpan.textContent = match[0];
                fragment.appendChild(arrowSpan);

                lastIndex = match.index + 1;
            }

            // 마지막 남은 텍스트 추가
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }

            // 원래 텍스트 노드를 fragment로 교체
            textNode.parentNode.replaceChild(fragment, textNode);
        });

        console.log(`화살표 특수문자 ${nodesToProcess.length}개 텍스트 노드에서 처리 완료`);
    }

    // ===== STEP 태그 및 키워드 태그 스타일 초기화 =====
    initializeStepTagStyles() {
        // STEP 태그 처리
        const stepTags = document.querySelectorAll('.scene-tag.step-tag');
        stepTags.forEach(stepTag => {
            const stepTagText = stepTag.textContent.trim();
            const stepDetailScene = stepTag.closest('.step-detail-scene');

            if (/STEP\s+\d+/.test(stepTagText)) {
                // STEP + 숫자 형태: 25px, border 2px
                stepTag.removeAttribute('data-step-only');

                // 모든 STEP에 위쪽 패딩 추가 (이전 step 내용이 보이도록 조정)
                if (stepDetailScene) {
                    stepDetailScene.style.paddingTop = '0px';
                }
            } else if (stepTagText === 'STEP') {
                // STEP만 있는 경우: 30px, border 4px
                stepTag.setAttribute('data-step-only', 'true');
            }

            // step-list-scene 안의 step-tag에만 SVG border 추가 마킹 (나중에 생성)
            const stepListScene = stepTag.closest('.step-list-scene');
            if (stepListScene) {
                stepTag.dataset.needsBorderSvg = 'true';
            }
        });

        // 키워드 태그 처리
        const keywordTags = document.querySelectorAll('.scene-tag:not(.step-tag)');
        keywordTags.forEach(keywordTag => {
            const keywordTagText = keywordTag.textContent.trim();

            if (/KEY\s+\d+/.test(keywordTagText) || keywordTagText.includes('키워드')) {
                // KEY + 숫자 형태 또는 "키워드" 포함: 25px, border 2px
                keywordTag.removeAttribute('data-key-only');
            } else if (keywordTagText === 'KEY') {
                // KEY만 있는 경우: 30px, border 4px
                keywordTag.setAttribute('data-key-only', 'true');
            }
        });
    }

    // ===== Step Tag SVG Border 생성 (왼쪽 상단부터 시작, 사각형) =====
    createStepTagBorderSVG(container) {
        // 이미 SVG가 있으면 생성하지 않음
        if (container.querySelector('.border-svg')) return;

        // 컨테이너의 실제 크기 가져오기
        const rect = container.getBoundingClientRect();
        const width = rect.width + 4;
        const height = rect.height + 4;

        const borderDiv = document.createElement('div');
        borderDiv.className = 'border-svg';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.width = '100%';
        svg.style.height = '100%';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 왼쪽 상단부터 시계방향으로 사각형 그리기 (Z로 닫지 않고 열린 경로)
        const pathData = `M 2 2
                         L ${width - 2} 2
                         L ${width - 2} ${height - 2}
                         L 2 ${height - 2}
                         Z`;

        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#5DC470');
        path.setAttribute('stroke-width', '2');

        svg.appendChild(path);
        borderDiv.appendChild(svg);
        container.appendChild(borderDiv);

        // Path 길이 계산하여 정확한 dasharray 설정
        setTimeout(() => {
            const pathLength = path.getTotalLength();
            path.style.strokeDasharray = `0 ${pathLength}`;
            path.style.strokeDashoffset = '0';

            // CSS 변수로 길이 설정
            container.style.setProperty('--path-length', pathLength);

            console.log('Step Tag SVG border 생성 완료:', `경로 길이: ${pathLength}, width: ${width}, height: ${height}`);
        }, 10);
    }

    // ===== MathJax 재렌더링 =====
    renderMathJax(element = document) {
        renderMathJax(element);
    }

    // ===== 모든 Progressive 요소 초기 숨김 =====
    hideAllProgressiveElements() {
        this.frames.forEach(frame => {
            const allFocusElements = frame.element.querySelectorAll('[id*="focus"]');
            const allSceneTags = frame.element.querySelectorAll('.scene-tag');
            const allControlledElements = [...allFocusElements, ...allSceneTags];

            allControlledElements.forEach(element => {
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.transition = 'none'; // 초기 설정 시 트랜지션 없음
            });

            // 모든 화살표 초기에 숨김
            const allArrows = frame.element.querySelectorAll('.extraction-arrow, .extraction-arrow-overview, .flow-arrow, .content-arrow');
            allArrows.forEach(arrow => {
                arrow.classList.remove('arrow-visible');
            });
        });

        console.log('모든 progressive 요소들과 화살표 초기 숨김 완료');
    }

    // ===== 템플릿 데이터 추출 =====
    extractTemplateData() {
        const solveFrames = document.querySelectorAll('.solve-frame');

        solveFrames.forEach((frame, frameIndex) => {
            const frameData = {
                frameIndex: frameIndex,
                element: frame,
                transition: frame.getAttribute('data-transition') || 'fade',
                frameName: this.getFrameName(frameIndex),
                cuts: []
            };

            this.frames.push(frameData);
        });

        this.config.totalFrames = this.frames.length;
        console.log(`총 ${this.config.totalFrames}개의 프레임을 찾았습니다.`);
    }

    // ===== 프레임 이름 결정 =====
    getFrameName(frameIndex) {
        const frameNames = ['키워드 소개', '키워드 상세 설명', '해설 스텝 소개', '해설 단계별 풀이', '정답 확인 및 키워드 복습'];
        return frameNames[frameIndex] || `Frame ${frameIndex + 1}`;
    }

    // ===== 문제 높이 판단 =====
    determineProblemHeight() {
        const problemBlock = document.querySelector('.problem-block');
        if (problemBlock) {
            const rect = problemBlock.getBoundingClientRect();
            this.config.problemHeight = rect.height > 500 ? 'large' : 'small';

            // 레이아웃 클래스 적용
            const scenes = document.querySelectorAll('.problem-keyword-scene, .problem-step-scene');
            scenes.forEach(scene => {
                if (this.config.problemHeight === 'small') {
                    scene.classList.add('vertical-layout');
                }
            });
        }
    }

    // ===== 동적 Cut 개수 계산 시스템 =====
    calculateDynamicCutCounts() {
        const keywordScenes = document.querySelectorAll('.keyword-detail-scene');
        const stepScenes = document.querySelectorAll('.step-detail-scene');

        let keywordCounts = { comprehension: 0, extraction: 0, application: 0 };
        let stepCounts = [];

        // 키워드 타입별 개수 계산
        keywordScenes.forEach(scene => {
            const isExtraction = scene.classList.contains('keyword-parent-layout-extraction') ||
                scene.querySelector('.keyword-extraction-layout');
            const isComprehension = scene.classList.contains('keyword-parent-layout-comprehension') ||
                scene.querySelector('.keyword-comprehension-layout');
            const isApplication = scene.classList.contains('keyword-parent-layout-application') ||
                scene.querySelector('.keyword-application-layout');

            if (isExtraction) keywordCounts.extraction++;
            else if (isComprehension) keywordCounts.comprehension++;
            else if (isApplication) keywordCounts.application++;
        });

        // 단계별 내용 개수 계산
        stepScenes.forEach(scene => {
            const contentItems = scene.querySelectorAll(`[id*="focusStepContent"]`);
            stepCounts.push(contentItems.length);
        });

        // 프롬프트 공식에 따른 총 Cut 개수 계산
        const K = keywordScenes.length; // 총 키워드 개수
        const S = stepScenes.length; // 총 단계 개수

        const keywordCuts =
            (keywordCounts.comprehension * 2) + // 독해: 2개 Cut (하단설명 + 요약보기)
            (keywordCounts.extraction * 4) +    // 인출: 4개 Cut (좌측 + 우측 + 하단 + 요약보기)
            (keywordCounts.application * 4);    // 적용: 4개 Cut (입력 + 과정 + 결과 + 요약보기)

        const stepCuts = stepCounts.reduce((total, contentCount) =>
            total + (1 + contentCount), 0); // 각 단계: 1(제목) + N(내용)

        const totalCalculatedCuts = (1 + K) + keywordCuts + S + stepCuts + (3 + K);

        console.log('동적 Cut 개수 계산:', {
            키워드개수: K,
            키워드타입: keywordCounts,
            키워드Cuts: keywordCuts,
            단계개수: S,
            단계별내용: stepCounts,
            단계Cuts: stepCuts,
            계산된총Cuts: totalCalculatedCuts,
            공식: `(1+${K}) + ${keywordCuts} + ${S} + ${stepCuts} + ${3 + K} = ${totalCalculatedCuts}`
        });

        return {
            totalCalculatedCuts,
            keywordCounts,
            stepCounts,
            details: { K, S, keywordCuts, stepCuts }
        };
    }

    // ===== 디버깅: 정렬 문제 확인용 =====
    addAlignmentDebugging() {
        console.log('=== 정렬 디버깅 시작 ===');

        // 모든 주요 컨테이너들에 색깔별 border 추가
        const debugStyles = [
            { selector: '.content-scene', color: 'red', label: 'content-scene' },
            { selector: '.keyword-detail-scene', color: 'blue', label: 'keyword-detail-scene' },
            { selector: '.keyword-extraction-layout', color: 'orange', label: 'keyword-extraction-layout' },
            { selector: '.extraction-middle-section', color: 'purple', label: 'extraction-middle-section' },
            { selector: '.extraction-bottom', color: 'pink', label: 'extraction-bottom' },
            { selector: '.step-detail-scene', color: 'cyan', label: 'step-detail-scene' },
            { selector: '.step-content-item', color: 'yellow', label: 'step-content-item' }
        ];

        debugStyles.forEach(({ selector, color, label }) => {
            const elements = document.querySelectorAll(selector);
            console.log(`${label}: ${elements.length}개 요소 발견`);

            elements.forEach((el, index) => {
                const rect = el.getBoundingClientRect();
                el.style.border = `3px solid ${color}`;
                el.style.boxShadow = `inset 0 0 10px ${color}`;

                console.log(`  ${label}[${index}] - left: ${rect.left.toFixed(1)}, width: ${rect.width.toFixed(1)}, 중앙: ${(rect.left + rect.width / 2).toFixed(1)}`);

                // 텍스트 정렬 확인
                const computedStyle = window.getComputedStyle(el);
                console.log(`  ${label}[${index}] - display: ${computedStyle.display}, align-items: ${computedStyle.alignItems}, justify-content: ${computedStyle.justifyContent}, text-align: ${computedStyle.textAlign}`);
            });
        });

        console.log('화면 중앙:', window.innerWidth / 2);
        console.log('=== 정렬 디버깅 완료 ===');
    }

    // ===== 동적 스케일 계산 시스템 =====
    calculateScale(targetElementId) {
        return calculateScale(this, targetElementId);
    }

    // ===== 카메라 위치 동적 계산 =====
    calculateCameraPosition(targetElementId) {
        return calculateCameraPosition(this, targetElementId);
    }

    // ===== 그룹 영역 계산 (Step Title + Scene Tag) =====
    calculateGroupRect(targetElementId, targetElement) {
        return calculateGroupRect(this, targetElementId, targetElement);
    }

    // ===== Overview Mode 카메라 헬퍼 메서드 =====
    applyCameraToHighlight(highlightElement) {
        applyCameraToHighlight(this, highlightElement);
    }

    resetCameraToOverview() {
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) return;

        const frameElement = currentFrame.element;

        console.log('[Camera] Overview 원위치로 복귀');

        // 카메라 원점 복귀 효과음 재생
        this.playSoundEffect('화면 이동 Main (챠악).mp3');
        console.log('[Sound] 카메라 원점 복귀 효과음 재생');

        // 원래 overview mode 상태로 복귀 (scale 1, translate 0)
        // 기존 transition 완전히 초기화
        frameElement.style.transformOrigin = '50% 50%';
        frameElement.style.transition = 'none';

        // 첫 번째 프레임: transition 초기화 적용
        requestAnimationFrame(() => {
            // 강제 reflow
            void frameElement.offsetHeight;

            // 두 번째 프레임: 새로운 transition 설정
            requestAnimationFrame(() => {
                frameElement.style.transition = 'transform 0.8s ease-out';

                // 세 번째 프레임: transform 적용
                requestAnimationFrame(() => {
                    frameElement.style.transform = 'scale(1) translate(0, 0)';
                });
            });
        });
    }

    // SVG 효과 생성 (별, 체크, 동그라미)
    createSVGEffect(element, effectType, yOffset = 0, customOffset = null, fadeOutExtraDelay = 0) {
        createSVGEffect(element, effectType, yOffset, customOffset, fadeOutExtraDelay);
    }

    // 텍스트 SVG 효과 생성 (별/체크 단일 효과 오른쪽에 표시)
    createTextEffect(element, iconType, customText = null) {
        createTextEffect(element, iconType, customText);
    }

    // Step 상세 씬에서 하이라이트 스팬 감지 및 랜덤 효과 트리거 (target element만)
    triggerStepDetailHighlightEffects(targetElementId) {
        if (!targetElementId) return;

        // target element 가져오기
        const element = document.getElementById(targetElementId);
        if (!element) return;

        // step-detail-scene 내부인지 확인
        const isInStepDetailScene = element.closest('.step-detail-scene') !== null;
        if (!isInStepDetailScene) return;

        // 마지막 step의 마지막 step-content-item인지 확인 (특별 시퀀스 대상)
        if (element.classList.contains('step-content-item')) {
            const currentFrame = this.frames[this.currentFrameIndex];
            if (currentFrame) {
                const allStepDetailScenes = Array.from(currentFrame.element.querySelectorAll('.step-detail-scene'));
                if (allStepDetailScenes.length > 0) {
                    const lastStepScene = allStepDetailScenes[allStepDetailScenes.length - 1];
                    const stepDetailScene = element.closest('.step-detail-scene');
                    if (stepDetailScene === lastStepScene) {
                        const allStepItems = Array.from(lastStepScene.querySelectorAll('.step-content-item'));
                        const lastStepItem = allStepItems[allStepItems.length - 1];
                        if (element === lastStepItem) {
                            // 마지막 step의 마지막 item이므로 하이라이트 효과 스킵 (특별 시퀀스에서 처리)
                            console.log(`[Step Detail Highlight] 마지막 step-content-item - 하이라이트 효과 스킵`);
                            return;
                        }
                    }
                }
            }
        }

        // 이 요소 내부의 모든 하이라이트 스팬 찾기
        const highlightSpans = element.querySelectorAll('[class*="highlight-"]');
        if (highlightSpans.length === 0) return;

        console.log(`[Step Detail Highlight] ${targetElementId}에서 ${highlightSpans.length}개 하이라이트 발견`);

        // 각 하이라이트 스팬에 대해 랜덤 효과 적용 (약간의 딜레이를 두고)
        highlightSpans.forEach((span, index) => {
            // 요소가 실제로 보이는 시점(애니메이션 완료 후)에 효과 트리거
            setTimeout(() => {
                // step 상세 씬에서는 1~5번 단일 효과 사용
                const effects = [
                    'glow-pulse',      // 1. 밑줄
                    'glow-star',       // 2. 별표
                    'glow-check',      // 3. 체크
                    'glow-circle',     // 4. 동그라미
                    'glow-wavy'        // 5. 웨이브 밑줄
                ];
                const randomEffect = effects[Math.floor(Math.random() * effects.length)];

                console.log(`[Step Detail Highlight] ${span.className}에 ${randomEffect} 효과 적용`);

                // step 상세 씬에서는 단일 효과만 적용
                this.createSVGEffect(span, randomEffect);
            }, 800 + (index * 800)); // 각 하이라이트마다 0.8초 간격
        });
    }

    // keyword-item에 조합 효과 적용 (5-9번)
    applyKeywordItemCombinedEffect(element, effectType) {
        if (effectType === 'glow-circle-check') {
            // 9번: 동그라미(0ms) -> 체크(200ms), 모두 400ms에 사라짐
            // 동그라미: 200ms 대기 필요 (체크 등장 200 + 그리기 300 + 대기 100 - 동그라미 그리기 300 = 200)
            this.createSVGEffect(element, 'glow-circle', 0, null, 200);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-check');
            }, 200);
        } else if (effectType === 'glow-pulse-star') {
            // 5번: 밑줄(0ms) -> 별(200ms), 모두 600ms에 사라짐
            // 밑줄: 200ms 등장 대기 + 300ms 그리기 + 100ms 대기 = 600ms에 사라짐
            this.createSVGEffect(element, 'glow-pulse', 0, null, 200);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-star');
            }, 200);
        } else if (effectType === 'glow-double-pulse') {
            // 6번: 밑줄1(0ms) -> 밑줄2(200ms), 모두 600ms에 사라짐
            // 밑줄1: 200ms 등장 대기 + 300ms 그리기 + 100ms 대기 = 600ms에 사라짐
            this.createSVGEffect(element, 'glow-pulse', 0, null, 200);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-pulse', 8);
            }, 200);
        } else if (effectType === 'glow-double-pulse-star') {
            // 7번: 밑줄1(0ms) -> 밑줄2(200ms) -> 별(400ms), 모두 800ms에 사라짐
            // 밑줄1: 400ms 등장 대기, 밑줄2: 200ms 등장 대기
            this.createSVGEffect(element, 'glow-pulse', 0, null, 400);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-pulse', 8, null, 200);
            }, 200);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-star');
            }, 400);
        } else if (effectType === 'glow-pulse-curl-star') {
            // 8번: 밑줄(0ms) -> 돼지꼬리(200ms) -> 별(400ms), 모두 800ms에 사라짐
            // 밑줄: 400ms 등장 대기, 돼지꼬리: 200ms 등장 대기
            this.createSVGEffect(element, 'glow-pulse', 0, null, 400);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-curl', 0, null, 200);
            }, 200);
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                const customOffset = {
                    top: rect.top + rect.height * 0.5 - 30,
                    left: rect.right + 80,
                    scale: 1.2
                };
                this.createSVGEffect(element, 'glow-star', 0, customOffset);
            }, 400);
        } else if (effectType === 'glow-pulse-question') {
            // 10번: 밑줄(0ms) -> 물음표(200ms), 모두 600ms에 사라짐
            this.createSVGEffect(element, 'glow-pulse', 0, null, 200);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-question');
            }, 200);
        } else if (effectType === 'glow-circle-curl-arrow') {
            // 14번: 동그라미(0ms) -> 돼지꼬리(200ms) -> 화살표(400ms), 모두 800ms에 사라짐
            this.createSVGEffect(element, 'glow-circle', 0, null, 400);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-curl', 0, null, 200);
            }, 200);
            setTimeout(() => {
                this.createSVGEffect(element, 'glow-arrow');
            }, 400);
        }
    }

    // keyword-item이 target element가 될 때 하이라이트 효과 트리거
    triggerKeywordItemHighlightEffects(targetElementId) {
        if (!targetElementId) {
            console.log(`[Keyword Item Highlight] targetElementId 없음`);
            return;
        }

        const element = document.getElementById(targetElementId);
        if (!element) {
            console.log(`[Keyword Item Highlight] ${targetElementId} 요소를 찾을 수 없음`);
            return;
        }

        console.log(`[Keyword Item Highlight] ${targetElementId} 체크 중 - classList:`, Array.from(element.classList));

        // keyword-item인지 확인 (review-keyword-item 제외)
        if (!element.classList.contains('keyword-item') || element.classList.contains('review-keyword-item')) {
            console.log(`[Keyword Item Highlight] ${targetElementId}는 keyword-item이 아니거나 review-keyword-item임`);
            return;
        }

        console.log(`[Keyword Item Highlight] ${targetElementId} 처리 시작`);

        // 1. 하이라이트 스팬 찾기 (최우선)
        const highlightSpans = element.querySelectorAll('[class*="highlight-"]');
        if (highlightSpans.length > 0) {
            console.log(`[Keyword Item Highlight] ${highlightSpans.length}개 하이라이트 스팬 발견`);

            // 랜덤으로 하나 선택
            const randomSpan = highlightSpans[Math.floor(Math.random() * highlightSpans.length)];

            setTimeout(() => {
                const effects = [
                    'glow-circle-check',        // 9. 동그라미 + 체크
                    'glow-pulse-question',      // 10. 밑줄 + 물음표
                    'glow-circle-curl-arrow'    // 14. 동그라미 + 돼지꼬리 + 화살표
                ];

                // 같은 효과를 연속으로 사용하지 않도록 필터링
                let availableEffects = effects;
                if (this.lastKeywordItemEffect) {
                    availableEffects = effects.filter(effect => effect !== this.lastKeywordItemEffect);
                }

                const effectType = availableEffects[Math.floor(Math.random() * availableEffects.length)];
                this.lastKeywordItemEffect = effectType;
                this.keywordItemHighlightCount++;
                console.log(`[Keyword Item Highlight] 하이라이트 스팬에 ${effectType} 효과 적용`);
                this.applyKeywordItemCombinedEffect(randomSpan, effectType);
            }, 1500);
            return;
        }

        // 2. 하이라이트가 없으면 keyword-text 내부 확인
        const keywordText = element.querySelector('.keyword-text');
        if (!keywordText) return;

        // 수식 찾기
        const mathElements = keywordText.querySelectorAll('.math');
        if (mathElements.length > 0) {
            console.log(`[Keyword Item Highlight] ${mathElements.length}개 수식 발견`);

            // 랜덤으로 하나 선택
            const randomMath = mathElements[Math.floor(Math.random() * mathElements.length)];

            setTimeout(() => {
                const effects = [
                    'glow-circle-check',        // 9. 동그라미 + 체크
                    'glow-pulse-question',      // 10. 밑줄 + 물음표
                    'glow-circle-curl-arrow'    // 14. 동그라미 + 돼지꼬리 + 화살표
                ];

                // 같은 효과를 연속으로 사용하지 않도록 필터링
                let availableEffects = effects;
                if (this.lastKeywordItemEffect) {
                    availableEffects = effects.filter(effect => effect !== this.lastKeywordItemEffect);
                }

                const effectType = availableEffects[Math.floor(Math.random() * availableEffects.length)];
                this.lastKeywordItemEffect = effectType;
                this.keywordItemHighlightCount++;
                console.log(`[Keyword Item Highlight] 수식에 ${effectType} 효과 적용`);
                this.applyKeywordItemCombinedEffect(randomMath, effectType);
            }, 1500);
            return;
        }

        // 3. 수식이 없으면 마지막 단어 찾기
        const textContent = keywordText.textContent.trim();
        if (!textContent) return;

        // 마지막 단어 추출 (공백 기준)
        const words = textContent.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return;

        const lastWord = words[words.length - 1];
        console.log(`[Keyword Item Highlight] 마지막 단어 "${lastWord}" 발견`);

        // char-span이 있는 경우 (글자별 애니메이션) - 마지막 단어 전체를 감싸는 wrapper 생성
        const charSpans = keywordText.querySelectorAll('.char-span');
        if (charSpans.length > 0) {
            // 마지막 char-span들을 모아서 마지막 단어를 구성
            let targetSpans = [];
            let currentWord = '';

            // 뒤에서부터 char-span을 확인하여 마지막 단어에 해당하는 span들 수집
            for (let i = charSpans.length - 1; i >= 0; i--) {
                const char = charSpans[i].textContent;
                if (char.trim() === '') break; // 공백 만나면 중단
                currentWord = char + currentWord;
                targetSpans.unshift(charSpans[i]);
                if (currentWord === lastWord) break;
            }

            if (targetSpans.length > 0 && currentWord === lastWord) {
                console.log(`[Keyword Item Highlight] 마지막 단어 char-span ${targetSpans.length}개 발견`);

                // 마지막 단어 전체를 감싸는 wrapper span 생성
                const wrapper = document.createElement('span');
                wrapper.className = 'auto-highlight-target';
                wrapper.style.display = 'inline-block';

                // 첫 번째 char-span 앞에 wrapper 삽입
                const firstSpan = targetSpans[0];
                firstSpan.parentNode.insertBefore(wrapper, firstSpan);

                // 모든 char-span을 wrapper로 이동
                targetSpans.forEach(span => {
                    wrapper.appendChild(span);
                });

                setTimeout(() => {
                    const effects = [
                        'glow-circle-check',        // 9. 동그라미 + 체크
                        'glow-pulse-question',      // 10. 밑줄 + 물음표
                        'glow-circle-curl-arrow'    // 14. 동그라미 + 돼지꼬리 + 화살표
                    ];

                    // 같은 효과를 연속으로 사용하지 않도록 필터링
                    let availableEffects = effects;
                    if (this.lastKeywordItemEffect) {
                        availableEffects = effects.filter(effect => effect !== this.lastKeywordItemEffect);
                    }

                    const effectType = availableEffects[Math.floor(Math.random() * availableEffects.length)];
                    this.lastKeywordItemEffect = effectType;
                    this.keywordItemHighlightCount++;
                    console.log(`[Keyword Item Highlight] 마지막 단어(${lastWord})에 ${effectType} 효과 적용`);
                    this.applyKeywordItemCombinedEffect(wrapper, effectType);
                }, 1500);
            }
            return;
        }

        // char-span이 없는 경우 - 일반 텍스트 처리
        const innerHTML = keywordText.innerHTML;
        const lastWordIndex = innerHTML.lastIndexOf(lastWord);

        if (lastWordIndex !== -1) {
            const beforeWord = innerHTML.substring(0, lastWordIndex);
            const afterWord = innerHTML.substring(lastWordIndex + lastWord.length);

            const wrappedSpan = document.createElement('span');
            wrappedSpan.className = 'auto-highlight-target';
            wrappedSpan.textContent = lastWord;

            // innerHTML을 한번에 재구성
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = beforeWord;
            tempDiv.appendChild(wrappedSpan);

            // afterWord가 있으면 추가
            if (afterWord) {
                const afterSpan = document.createElement('span');
                afterSpan.innerHTML = afterWord;
                while (afterSpan.firstChild) {
                    tempDiv.appendChild(afterSpan.firstChild);
                }
            }

            // keywordText의 내용을 한번에 교체
            keywordText.innerHTML = '';
            while (tempDiv.firstChild) {
                keywordText.appendChild(tempDiv.firstChild);
            }

            setTimeout(() => {
                const effects = [
                    'glow-circle-check',        // 9. 동그라미 + 체크
                    'glow-pulse-question',      // 10. 밑줄 + 물음표
                    'glow-circle-curl-arrow'    // 14. 동그라미 + 돼지꼬리 + 화살표
                ];

                // 같은 효과를 연속으로 사용하지 않도록 필터링
                let availableEffects = effects;
                if (this.lastKeywordItemEffect) {
                    availableEffects = effects.filter(effect => effect !== this.lastKeywordItemEffect);
                }

                const effectType = availableEffects[Math.floor(Math.random() * availableEffects.length)];
                this.lastKeywordItemEffect = effectType;
                this.keywordItemHighlightCount++;
                console.log(`[Keyword Item Highlight] 마지막 단어에 ${effectType} 효과 적용`);
                this.applyKeywordItemCombinedEffect(wrappedSpan, effectType);
            }, 1500);
        }
    }

    // keyword-title이 target element가 될 때 효과 트리거 (1~5번 단일 효과)
    triggerKeywordTitleEffects(targetElementId) {
        if (!targetElementId) {
            console.log(`[Keyword Title Effect] targetElementId 없음`);
            return;
        }

        const element = document.getElementById(targetElementId);
        if (!element) {
            console.log(`[Keyword Title Effect] ${targetElementId} 요소를 찾을 수 없음`);
            return;
        }

        console.log(`[Keyword Title Effect] ${targetElementId} 체크 중 - classList:`, Array.from(element.classList));

        // keyword-title인지 확인
        if (!element.classList.contains('keyword-title')) {
            console.log(`[Keyword Title Effect] ${targetElementId}는 keyword-title이 아님`);
            return;
        }

        console.log(`[Keyword Title Effect] ${targetElementId} 처리 시작`);

        // keyword-title은 바로 .math를 자식으로 가지므로 .math 안에서 찾기
        const mathElement = element.querySelector('.math');
        if (!mathElement) {
            console.log(`[Keyword Title Effect] .math 요소를 찾을 수 없음`);
            return;
        }

        console.log(`[Keyword Title Effect] .math 요소 찾음:`, mathElement);
        console.log(`[Keyword Title Effect] .math children:`, mathElement.children.length, Array.from(mathElement.children).map(c => c.className));

        // 1. .math 내부의 하이라이트 스팬 찾기 (최우선, 화살표만 있는 스팬 제외)
        const allHighlightSpans = mathElement.querySelectorAll('[class*="highlight-"]');
        // 화살표(▲▼◀▶) 특수문자만 있는 스팬은 제외
        const highlightSpans = Array.from(allHighlightSpans).filter(span => {
            const text = span.textContent.trim();
            // 화살표만 있는지 체크 (다른 문자가 하나라도 있으면 포함)
            const onlyArrows = /^[▲▼◀▶\s]+$/.test(text);
            return !onlyArrows;
        });

        console.log(`[Keyword Title Effect] 하이라이트 스팬 체크: ${highlightSpans.length}개 (화살표만 있는 스팬 제외)`);
        if (highlightSpans.length > 0) {
            console.log(`[Keyword Title Effect] ${highlightSpans.length}개 하이라이트 스팬 발견`);

            // 랜덤으로 하나 선택
            const randomSpan = highlightSpans[Math.floor(Math.random() * highlightSpans.length)];

            setTimeout(() => {
                const effects = [
                    'glow-pulse',      // 1. 밑줄
                    'glow-star',       // 2. 별
                    'glow-check',      // 3. 체크
                    'glow-circle',     // 4. 동그라미
                    'glow-wavy'        // 5. 웨이브 밑줄
                ];
                const effectType = effects[Math.floor(Math.random() * effects.length)];
                console.log(`[Keyword Title Effect] 하이라이트 스팬에 ${effectType} 효과 적용`);
                this.createSVGEffect(randomSpan, effectType);
            }, 1500);
            return;
        }

        // 2. .math 내부에 수식 요소가 있는지 확인 (.math 또는 자식 요소들)
        const innerMathElements = mathElement.querySelectorAll('.math');
        const textContent = mathElement.textContent.trim();
        const children = Array.from(mathElement.children);

        console.log(`[Keyword Title Effect] 수식 체크 - innerMath: ${innerMathElements.length}개, children: ${children.length}개`);
        console.log(`[Keyword Title Effect] textContent:`, textContent);
        console.log(`[Keyword Title Effect] $ 포함 여부:`, textContent.includes('$'));

        // .math 요소에 자식이 있으면 수식으로 간주 (렌더링된 수식일 가능성)
        const hasLatex = textContent.includes('$') || innerMathElements.length > 0 || children.length > 0;

        if (hasLatex) {
            console.log(`[Keyword Title Effect] ✓ 수식 발견 - innerMath: ${innerMathElements.length}개, hasLatex: true`);

            // 수식이 있으면 우선 순위로 처리 (밑줄, 동그라미 위주)
            if (innerMathElements.length > 0) {
                // .math 클래스를 가진 자식 요소 중 랜덤 선택
                const randomMath = innerMathElements[Math.floor(Math.random() * innerMathElements.length)];

                setTimeout(() => {
                    // 수식에는 밑줄과 동그라미 위주로 사용
                    const effects = [
                        'glow-pulse',      // 밑줄
                        'glow-pulse',      // 밑줄 (가중치)
                        'glow-circle',     // 동그라미
                        'glow-circle',     // 동그라미 (가중치)
                        'glow-wavy'        // 웨이브 밑줄
                    ];
                    const effectType = effects[Math.floor(Math.random() * effects.length)];
                    console.log(`[Keyword Title Effect] 렌더링된 .math 수식에 ${effectType} 효과 적용`);
                    this.createSVGEffect(randomMath, effectType);
                }, 1500);
            } else if (children.length > 0) {
                // .math 클래스가 없지만 자식이 있으면 랜덤 선택
                const randomChild = children[Math.floor(Math.random() * children.length)];

                setTimeout(() => {
                    // 수식에는 밑줄과 동그라미 위주로 사용
                    const effects = [
                        'glow-pulse',      // 밑줄
                        'glow-pulse',      // 밑줄 (가중치)
                        'glow-circle',     // 동그라미
                        'glow-circle',     // 동그라미 (가중치)
                        'glow-wavy'        // 웨이브 밑줄
                    ];
                    const effectType = effects[Math.floor(Math.random() * effects.length)];
                    console.log(`[Keyword Title Effect] 자식 요소(${randomChild.className})에 ${effectType} 효과 적용`);
                    this.createSVGEffect(randomChild, effectType);
                }, 1500);
            } else {
                // 미렌더링 LaTeX면 .math div 전체에 효과
                setTimeout(() => {
                    // 수식에는 밑줄과 동그라미 위주로 사용
                    const effects = [
                        'glow-pulse',      // 밑줄
                        'glow-pulse',      // 밑줄 (가중치)
                        'glow-circle',     // 동그라미
                        'glow-circle',     // 동그라미 (가중치)
                        'glow-wavy'        // 웨이브 밑줄
                    ];
                    const effectType = effects[Math.floor(Math.random() * effects.length)];
                    console.log(`[Keyword Title Effect] 미렌더링 LaTeX에 ${effectType} 효과 적용`);
                    this.createSVGEffect(mathElement, effectType);
                }, 1500);
            }
            return;
        }

        // 3. LaTeX 수식이 없으면 .math 요소의 마지막 단어 찾기
        if (!textContent) return;

        // 마지막 단어 추출 (공백 기준)
        const words = textContent.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return;

        const lastWord = words[words.length - 1];
        console.log(`[Keyword Title Effect] 마지막 단어 "${lastWord}" 발견`);

        // char-span이 있는 경우 (글자별 애니메이션) - 마지막 단어 전체를 감싸는 wrapper 생성
        const charSpans = mathElement.querySelectorAll('.char-span');
        if (charSpans.length > 0) {
            // 마지막 char-span들을 모아서 마지막 단어를 구성
            let targetSpans = [];
            let currentWord = '';

            // 뒤에서부터 char-span을 확인하여 마지막 단어에 해당하는 span들 수집
            for (let i = charSpans.length - 1; i >= 0; i--) {
                const char = charSpans[i].textContent;
                if (char.trim() === '') break; // 공백 만나면 중단
                currentWord = char + currentWord;
                targetSpans.unshift(charSpans[i]);
                if (currentWord === lastWord) break;
            }

            if (targetSpans.length > 0 && currentWord === lastWord) {
                console.log(`[Keyword Title Effect] 마지막 단어 char-span ${targetSpans.length}개 발견`);

                // 마지막 단어 전체를 감싸는 wrapper span 생성
                const wrapper = document.createElement('span');
                wrapper.className = 'auto-highlight-target';
                wrapper.style.display = 'inline-block';

                // 첫 번째 char-span 앞에 wrapper 삽입
                const firstSpan = targetSpans[0];
                firstSpan.parentNode.insertBefore(wrapper, firstSpan);

                // 모든 char-span을 wrapper로 이동
                targetSpans.forEach(span => {
                    wrapper.appendChild(span);
                });

                setTimeout(() => {
                    const effects = [
                        'glow-pulse',      // 1. 밑줄
                        'glow-star',       // 2. 별
                        'glow-check',      // 3. 체크
                        'glow-circle',     // 4. 동그라미
                        'glow-wavy'        // 5. 웨이브 밑줄
                    ];
                    const effectType = effects[Math.floor(Math.random() * effects.length)];
                    console.log(`[Keyword Title Effect] 마지막 단어(${lastWord})에 ${effectType} 효과 적용`);
                    this.createSVGEffect(wrapper, effectType);
                }, 1500);
            }
            return;
        }

        // char-span이 없는 경우 - 일반 텍스트 처리
        const innerHTML = mathElement.innerHTML;
        const lastWordIndex = innerHTML.lastIndexOf(lastWord);

        if (lastWordIndex !== -1) {
            const beforeWord = innerHTML.substring(0, lastWordIndex);
            const afterWord = innerHTML.substring(lastWordIndex + lastWord.length);

            const wrappedSpan = document.createElement('span');
            wrappedSpan.className = 'auto-highlight-target';
            wrappedSpan.textContent = lastWord;

            // innerHTML을 한번에 재구성
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = beforeWord;
            tempDiv.appendChild(wrappedSpan);

            // afterWord가 있으면 추가
            if (afterWord) {
                const afterSpan = document.createElement('span');
                afterSpan.innerHTML = afterWord;
                while (afterSpan.firstChild) {
                    tempDiv.appendChild(afterSpan.firstChild);
                }
            }

            // mathElement의 내용을 한번에 교체
            mathElement.innerHTML = '';
            while (tempDiv.firstChild) {
                mathElement.appendChild(tempDiv.firstChild);
            }

            setTimeout(() => {
                const effects = [
                    'glow-pulse',      // 1. 밑줄
                    'glow-star',       // 2. 별
                    'glow-check',      // 3. 체크
                    'glow-circle',     // 4. 동그라미
                    'glow-wavy'        // 5. 웨이브 밑줄
                ];
                const effectType = effects[Math.floor(Math.random() * effects.length)];
                console.log(`[Keyword Title Effect] 마지막 단어에 ${effectType} 효과 적용`);
                this.createSVGEffect(wrappedSpan, effectType);
            }, 1500);
        }
    }

    // step-item이 target element가 될 때 효과 트리거 (1~5번 단일 효과)
    triggerStepItemEffects(targetElementId) {
        if (!targetElementId) {
            console.log(`[Step Item Effect] targetElementId 없음`);
            return;
        }

        const element = document.getElementById(targetElementId);
        if (!element) {
            console.log(`[Step Item Effect] ${targetElementId} 요소를 찾을 수 없음`);
            return;
        }

        console.log(`[Step Item Effect] ${targetElementId} 체크 중 - classList:`, Array.from(element.classList));

        // step-item인지 확인
        if (!element.classList.contains('step-item')) {
            console.log(`[Step Item Effect] ${targetElementId}는 step-item이 아님`);
            return;
        }

        console.log(`[Step Item Effect] ${targetElementId} 처리 시작`);

        // step-item은 .step-text를 자식으로 가지므로 .step-text 안에서 찾기
        const stepTextElement = element.querySelector('.step-text');
        if (!stepTextElement) {
            console.log(`[Step Item Effect] .step-text 요소를 찾을 수 없음`);
            return;
        }

        console.log(`[Step Item Effect] .step-text 요소 찾음:`, stepTextElement);
        console.log(`[Step Item Effect] .step-text innerHTML:`, stepTextElement.innerHTML);
        console.log(`[Step Item Effect] .step-text children:`, stepTextElement.children.length, Array.from(stepTextElement.children).map(c => c.className));

        // 1. .step-text 내부의 하이라이트 스팬 찾기 (최우선)
        const highlightSpans = stepTextElement.querySelectorAll('[class*="highlight-"]');
        console.log(`[Step Item Effect] 하이라이트 스팬 체크: ${highlightSpans.length}개`);
        if (highlightSpans.length > 0) {
            console.log(`[Step Item Effect] ${highlightSpans.length}개 하이라이트 스팬 발견`);

            // 랜덤으로 하나 선택
            const randomSpan = highlightSpans[Math.floor(Math.random() * highlightSpans.length)];

            setTimeout(() => {
                const effectType = 'glow-pulse'; // 밑줄만 사용
                console.log(`[Step Item Effect] 하이라이트 스팬에 ${effectType} 효과 적용`);
                this.createSVGEffect(randomSpan, effectType);
            }, 1500);
            return;
        }

        // 2. .step-text 내부에 수식 요소가 있는지 확인 (mjx-container로 렌더링된 수식)
        // 직계 자식만 선택 (중첩된 assistive-mml 내부 것들 제외)
        const innerMathElements = Array.from(stepTextElement.children).filter(child =>
            child.tagName === 'MJX-CONTAINER'
        );
        const textContent = stepTextElement.textContent.trim();
        const children = Array.from(stepTextElement.children);

        console.log(`[Step Item Effect] 수식 체크 - mjx-container: ${innerMathElements.length}개, children: ${children.length}개`);
        if (innerMathElements.length > 0) {
            console.log(`[Step Item Effect] mjx-container 요소들:`, Array.from(innerMathElements).map(m => ({
                tagName: m.tagName,
                innerHTML: m.innerHTML.substring(0, 100),
                offsetWidth: m.offsetWidth,
                children: m.children.length
            })));
        }
        console.log(`[Step Item Effect] textContent:`, textContent);
        console.log(`[Step Item Effect] $ 포함 여부:`, textContent.includes('$'));

        // mjx-container가 있으면 수식으로 간주
        const hasLatex = textContent.includes('$') || innerMathElements.length > 0;

        if (hasLatex && innerMathElements.length > 0) {
            console.log(`[Step Item Effect] ✓ 수식 발견 - mjx-container: ${innerMathElements.length}개`);

            // 수식이 여러 개일 경우 가장 긴 것을 선택
            let targetMath = innerMathElements[0];
            if (innerMathElements.length > 1) {
                let maxWidth = 0;
                innerMathElements.forEach(mathEl => {
                    const width = mathEl.offsetWidth;
                    if (width > maxWidth) {
                        maxWidth = width;
                        targetMath = mathEl;
                    }
                });
                console.log(`[Step Item Effect] ${innerMathElements.length}개 수식 중 가장 긴 것 선택 (width: ${maxWidth}px)`);
            }

            // mjx-container를 span으로 감싸서 효과 적용
            setTimeout(() => {
                // mjx-container를 감싸는 wrapper span 생성
                const wrapper = document.createElement('span');
                wrapper.style.cssText = 'position: relative; display: inline-block; overflow: visible !important;';

                // mjx-container를 wrapper로 감싸기
                targetMath.parentNode.insertBefore(wrapper, targetMath);
                wrapper.appendChild(targetMath);

                // wrapper와 부모들의 overflow를 visible로 명시적 설정
                wrapper.style.setProperty('overflow', 'visible', 'important');
                let parent = wrapper.parentElement;
                let depth = 0;
                while (parent && depth < 15) {
                    parent.style.setProperty('overflow', 'visible', 'important');
                    console.log(`[Wrapper Parent] overflow visible 설정: ${parent.className || parent.tagName}`);
                    if (parent.classList.contains('solve-frame')) {
                        break;
                    }
                    parent = parent.parentElement;
                    depth++;
                }

                const effectType = 'glow-pulse'; // 밑줄만 사용
                console.log(`[Step Item Effect] mjx-container wrapper에 ${effectType} 효과 적용`);
                this.createSVGEffect(wrapper, effectType);
            }, 1500);
            return;
        }

        // 3. LaTeX 수식이 없으면 .step-text 요소의 마지막 단어 찾기
        if (!textContent) return;

        // 마지막 단어 추출 (공백 기준)
        const words = textContent.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return;

        const lastWord = words[words.length - 1];
        console.log(`[Step Item Effect] 마지막 단어 "${lastWord}" 발견`);

        // char-span이 있는 경우 - step-item은 글자별 애니메이션이 없으므로 스킵

        // 일반 텍스트 처리
        const innerHTML = stepTextElement.innerHTML;
        const lastWordIndex = innerHTML.lastIndexOf(lastWord);

        if (lastWordIndex !== -1) {
            const beforeWord = innerHTML.substring(0, lastWordIndex);
            const afterWord = innerHTML.substring(lastWordIndex + lastWord.length);

            const wrappedSpan = document.createElement('span');
            wrappedSpan.className = 'auto-highlight-target';
            wrappedSpan.textContent = lastWord;

            // innerHTML을 한번에 재구성
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = beforeWord;
            tempDiv.appendChild(wrappedSpan);

            // afterWord가 있으면 추가
            if (afterWord) {
                const afterSpan = document.createElement('span');
                afterSpan.innerHTML = afterWord;
                while (afterSpan.firstChild) {
                    tempDiv.appendChild(afterSpan.firstChild);
                }
            }

            // stepTextElement의 내용을 한번에 교체
            stepTextElement.innerHTML = '';
            while (tempDiv.firstChild) {
                stepTextElement.appendChild(tempDiv.firstChild);
            }

            setTimeout(() => {
                const effectType = 'glow-pulse'; // 밑줄만 사용
                console.log(`[Step Item Effect] 마지막 단어에 ${effectType} 효과 적용`);
                this.createSVGEffect(wrappedSpan, effectType);
            }, 1500);
        }
    }

    // 하이라이트 색상 가져오기
    getHighlightColor(element) {
        return getHighlightColor(element);
    }

    findNearbyColor(element) {
        return findNearbyColor(element);
    }

    isWhiteColor(color) {
        return isWhiteColor(color);
    }

    isBlackColor(color) {
        const normalized = color.toLowerCase().replace(/\s/g, '');
        return normalized === 'rgb(0,0,0)' ||
            normalized === 'rgba(0,0,0,1)' ||
            normalized === '#000000' ||
            normalized === '#000' ||
            normalized === 'black';
    }

    getGreenColorFromCSS() {
        return getGreenColorFromCSS();
    }


    // ===== 프레임 활성화 =====
    activateFrame(frameIndex) {
        const previousFrameIndex = this.currentFrameIndex;

        // 이전 프레임이 있고 다른 프레임으로 전환하는 경우 fade out 적용
        if (previousFrameIndex !== undefined && previousFrameIndex !== frameIndex) {
            const previousFrame = this.frames[previousFrameIndex];
            if (previousFrame) {
                // 이전 프레임에 fade out 클래스 추가
                previousFrame.element.classList.add('fade-out');
                console.log(`프레임 ${previousFrameIndex} fade out 시작`);

                // 배경도 동시에 fade out/in 시작
                const backgroundDecoration = document.querySelector('.background-decoration');
                if (backgroundDecoration) {
                    // 키워드 상세 프레임 또는 스텝 프레임인 경우 배경 숨김
                    if (this.isKeywordDetailFrame(frameIndex) || this.isStepFrame(frameIndex)) {
                        backgroundDecoration.classList.add('hidden');
                    } else {
                        backgroundDecoration.classList.remove('hidden');
                    }
                }

                // 0.5초 후 이전 프레임 완전히 숨김
                setTimeout(() => {
                    previousFrame.element.classList.remove('active', 'fade-out');
                    previousFrame.element.classList.add('hidden');
                    console.log(`프레임 ${previousFrameIndex} fade out 완료`);
                }, 500);
            }
        }

        // 다른 프레임들 비활성화 (새로 활성화할 프레임 제외)
        this.frames.forEach((frameData, index) => {
            if (!frameData || !frameData.element) {
                return;
            }
            const frameElement = frameData.element;
            if (index !== frameIndex && index !== previousFrameIndex) {
                frameElement.classList.remove('active');
                frameElement.classList.add('hidden');
            }
        });
        // 현재 프레임 활성화
        const currentFrame = this.frames[frameIndex];
        currentFrame.element.classList.remove('hidden', 'fade-out');
        currentFrame.element.classList.add('active');

        this.currentFrameIndex = frameIndex;
        // 문제 오버레이 가시성 업데이트
        this.updateProblemOverlayVisibility(frameIndex);
        // Streaming 환경에서는 프레임이 DOM에 추가될 때 이미 모든 요소가 숨겨진 상태이므로
        // 여기서 다시 숨기지 않음 (moveToCut 실행 후 요소가 표시되는 것을 방지)
        // 비-Streaming 환경(일반 HTML 로드)에서만 요소 숨김 실행
        const isStreamingFrame = currentFrame.element.hasAttribute('data-streaming-frame');
        const streamingAttr = currentFrame.element.getAttribute('data-streaming-frame');
        const hasElement = !!currentFrame.element;
        if (!isStreamingFrame) {

            // 모든 프레임에서 progressive 요소들을 초기에 숨김
            const allFocusElements = currentFrame.element.querySelectorAll('[id*="focus"]');
            const allSceneTags = currentFrame.element.querySelectorAll('.scene-tag');
            const allControlledElements = [...allFocusElements, ...allSceneTags];

            allControlledElements.forEach(element => {
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.transition = 'none'; // 초기 설정 시 트랜지션 없음
            });

            // 모든 화살표 초기에 숨김
            const allArrows = currentFrame.element.querySelectorAll('.extraction-arrow, .extraction-arrow-overview, .flow-arrow, .content-arrow');
            allArrows.forEach(arrow => {
                arrow.classList.remove('arrow-visible');
            });
        }
    }

    // ===== 프레임 전환 =====
    transitionToFrame(fromIndex, toIndex, transitionType = 'smooth', targetCutNum = null) {
        const fromFrame = this.frames[fromIndex];
        const toFrame = this.frames[toIndex];

        if (transitionType === 'smooth') {
            // Frame 4, 5로의 전환인 경우 특별한 fade 효과 적용 (위치 이동 애니메이션 제거)
            if (toIndex === 3 || toIndex === 4) {
                // Frame 4 또는 5 준비 (배경 동그라미 초기화)
                toFrame.element.classList.remove('hidden');

                // 배경 동그라미 초기 상태 설정 (깜빡임 방지)
                const bgCircles = toFrame.element.querySelectorAll('.bg-circle');
                bgCircles.forEach(circle => {
                    circle.style.opacity = '0';
                    circle.classList.remove('bg-circle-fade-in-animation');
                });

                // 이전 Frame fade out
                fromFrame.element.classList.add('frame-fade-out');
                toFrame.element.classList.add('frame-fade-in');

                setTimeout(() => {
                    this.activateFrame(toIndex);

                    // 목표 cut이 지정되었으면 해당 cut으로, 없으면 첫 번째 cut으로 이동
                    const nextFrameCuts = this.allCuts.filter(c => c.frameIndex === toIndex);
                    if (nextFrameCuts.length > 0) {
                        const targetCut = targetCutNum || nextFrameCuts[0].cutIndex;
                        this.moveToCut(targetCut);
                    }

                    // 애니메이션 클래스 정리
                    setTimeout(() => {
                        fromFrame.element.classList.remove('frame-fade-out');
                        toFrame.element.classList.remove('frame-fade-in');
                        this.renderMathJax(toFrame.element); // MathJax 재렌더링
                    }, 800);
                }, 300); // fade out 중간에 전환 (크로스 페이드)
            } else {
                // 일반 전환 - key 상세→step 요약도 fade out 적용
                fromFrame.element.classList.add('frame-fade-out');

                setTimeout(() => {
                    this.activateFrame(toIndex);

                    // 목표 cut이 지정되었으면 해당 cut으로, 없으면 첫 번째 cut으로 이동
                    const nextFrameCuts = this.allCuts.filter(c => c.frameIndex === toIndex);
                    if (nextFrameCuts.length > 0) {
                        const targetCut = targetCutNum || nextFrameCuts[0].cutIndex;
                        this.moveToCut(targetCut);
                    }

                    // 애니메이션 클래스 정리
                    setTimeout(() => {
                        fromFrame.element.classList.remove('frame-fade-out');
                        this.renderMathJax(toFrame.element); // MathJax 재렌더링
                    }, 200);
                }, 500); // fade out 완료 후 전환
            }
        } else {
            // 기존 CSS 클래스 기반 전환 애니메이션
            const transitionClass = `frame-transition-${transitionType}`;
            const exitingClass = `frame-transition-${transitionType} exiting`;

            fromFrame.element.classList.add(...exitingClass.split(' '));
            toFrame.element.classList.add(...transitionClass.split(' '));

            // 800ms 후 정리
            setTimeout(() => {
                this.activateFrame(toIndex);
                // 클래스 정리
                fromFrame.element.classList.remove(...exitingClass.split(' '));
                toFrame.element.classList.remove(...transitionClass.split(' '));
                this.renderMathJax(toFrame.element); // MathJax 재렌더링
            }, 800);
        }
    }

    // ===== 문제 영역 토글 설정 =====
    setupProblemToggle() {
        const problemHeaders = document.querySelectorAll('.problem-header');
        problemHeaders.forEach(header => {
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
            });
        });
    }

    // ===== 문제 오버레이 시스템 =====
    // ===== Problem Overlay 래퍼 메서드들 =====
    initializeProblemOverlay() {
        initializeProblemOverlay(this);
    }

    updateProblemOverlayVisibility(frameIndex) {
        updateProblemOverlayVisibility(frameIndex);
    }

    updateProblemOverlaySize(size) {
        updateProblemOverlaySize(size);
    }

    enforceMinimizedFontSize() {
        // Handled by problem-overlay-manager
    }

    toggleProblemOverlay() {
        toggleProblemOverlay();
    }

    // ===== Scene 가시성 제어 (STEP 전용) =====
    updateSceneVisibility(frameIndex, targetElement, cutInfo = null) {
        const currentFrame = this.frames[frameIndex];
        if (!currentFrame) return;

        const contentArea = currentFrame.element.querySelector('.dynamic-content-area');
        if (!contentArea) return;

        const allScenes = contentArea.querySelectorAll('.content-scene');

        // 키워드 전체보기 Cut들을 동적으로 감지 (전달받은 cutInfo 우선 사용)
        let currentCut, isKeywordOverviewCut;
        if (cutInfo) {
            currentCut = cutInfo;
            isKeywordOverviewCut = cutInfo.name && cutInfo.name.includes('전체보기');
        } else {
            currentCut = this.allCuts.find(c => c.cutIndex === this.currentCut);
            isKeywordOverviewCut = currentCut && currentCut.name && currentCut.name.includes('전체보기');
        }
        const isDebugCut = isKeywordOverviewCut;

        // 키워드 전체보기 Cut 감지 디버깅  
        if (cutInfo && [10, 15, 20].includes(cutInfo.cutIndex)) {
            console.log(`Cut ${cutInfo.cutIndex} Scene 가시성 - 키워드 전체보기 감지:`, {
                currentCut: currentCut,
                cutName: currentCut?.name,
                includes전체보기: currentCut?.name?.includes('전체보기'),
                isKeywordOverviewCut: isKeywordOverviewCut
            });
        }
        if (isDebugCut) {
            const cutIndex = cutInfo ? cutInfo.cutIndex : this.currentCut;
            console.log(`Cut ${cutIndex} - Scene 가시성 제어:`, {
                targetElement,
                totalScenes: allScenes.length,
                sceneClasses: Array.from(allScenes).map(s => Array.from(s.classList))
            });
        }

        // 현재 타겟이 어떤 Scene에 속하는지 찾기
        let activeScene = null;
        if (targetElement) {
            const targetEl = document.getElementById(targetElement);
            if (targetEl) {
                activeScene = targetEl.closest('.content-scene');
                if (isDebugCut) {
                    const cutIndex = cutInfo ? cutInfo.cutIndex : this.currentCut;
                    console.log(`Cut ${cutIndex} - 활성 Scene:`, activeScene ? Array.from(activeScene.classList) : 'none');
                }
            }
        }

        // Scene 가시성 제어
        allScenes.forEach((scene, index) => {
            const isListScene = scene.classList.contains('keyword-list-scene') || scene.classList.contains('step-list-scene');
            const isStepDetailScene = scene.classList.contains('step-detail-scene');
            const isAnswerScene = scene.classList.contains('problem-answer-scene');
            const isKeywordDetailScene = scene.classList.contains('keyword-detail-scene');

            let shouldDisplay = false;
            let reason = '';

            if (!activeScene) {
                // 전체 보기 - Overview Mode에서 처리
                if (isKeywordOverviewCut && cutInfo) {
                    // 키워드 전체보기인 경우: 해당 키워드 Scene + 키워드 목록 Scene만 표시
                    const frameNumber = frameIndex + 1;
                    // Scene index는 키워드 순서에 맞춰 1, 2, 3으로 사용
                    const sceneIndex = cutInfo.cutIndex === 10 ? 1 : cutInfo.cutIndex === 15 ? 2 : 3;
                    const targetKeywordSceneId = `keywordDetailScene${frameNumber}_${sceneIndex}`;
                    const isTargetKeywordScene = scene.id === targetKeywordSceneId;

                    if (isListScene || isTargetKeywordScene) {
                        shouldDisplay = true;
                        reason = isListScene ? '전체보기-키워드목록' : '전체보기-해당키워드';
                    } else {
                        shouldDisplay = false;
                        reason = '전체보기-다른키워드숨김';
                    }
                } else if (isKeywordDetailScene || isListScene) {
                    shouldDisplay = true;
                    reason = '전체보기-키워드상세/목록';
                } else {
                    shouldDisplay = scene === allScenes[0];
                    reason = '전체보기-첫번째만';
                }
            } else if (isStepDetailScene) {
                // STEP 상세 장면은 항상 모두 표시 (세로 배치)
                shouldDisplay = true;
                reason = 'STEP상세';
            } else if (isAnswerScene) {
                // Frame 3의 정답 Scene은 항상 표시
                shouldDisplay = true;
                reason = '정답Scene';
            } else if (scene === activeScene) {
                // 현재 활성 Scene 표시 (키워드 상세)
                shouldDisplay = true;
                reason = '활성Scene';
            } else if (isListScene) {
                // list scene은 항상 표시 (KEY/STEP 태그를 위해)
                shouldDisplay = true;
                reason = 'List Scene';
            } else {
                // 다른 Scene들 숨김 (키워드 상세 설명은 개별 표시)
                shouldDisplay = false;
                reason = '기타-숨김';
            }

            scene.style.display = shouldDisplay ? 'block' : 'none';

            if (isDebugCut) {
                const cutIndex = cutInfo ? cutInfo.cutIndex : this.currentCut;
                console.log(`Cut ${cutIndex} - Scene ${index}:`, {
                    classes: Array.from(scene.classList),
                    display: shouldDisplay ? 'block' : 'none',
                    reason: reason
                });
            }
        });
    }

    // ===== 포커스 오버레이 업데이트 =====
    updateFocusOverlay(targetElementId) {
        const overlay = document.getElementById('focusOverlay');

        if (!targetElementId) {
            overlay.style.background = '';
            overlay.style.clipPath = '';
            return;
        }

        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            overlay.style.background = '';
            overlay.style.clipPath = '';
            return;
        }

        // 변환 완료 후 정확한 위치 계산을 위해 지연 적용
        setTimeout(() => {
            this.calculateAccurateFocusPosition(targetElement, overlay);
        }, 600); // 카메라 변환 완료(500ms) + 안전 여유시간
    }

    // ===== 정확한 포커스 위치 계산 =====
    calculateAccurateFocusPosition(targetElement, overlay) {
        // Step Title인 경우 그룹 영역으로 계산
        const groupRect = this.calculateGroupRect(targetElement.id, targetElement);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 그룹 전체의 실제 중심점을 화면 기준 퍼센트로 계산
        const elementCenterX = groupRect.left + (groupRect.width / 2);
        const elementCenterY = groupRect.top + (groupRect.height / 2);

        const centerX = (elementCenterX / viewportWidth) * 100;
        const centerY = (elementCenterY / viewportHeight) * 100;

        // 그룹 크기 기반 포커스 영역 계산
        const targetWidth = groupRect.width;
        const targetHeight = groupRect.height;

        const padding = 120;
        const focusAreaWidth = targetWidth + (padding * 2);
        const focusAreaHeight = targetHeight + (padding * 2);

        const ellipseWidth = Math.max(20, (focusAreaWidth / viewportWidth) * 100 * 0.8);
        const ellipseHeight = Math.max(15, (focusAreaHeight / viewportHeight) * 100 * 0.8);

        const gradientWidth = ellipseWidth * 1.3;
        const gradientHeight = ellipseHeight * 1.3;

        // 계산된 실제 위치로 포커스 오버레이 적용
        overlay.style.clipPath = '';
        overlay.style.background = `radial-gradient(
            ellipse ${gradientWidth}% ${gradientHeight}% at ${centerX}% ${centerY}%,
            transparent 0%,
            transparent 35%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.5) 70%,
            rgba(0, 0, 0, 0.75) 100%
        )`;

        console.log(`포커스 오버레이 위치 계산 완료: center(${centerX.toFixed(1)}%, ${centerY.toFixed(1)}%), 크기(${gradientWidth.toFixed(1)}% x ${gradientHeight.toFixed(1)}%)`);
    }

    // ===== Progressive Visibility 제어 =====
    updateProgressiveVisibility(revealElements, targetElement) {
        console.log(`>>>>>>> updateProgressiveVisibility 호출됨! revealElements=`, revealElements, `targetElement=`, targetElement);
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) {
            console.log(`>>>>>>> currentFrame이 없음! currentFrameIndex=${this.currentFrameIndex}`);
            return;
        }

        // 현재 프레임의 모든 focus 요소들과 scene-tag 요소들, visualization-container, step-item, keyword-layout 요소들 찾기
        const allFocusElements = currentFrame.element.querySelectorAll('[id*="focus"]');
        const allSceneTags = currentFrame.element.querySelectorAll('.scene-tag');
        const allVisualizationContainers = currentFrame.element.querySelectorAll('.visualization-container');
        const allStepItems = currentFrame.element.querySelectorAll('.step-item');
        const allKeywordLayouts = currentFrame.element.querySelectorAll('.keyword-comprehension-layout, .keyword-extraction-layout, .keyword-application-layout');
        const allControlledElements = [...allFocusElements, ...allSceneTags, ...allVisualizationContainers, ...allStepItems, ...allKeywordLayouts];

        // revealElements가 없으면 모든 요소 숨김
        if (!revealElements || revealElements.length === 0) {
            console.log(`>>>>>>> revealElements가 없어서 모든 요소 숨김`);
            allControlledElements.forEach(element => {
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.transition = 'opacity 1s cubic-bezier(0.5, 0, 0.4, 1), visibility 1s cubic-bezier(0.5, 0, 0.4, 1)';
                element.classList.remove('reveal-dimmed', 'reveal-focus');
            });
            return;
        }

        // Border 애니메이션 트리거
        this.triggerBorderAnimations(revealElements);

        // 시각화 컨테이너 렌더링
        this.renderVisualizations(revealElements);

        // keywordDetailScene이 target일 때 모든 요소에서 reveal-dimmed 미리 제거
        const isKeywordDetailSceneTarget = targetElement && targetElement.match(/keywordDetailScene\d+$/);
        if (isKeywordDetailSceneTarget) {
            allControlledElements.forEach(element => {
                element.classList.remove('reveal-dimmed');
            });
        }

        // 각 요소의 가시성 설정
        let visibleCount = 0;
        allControlledElements.forEach(element => {
            let shouldReveal = revealElements.includes(element.id);

            // 레이아웃 요소(ID 없음)의 경우, 자식 중 하나라도 reveal되면 reveal된 것으로 간주
            if (!element.id && (element.classList.contains('keyword-comprehension-layout') ||
                element.classList.contains('keyword-extraction-layout') ||
                element.classList.contains('keyword-application-layout'))) {
                const children = element.querySelectorAll('[id*="focusKeywordContent"]');
                shouldReveal = Array.from(children).some(child => revealElements.includes(child.id));
            }

            const isTargetElement = element.id === targetElement;

            // 키워드 상세 프레임과 스텝 프레임에서 오퍼시티 예외 처리
            let shouldExcludeFromOpacity = isTargetElement;
            const isCurrentKeywordDetailFrame = this.isKeywordDetailFrame();
            const isCurrentStepFrame = this.isStepFrame();

            // 레이아웃 컨테이너 요소는 opacity 제어에서 제외
            if (element.classList.contains('keyword-comprehension-layout') ||
                element.classList.contains('keyword-extraction-layout') ||
                element.classList.contains('keyword-application-layout')) {
                shouldExcludeFromOpacity = true;
            }

            // 스텝 프레임: focusStepTitle이 target일 때 같은 SCENE_INDEX를 가진 stepDetailTag만 opacity 제외
            if (isCurrentStepFrame && targetElement && targetElement.includes('focusStepTitle')) {
                const targetMatch = targetElement.match(/focusStepTitle(\d+)_(\d+)/);
                if (targetMatch) {
                    const frameNum = targetMatch[1];
                    const targetSceneIndex = targetMatch[2];
                    if (element.id === `stepDetailTag${frameNum}_${targetSceneIndex}`) {
                        shouldExcludeFromOpacity = true;
                    }
                }
            }

            // 키워드 상세 프레임: 오퍼시티 예외 처리
            if (isCurrentKeywordDetailFrame && targetElement) {
                // focusKeywordTitle{{FRAME_NUMBER}}가 target일 때
                if (targetElement.includes('focusKeywordTitle')) {
                    const targetMatch = targetElement.match(/focusKeywordTitle(\d+)/);
                    if (targetMatch) {
                        const frameNum = targetMatch[1];
                        // 같은 프레임의 keywordDetailTag 제외
                        if (element.id === `keywordDetailTag${frameNum}`) {
                            shouldExcludeFromOpacity = true;
                        }
                    }
                }

                // focusKeywordContent{{FRAME_NUMBER}}_combined는 무조건 오퍼시티 제외
                if (element.id && element.id.match(/focusKeywordContent\d+_combined/)) {
                    shouldExcludeFromOpacity = true;
                }

                // focusKeywordContent{{FRAME_NUMBER}}_combined가 target일 때 관련 요소들 처리
                if (targetElement.match(/focusKeywordContent\d+_combined/)) {
                    const match = targetElement.match(/focusKeywordContent(\d+)_combined/);
                    if (match) {
                        const frameNum = match[1];

                        // _1은 항상 제외 (독해, 인출, 적용 모두)
                        if (element.id === `focusKeywordContent${frameNum}_1`) {
                            shouldExcludeFromOpacity = true;
                            console.log(`${element.id} 오퍼시티 제외 - 모든 유형`);
                        }

                        // DOM 요소 존재로 문제 유형 판단
                        const hasElement2 = document.getElementById(`focusKeywordContent${frameNum}_2`);
                        const hasElement3 = document.getElementById(`focusKeywordContent${frameNum}_3`);

                        // 인출: _2가 있고 _3이 없으면 인출 키워드
                        if (hasElement2 && !hasElement3) {
                            if (element.id === `focusKeywordContent${frameNum}_2`) {
                                shouldExcludeFromOpacity = true;
                                console.log(`${element.id} 오퍼시티 제외 - 인출 키워드`);
                            }
                        }

                        // 적용: _3이 있으면 적용 키워드
                        if (hasElement3) {
                            if (element.id === `focusKeywordContent${frameNum}_2` ||
                                element.id === `focusKeywordContent${frameNum}_3`) {
                                shouldExcludeFromOpacity = true;
                                console.log(`${element.id} 오퍼시티 제외 - 적용 키워드`);
                            }
                        }
                    }
                }

                // keywordDetailScene{{FRAME_NUMBER}}가 target element인 경우
                if (targetElement.match(/keywordDetailScene\d+/)) {
                    const match = targetElement.match(/keywordDetailScene(\d+)/);
                    if (match) {
                        const frameNum = match[1];
                        const problemType = this.problemTypeByFrame?.[this.currentFrameIndex];

                        // 독해의 경우
                        if (problemType === 'reading') {
                            const excludeIds = [
                                `keywordDetailScene${frameNum}`,
                                `keywordDetailTag${frameNum}`,
                                `focusKeywordTitle${frameNum}`,
                                `focusKeywordContent${frameNum}_combined`,
                                `focusKeywordContent${frameNum}_1`
                            ];
                            if (excludeIds.includes(element.id)) {
                                shouldExcludeFromOpacity = true;
                            }
                        }
                        // 인출과 적용의 경우
                        else if (problemType === 'extraction' || problemType === 'application') {
                            const excludeIds = [
                                `keywordDetailTag${frameNum}`,
                                `focusKeywordTitle${frameNum}`,
                                `focusKeywordContent${frameNum}_combined`,
                                `focusKeywordContent${frameNum}_1`,
                                `focusKeywordContent${frameNum}_2`,
                                `focusKeywordContent${frameNum}_3`
                            ];
                            if (excludeIds.includes(element.id)) {
                                shouldExcludeFromOpacity = true;
                            }
                        }
                    }
                }
            }

            if (shouldReveal) {
                // 키워드 상세 프레임과 스텝 프레임에서 opacity 적용
                // keywordDetailScene이 target이면 reveal-dimmed 추가하지 않음 (이미 위에서 제거됨)
                const isKeywordDetailSceneTarget = targetElement && targetElement.match(/keywordDetailScene\d+/);
                if ((isCurrentKeywordDetailFrame || isCurrentStepFrame) && !shouldExcludeFromOpacity && !isKeywordDetailSceneTarget) {
                    // 키워드/스텝 프레임에서 target과 관련 요소가 아닌 것들만 dimmed
                    element.classList.add('reveal-dimmed');
                    element.classList.remove('reveal-focus');
                    // 인라인 opacity 스타일 제거하여 CSS가 제어하도록 함
                    element.style.removeProperty('opacity');
                } else {
                    // 키워드/스텝 상세가 아니거나 target/관련 element인 경우 정상 표시
                    element.classList.remove('reveal-dimmed');
                    element.classList.remove('reveal-focus');
                    // 오버뷰 프레임 또는 overview mode cut에서는 opacity를 0.3 -> 1로 전환
                    const isCurrentOverviewFrame = this.isOverviewFrame();
                    const currentCutData = this.allCuts && this.allCuts[this.currentCut - 1];
                    const isOverviewModeCut = currentCutData && currentCutData.isOverviewMode;

                    // overview mode cut일 때 glow는 OverviewSequenceController가 담당
                    // 기존 자동 glow flag 설정 제거

                    if (isCurrentOverviewFrame || isOverviewModeCut) {
                        // Overview mode에서 모든 요소는 0.3 -> 1로 부드럽게 전환
                        element.style.transition = 'opacity 1s cubic-bezier(0.5, 0, 0.4, 1)';
                        element.style.opacity = '0.3';
                        // 짧은 지연 후 1로 전환
                        setTimeout(() => {
                            element.style.opacity = '1';
                        }, 50);
                    } else {
                        // Frame 1, 3에서 target인 경우는 인라인 opacity 제거하여 CSS가 제어
                        element.style.removeProperty('opacity');
                    }
                }

                // 인출 키워드 combined 요소의 경우 - 처음에 오른쪽 부분 숨기기
                if (element.id && element.id.includes('_combined') && element.classList.contains('extraction-middle-section')) {
                    element.style.visibility = 'visible';
                    // 키워드 상세 또는 스텝 프레임에서 target과 관련 요소가 아닌 것에 0.3 적용
                    element.style.opacity = ((isCurrentKeywordDetailFrame || isCurrentStepFrame) && !shouldExcludeFromOpacity) ? '0.3' : '1';
                }

                // 태그 요소인 경우 특별한 애니메이션 적용
                else if (element.classList.contains('scene-tag')) {
                    console.log(`[Scene Tag] scene-tag 감지: ${element.id}, classList:`, Array.from(element.classList));

                    element.style.visibility = 'visible';
                    element.style.opacity = '1';

                    // 모든 animation 관련 클래스 제거
                    element.classList.remove('tag-animate', 'first-frame');

                    // 이미 애니메이션이 설정된 경우는 다시 설정하지 않음
                    if (!element.hasAttribute('data-scene-tag-animated')) {
                        // 효과음 재생
                        this.playSoundForElement(element);

                        // 지정된 애니메이션이 있으면 적용
                        const animation = this.getSceneTagAnimation(element.id);
                        if (animation) {
                            // 커스텀 애니메이션
                            let duration = '1000ms';
                            let easing = 'ease-out';
                            if (animation === 'openUpRightReturn') {
                                duration = '500ms';
                            } else if (animation === 'bounceIn') {
                                duration = '800ms';
                                easing = 'ease-out';
                            }
                            element.style.animation = `${animation} ${duration} ${easing} forwards`;
                        } else {
                            // 지정된 애니메이션이 없으면 기본 애니메이션 적용
                            element.style.animation = 'tagScaleAnimation 1000ms ease-out forwards';
                        }
                        element.setAttribute('data-scene-tag-animated', 'true');

                        // keyword-list-scene의 KEY TAG(scene-tag)가 처음 등장할 때만 특별 효과 추가 (첫 번째 프레임만)
                        const keywordListScene = element.closest('.keyword-list-scene');
                        const isIntroFrame = this.currentFrameIndex === 0;
                        console.log(`[Scene Tag] keywordListScene 찾기 결과:`, keywordListScene);
                        console.log(`[Scene Tag] tagDecorated 상태:`, element.dataset.tagDecorated);
                        console.log(`[Scene Tag] currentFrameIndex:`, this.currentFrameIndex, `isIntroFrame:`, isIntroFrame);

                        if (keywordListScene && !element.dataset.tagDecorated && isIntroFrame) {
                            element.dataset.tagDecorated = 'true';
                            console.log(`[Keyword Tag Decoration] KEY TAG 첫 프레임 첫 등장 - 태그 장식 효과 시작`);

                            // 태그 등장 후 순서대로 시작 (today -> 선 -> 별)
                            setTimeout(() => {
                                console.log(`[Keyword Tag Decoration] 효과 실행 중...`);

                                // 1. today! 텍스트 (fade in) - 즉시
                                this.createTextEffect(element, 'tag-decoration', 'today!');

                                // 2. 강조선 2개 (그려지기) - 400ms 후
                                setTimeout(() => {
                                    this.createSVGEffect(element, 'glow-accent-lines', 0, null, 0);
                                }, 400);

                                // 3. 별 (그려지기) - 800ms 후
                                setTimeout(() => {
                                    this.createSVGEffect(element, 'glow-eyes', 0, null, 0);
                                }, 800);

                                // SVG 추가 확인
                                setTimeout(() => {
                                    const svgs = document.querySelectorAll('.glow-svg, .glow-text-svg');
                                    console.log(`[Keyword Tag Decoration] body의 glow-svg 개수 (실행 후):`, svgs.length);
                                    svgs.forEach((svg, i) => {
                                        console.log(`[Keyword Tag Decoration] SVG ${i}:`, svg, 'style:', svg.style.cssText);
                                    });
                                }, 1000);
                            }, 800);
                        } else {
                            console.log(`[Scene Tag] 조건 불만족 - keywordListScene: ${!!keywordListScene}, tagDecorated: ${element.dataset.tagDecorated}`);
                        }
                    } else {
                        console.log(`[Scene Tag] 이미 애니메이션 적용됨`);
                    }
                } else if (element.classList.contains('keyword-title') || element.classList.contains('step-title')) {
                    // title 애니메이션 - 간단한 마스크 애니메이션만 적용
                    if (!element.hasAttribute('data-animated')) {
                        // 효과음 재생
                        this.playSoundForElement(element);
                        element.style.visibility = 'visible';
                        element.style.opacity = '1';
                        element.classList.add('reveal-animate');
                        element.setAttribute('data-animated', 'true');
                        console.log(`>>>>>>> ${element.id}에 애니메이션 적용: visibility=visible, opacity=1`);
                    } else {
                        element.style.visibility = 'visible';
                        element.style.opacity = '1';
                        console.log(`>>>>>>> ${element.id} 이미 애니메이션됨: visibility=visible, opacity=1`);
                    }
                } else if (element.classList.contains('keyword-item') || element.classList.contains('review-keyword-item') || element.classList.contains('step-item')) {
                    // keyword-item인 경우만 글자별 애니메이션 적용 (review-keyword-item 제외)
                    if (element.classList.contains('keyword-item') && !element.classList.contains('review-keyword-item')) {
                        if (!element.hasAttribute('data-animated')) {
                            // 효과음 재생
                            this.playSoundForElement(element);

                            const keywordText = element.querySelector('.keyword-text');
                            if (keywordText && !keywordText.hasAttribute('data-split')) {
                                // 먼저 띄어쓰기 렌더링 (span 없이)
                                const text = keywordText.textContent;
                                keywordText.innerHTML = '';

                                let charIndex = 0;
                                text.split('').forEach((char) => {
                                    if (char === ' ') {
                                        // 스페이스는 span 없이 그냥 추가
                                        const textNode = document.createTextNode(' ');
                                        keywordText.appendChild(textNode);
                                    } else {
                                        // 글자만 span으로 감싸서 애니메이션 적용 가능하게
                                        const span = document.createElement('span');
                                        span.className = 'char-span';
                                        span.textContent = char;
                                        // 각 글자마다 딜레이 설정 (0.04s씩 증가 - 빠른 흐름)
                                        span.style.animationDelay = (charIndex * 0.04) + 's';
                                        keywordText.appendChild(span);
                                        charIndex++;
                                    }
                                });
                                keywordText.setAttribute('data-split', 'true');
                            }

                            // 애니메이션 트리거
                            element.style.visibility = 'visible';
                            element.classList.remove('reveal-animate');
                            requestAnimationFrame(() => {
                                element.classList.add('reveal-animate');
                            });
                            element.setAttribute('data-animated', 'true');
                        } else {
                            // 이미 애니메이션된 요소 - reveal-animate 클래스 제거 (애니메이션 반복 방지)
                            element.style.visibility = 'visible';
                            element.classList.remove('reveal-animate');
                            const isCurrentOverviewFrame = this.isOverviewFrame();
                            if (isCurrentOverviewFrame || !element.classList.contains('reveal-dimmed')) {
                                element.style.opacity = '1';
                            }
                            // 스페이스 표시 (이미 HTML에 포함되어 있음)
                            const keywordText = element.querySelector('.keyword-text');
                            if (keywordText) {
                                keywordText.style.visibility = 'visible';
                            }
                        }
                    } else if (element.classList.contains('review-keyword-item')) {
                        // review-keyword-item은 전체 아이템 슬라이드 애니메이션 (글자별 분리 없음)
                        if (!element.hasAttribute('data-animated')) {
                            // 효과음 재생
                            this.playSoundForElement(element);

                            element.style.visibility = 'visible';
                            element.classList.remove('reveal-animate');

                            requestAnimationFrame(() => {
                                element.classList.add('reveal-animate');
                            });
                            element.setAttribute('data-animated', 'true');
                        } else {
                            // 이미 애니메이션된 요소
                            element.style.visibility = 'visible';
                            element.classList.remove('reveal-animate');
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                        }
                    } else if (element.classList.contains('step-item')) {
                        // step-item은 슬라이드 + fade in 애니메이션 적용
                        if (!element.hasAttribute('data-animated')) {
                            // 효과음 재생
                            this.playSoundForElement(element);

                            element.style.visibility = 'visible';
                            element.classList.remove('reveal-animate');
                            requestAnimationFrame(() => {
                                element.classList.add('reveal-animate');
                            });
                            element.setAttribute('data-animated', 'true');
                        } else {
                            // 이미 애니메이션된 요소
                            element.style.visibility = 'visible';
                            element.classList.remove('reveal-animate');
                            element.style.opacity = '1';
                            element.style.transform = 'translateX(0)';
                        }
                    } else {
                        // keyword-title, step-title 등
                        element.style.visibility = 'visible';
                        element.classList.remove('reveal-animate');
                        const isCurrentOverviewFrame = this.isOverviewFrame();
                        if (isCurrentOverviewFrame || !element.classList.contains('reveal-dimmed')) {
                            element.style.opacity = '1';
                        }
                    }

                    element.style.mask = 'linear-gradient(90deg, black 0%, black 100%)';
                    element.style.webkitMask = 'linear-gradient(90deg, black 0%, black 100%)';
                } else {
                    // 일반 요소 보이기 (트랜지션과 함께)
                    // extraction-left/right/bottom, flow-step 등에 대한 효과음 재생
                    if (!element.hasAttribute('data-sound-played')) {
                        this.playSoundForElement(element);
                        element.setAttribute('data-sound-played', 'true');
                    }

                    // review-area가 등장할 때 크기 조정
                    if (element.classList.contains('review-area')) {
                        setTimeout(() => {
                            this.adjustReviewAreaItems(element);
                        }, 100);
                    }

                    element.style.transition = 'opacity 1s cubic-bezier(0.5, 0, 0.4, 1), visibility 1s cubic-bezier(0.5, 0, 0.4, 1)';
                    element.style.visibility = 'visible';
                    // reveal-focus/reveal-dimmed 클래스가 opacity를 제어함
                    if (!element.classList.contains('reveal-focus') && !element.classList.contains('reveal-dimmed')) {
                        element.style.opacity = '1';
                    }
                }
                visibleCount++;
            } else {
                // 요소 숨기기
                element.classList.remove('reveal-dimmed', 'reveal-focus');
                if (element.classList.contains('scene-tag')) {
                    element.style.animation = 'none';
                    element.style.visibility = 'hidden';
                    element.style.opacity = '0';
                    element.style.transform = 'scale(0)';
                } else if (element.classList.contains('keyword-item') || element.classList.contains('review-keyword-item') || element.classList.contains('step-item') || element.classList.contains('keyword-title') || element.classList.contains('step-title') || element.classList.contains('math')) {
                    element.classList.remove('reveal-animate');
                    element.style.visibility = 'hidden';
                    element.removeAttribute('data-animated');
                } else {
                    element.style.transition = 'opacity 1s cubic-bezier(0.5, 0, 0.4, 1), visibility 1s cubic-bezier(0.5, 0, 0.4, 1)';
                    element.style.visibility = 'hidden';
                    element.style.opacity = '0';
                }
            }
        });

        // 디버깅: 키워드 전체보기 Cut들을 동적으로 감지하여 상세 정보 출력
        const currentCut = this.allCuts.find(c => c.cutIndex === this.currentCut);
        const isKeywordOverviewCut = currentCut && currentCut.name && currentCut.name.includes('전체보기');
        if (isKeywordOverviewCut) {
            console.log(`Cut ${this.currentCut} 디버깅 - Progressive visibility:`, {
                cutName: this.allCuts.find(c => c.cutIndex === this.currentCut)?.name,
                revealElements: revealElements,
                visibleCount: visibleCount,
                totalElements: allControlledElements.length,
                allElementIds: Array.from(allControlledElements).map(el => el.id)
            });

            // 실제 DOM 요소들이 존재하는지 확인
            revealElements.forEach(id => {
                const element = document.getElementById(id);
                console.log(`요소 ${id} 존재 여부:`, !!element, element ? '찾음' : '없음');
            });
        }

        console.log(`Progressive visibility 업데이트: ${revealElements.length}개 요소 표시`);

        // 이전 Cut의 revealElements와 비교하여 새로 추가된 요소만 찾기 
        const previousRevealElements = this.keywordItemHighlightApplied || new Set();

        // 새로 추가된 keyword-item 찾기 
        const newKeywordItems = revealElements.filter(elementId => {
            const element = document.getElementById(elementId);
            const isKeywordItem = element && element.classList.contains('keyword-item') && !element.classList.contains('review-keyword-item');
            const isNew = !previousRevealElements.has(elementId);
            return isKeywordItem && isNew;
        });

        console.log(`[Keyword Item Highlight] 새로 추가된 keyword-item: ${newKeywordItems.length}개`, newKeywordItems);

        // 새로 추가된 keyword-item에만 효과 트리거
        newKeywordItems.forEach(elementId => {
            this.triggerKeywordItemHighlightEffects(elementId);
            // 추적 Set에 추가 
            this.keywordItemHighlightApplied.add(elementId);
        });

        // 새로 추가된 keyword-title 찾기
        const newKeywordTitles = revealElements.filter(elementId => {
            const element = document.getElementById(elementId);
            const isKeywordTitle = element && element.classList.contains('keyword-title');
            const isNew = !previousRevealElements.has(elementId);
            return isKeywordTitle && isNew;
        });

        console.log(`[Keyword Title Effect] 새로 추가된 keyword-title: ${newKeywordTitles.length}개`, newKeywordTitles);

        // 새로 추가된 keyword-title에만 효과 트리거
        newKeywordTitles.forEach(elementId => {
            this.triggerKeywordTitleEffects(elementId);
            // 추적 Set에 추가
            this.keywordItemHighlightApplied.add(elementId);
        });

        // 새로 추가된 step-item 찾기
        const newStepItems = revealElements.filter(elementId => {
            const element = document.getElementById(elementId);
            const isStepItem = element && element.classList.contains('step-item');
            const isNew = !previousRevealElements.has(elementId);
            return isStepItem && isNew;
        });

        console.log(`[Step Item Effect] 새로 추가된 step-item: ${newStepItems.length}개`, newStepItems);

        // 새로 추가된 step-item에만 효과 트리거
        newStepItems.forEach(elementId => {
            this.triggerStepItemEffects(elementId);
            // 추적 Set에 추가
            this.keywordItemHighlightApplied.add(elementId);
        });

        // Step 상세 씬에서 하이라이트 스팬 감지 및 랜덤 효과 트리거 (target element만)
        this.triggerStepDetailHighlightEffects(targetElement);
    }

    // ===== 시각화 렌더링 (math-visualization.js로 위임) =====
    renderVisualizations(revealElements) {
        // MathVisualization 모듈로 위임 (선택적)
        if (typeof MathVisualization !== 'undefined') {
            MathVisualization.renderAll(revealElements);
        }
        // 시각화 모듈이 없어도 정상 작동 (시각화가 필요 없는 경우)
    }

    // ===== Border 애니메이션 트리거 =====
    triggerBorderAnimations(revealElements) {
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) return;

        // 각 reveal 요소에 대해 해당하는 border 박스 찾기
        revealElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (!element) return;

            // 독해 키워드 박스 찾기
            const comprehensionBox = element.closest('.comprehension-explanation-box');
            if (comprehensionBox && !comprehensionBox.classList.contains('border-animate')) {
                this.createBorderSVG(comprehensionBox, 25); // border-radius 25px
                setTimeout(() => {
                    comprehensionBox.classList.add('border-animate');
                    console.log('독해 키워드 border 애니메이션 시작:', elementId);
                }, 100); // 텍스트보다 약간 지연
            }

            // 인출 키워드 박스 찾기
            const extractionBottom = element.closest('.extraction-bottom');
            if (extractionBottom && !extractionBottom.classList.contains('border-animate')) {
                this.createBorderSVG(extractionBottom, 25); // border-radius 25px
                setTimeout(() => {
                    extractionBottom.classList.add('border-animate');
                    console.log('인출 키워드 border 애니메이션 시작:', elementId);
                }, 100);
            }

            // Frame 4의 review-area 박스 찾기
            const reviewArea = element.closest('.review-area');
            if (reviewArea && !reviewArea.classList.contains('border-animate')) {
                this.createReviewAreaBorderSVG(reviewArea, 20); // border-radius 20px
                setTimeout(() => {
                    reviewArea.classList.add('border-animate');
                    console.log('Frame 4 review-area border 애니메이션 시작:', elementId);
                }, 100);
            }

            // step-list-scene의 step-tag 찾기
            const stepTag = element.closest('.step-list-scene .scene-tag.step-tag');
            if (stepTag && stepTag.dataset.needsBorderSvg === 'true' && !stepTag.classList.contains('border-animate')) {
                // SVG가 아직 생성되지 않았다면 생성
                if (!stepTag.querySelector('.border-svg')) {
                    this.createStepTagBorderSVG(stepTag);
                }
                setTimeout(() => {
                    stepTag.classList.add('border-animate');
                    console.log('Step Tag border 애니메이션 시작:', elementId);
                }, 100);
            }

            // 적용 키워드는 원래 border가 없으므로 제외
        });
    }

    // ===== SVG Border 생성 =====
    createBorderSVG(container, borderRadius) {
        // 이미 SVG가 있으면 생성하지 않음
        if (container.querySelector('.border-svg')) return;

        // 컨테이너의 실제 크기 가져오기
        const rect = container.getBoundingClientRect();
        const width = rect.width + 4; // border 두께 고려
        const height = rect.height + 4;

        const borderDiv = document.createElement('div');
        borderDiv.className = 'border-svg';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.width = '100%';
        svg.style.height = '100%';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 시계 반대방향: 왼쪽 위 모서리부터 시작 (커브 시작점)
        const r = borderRadius;
        const pathData = `M 2 ${r}
                         L 2 ${height - r - 2}
                         Q 2 ${height - 2} ${r} ${height - 2}
                         L ${width - r - 2} ${height - 2}
                         Q ${width - 2} ${height - 2} ${width - 2} ${height - r - 2}
                         L ${width - 2} ${r}
                         Q ${width - 2} 2 ${width - r - 2} 2
                         L ${r} 2
                         Q 2 2 2 ${r}`;

        path.setAttribute('d', pathData);

        svg.appendChild(path);
        borderDiv.appendChild(svg);
        container.appendChild(borderDiv);

        // Path 길이 계산하여 정확한 dasharray 설정
        setTimeout(() => {
            const pathLength = path.getTotalLength();
            path.style.strokeDasharray = `0 ${pathLength}`;
            path.style.strokeDashoffset = '0';

            // CSS 변수로 길이 설정
            container.style.setProperty('--path-length', pathLength);

            console.log('SVG border 생성 완료:', container.className, `경로 길이: ${pathLength}`);
        }, 10);
    }

    // ===== Review Area SVG Border 생성 (상단 가운데 시작) =====
    createReviewAreaBorderSVG(container, borderRadius) {
        // 기존 SVG가 있으면 제거
        const existingSVG = container.querySelector('.border-svg');
        if (existingSVG) {
            existingSVG.remove();
        }

        // 컨테이너의 실제 크기 가져오기
        const rect = container.getBoundingClientRect();
        const width = rect.width + 4; // border 두께 고려
        const height = rect.height + 4;

        const borderDiv = document.createElement('div');
        borderDiv.className = 'border-svg';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.width = '100%';
        svg.style.height = '100%';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 시계 반대방향: 상단 가운데부터 시작
        const r = borderRadius;
        console.log('Review Area Border Radius:', r);
        const centerX = width / 2;
        const pathData = `M ${centerX} 2
                         L ${r + 2} 2
                         A ${r} ${r} 0 0 0 2 ${r + 2}
                         L 2 ${height - r - 2}
                         A ${r} ${r} 0 0 0 ${r + 2} ${height - 2}
                         L ${width - r - 2} ${height - 2}
                         A ${r} ${r} 0 0 0 ${width - 2} ${height - r - 2}
                         L ${width - 2} ${r + 2}
                         A ${r} ${r} 0 0 0 ${width - r - 2} 2
                         L ${centerX} 2`;

        path.setAttribute('d', pathData);

        svg.appendChild(path);
        borderDiv.appendChild(svg);
        container.appendChild(borderDiv);

        // Path 길이 계산하여 정확한 dasharray 설정
        setTimeout(() => {
            const pathLength = path.getTotalLength();
            path.style.strokeDasharray = `0 ${pathLength}`;
            path.style.strokeDashoffset = '0';

            // CSS 변수로 길이 설정
            container.style.setProperty('--path-length', pathLength);

            console.log('Review Area SVG border 생성 완료:', container.className, `경로 길이: ${pathLength}`);
        }, 10);
    }

    // ===== 키워드 타입 감지 =====
    getKeywordType(cut) {
        if (!cut || !cut.name) return null;

        const name = cut.name.toLowerCase();
        if (name.includes('독해') || name.includes('comprehension')) return 'comprehension';
        if (name.includes('인출') || name.includes('extraction')) return 'extraction';
        if (name.includes('적용') || name.includes('application')) return 'application';

        // Cut 이름으로 판단이 안 되면 targetElement로 판단
        if (cut.targetElement) {
            const element = document.getElementById(cut.targetElement);
            if (element) {
                if (element.closest('.keyword-comprehension-layout')) return 'comprehension';
                if (element.closest('.keyword-extraction-layout')) return 'extraction';
                if (element.closest('.keyword-application-layout')) return 'application';
            }
        }

        return null;
    }

    // ===== 키워드 fade out 체크 및 적용 =====
    checkAndApplyKeywordFadeOut(revealElements) {
        if (!revealElements || revealElements.length === 0) return;

        try {
            // 이전 reveal된 요소들과 현재 reveal 요소들 비교
            if (this.lastRevealElements) {
                // 키워드 번호 추출
                const previousNumbers = this.lastRevealElements.map(id => this.extractKeywordNumber(id)).filter(n => n !== null);
                const currentNumbers = revealElements.map(id => this.extractKeywordNumber(id)).filter(n => n !== null);

                // 중복 제거
                const uniquePrevious = [...new Set(previousNumbers)];
                const uniqueCurrent = [...new Set(currentNumbers)];

                // 번호 변경 감지
                if (uniquePrevious.length > 0 && uniqueCurrent.length > 0 &&
                    JSON.stringify(uniquePrevious.sort()) !== JSON.stringify(uniqueCurrent.sort())) {

                    console.log(`🎭 키워드 번호 변경: ${uniquePrevious} → ${uniqueCurrent}`);

                    // 이전 번호들에 해당하는 요소들 fade out
                    uniquePrevious.forEach(num => {
                        if (!uniqueCurrent.includes(num)) {
                            this.fadeOutKeywordNumber(num);
                        }
                    });
                }
            }

            // 현재 reveal 요소들 저장
            this.lastRevealElements = [...revealElements];
        } catch (error) {
            console.error('키워드 fade out 체크 중 오류:', error);
        }
    }

    // ===== 키워드 번호에서 숫자 추출 =====
    extractKeywordNumber(elementId) {
        if (!elementId) return null;
        const match = elementId.match(/(\d+)_(\d+)$/);
        return match ? parseInt(match[2]) : null;
    }

    // ===== 특정 키워드 번호 fade out =====
    fadeOutKeywordNumber(keywordNumber) {
        try {
            const currentFrame = this.frames[this.currentFrameIndex];
            if (!currentFrame) return;

            const elements = currentFrame.element.querySelectorAll(`[id*="_${keywordNumber}"]`);
            console.log(`🎭 키워드 ${keywordNumber}번 fade out: ${elements.length}개 요소`);

            elements.forEach(element => {
                element.classList.add('keyword-fade-out');
            });

            setTimeout(() => {
                elements.forEach(element => {
                    element.classList.remove('keyword-fade-out');
                });
            }, 1000);
        } catch (error) {
            console.error(`키워드 ${keywordNumber}번 fade out 중 오류:`, error);
        }
    }

    // ===== 테스트용 간단한 fade out =====
    testSimpleFadeOut() {
        try {
            console.log('🧪 fade out 테스트 시작');
            const currentFrame = this.frames[this.currentFrameIndex];
            if (!currentFrame) return;

            // 현재 보이는 모든 키워드 요소에 fade out 적용
            const keywordElements = currentFrame.element.querySelectorAll('[id*="focus"], [id*="keyword"]');
            console.log(`🧪 테스트 대상: ${keywordElements.length}개 요소`);

            keywordElements.forEach(element => {
                element.classList.add('keyword-fade-out');
            });

            setTimeout(() => {
                keywordElements.forEach(element => {
                    element.classList.remove('keyword-fade-out');
                });
                console.log('🧪 fade out 테스트 완료');
            }, 1000);
        } catch (error) {
            console.error('fade out 테스트 중 오류:', error);
        }
    }

    // ===== 키워드 번호 추출 (ID에서 마지막 숫자 추출) =====
    getKeywordNumber(targetElementId) {
        if (!targetElementId) return null;

        try {
            // 2_1, 2_2, 2_3 패턴에서 마지막 숫자 추출
            const match = targetElementId.match(/(\d+)_(\d+)$/);
            if (match) {
                return parseInt(match[2]); // 마지막 숫자 (1, 2, 3)
            }

            // keywordDetailScene2_1 패턴 처리
            const sceneMatch = targetElementId.match(/keywordDetailScene\d+_(\d+)$/);
            if (sceneMatch) {
                return parseInt(sceneMatch[1]);
            }

            return null;
        } catch (error) {
            console.error('키워드 번호 추출 중 오류:', error);
            return null;
        }
    }

    // ===== 화살표 가시성 제어 (일반화된 버전) =====
    updateArrowVisibility(cutIndex) {
        updateArrowVisibility(this, cutIndex);
    }

    // ===== Step Detail Scene 배경 동그라미 fade-in 제어 (미사용) =====
    updateStepDetailCircleVisibility(cut) {
        // 이 함수는 더 이상 사용하지 않음
        // step 태그 애니메이션과 동시에 triggerStepBackgroundFadeIn()을 사용
    }

    // ===== 키워드 전환 fade-out 기능 제거됨 =====

    // ===== 요소 가시성 확인 헬퍼 함수 =====
    isElementVisible(element) {
        if (!element) return false;

        const style = window.getComputedStyle(element);
        return style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            style.display !== 'none';
    }

    updateProblemOverlayPosition(cut) {
        updateProblemOverlayPosition(this, cut);
    }



    // ===== Cut 이동 =====
    moveToCut(cutNum) {
        console.log(`moveToCut(${cutNum}) 호출됨. allCuts 개수:`, this.allCuts.length);

        const cut = this.allCuts.find(c => c.cutIndex === cutNum);
        if (!cut) {
            console.log(`Cut ${cutNum}을 찾을 수 없습니다. 사용 가능한 Cut들:`, this.allCuts.map(c => c.cutIndex));
            return;
        }

        console.log(`Cut ${cutNum} 찾음:`, cut);

        // Cut 19 디버깅
        if (cutNum === 19) {
            console.log(`🔍 Cut 19 상세 정보:`);
            console.log(`  - frameIndex: ${cut.frameIndex}`);
            console.log(`  - targetElement: ${cut.targetElement}`);
            console.log(`  - revealElements: ${cut.revealElements}`);
            console.log(`  - name: ${cut.name}`);
        }

        // 키워드 번호 체크 제거됨 (시스템 안정성을 위해)

        // 키워드 전환 fade-out 기능 제거됨

        // currentCut 업데이트를 먼저 수행 (오류 발생해도 업데이트되도록)
        this.currentCut = cutNum;
        console.log(`currentCut을 ${cutNum}으로 업데이트했습니다.`);

        // Scene 전환 로직 제거: 각 키워드는 이제 독립된 프레임이므로 프레임 전환으로 처리됨

        try {

            // 키워드 전체보기 Cut들을 동적으로 감지 (cut.name에 "전체보기"가 포함된 경우)
            const isKeywordOverviewCut = cut.name && cut.name.includes('전체보기');

            // 프레임 전환이 필요한 경우
            if (cut.frameIndex !== this.currentFrameIndex) {
                // currentFrameIndex는 activateFrame()에서 업데이트됨
                const fromIndex = this.currentFrameIndex;
                this.transitionToFrame(fromIndex, cut.frameIndex, 'smooth', cutNum);
                return;
            }

            const currentFrame = this.frames[this.currentFrameIndex];
            const frameElement = currentFrame.element;
            let overlay = document.getElementById('focusOverlay');

            // focusOverlay가 없으면 생성
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'focusOverlay';
                overlay.className = 'focus-overlay';
                document.body.appendChild(overlay);
                console.log('focusOverlay 요소를 생성했습니다.');
            }

            // 문제 오버레이 크기 조절 (Cut에 정의된 크기 사용)
            if (cut.problemSize) {
                this.updateProblemOverlaySize(cut.problemSize);
            }

            // Scene 가시성 제어
            this.updateSceneVisibility(this.currentFrameIndex, cut.targetElement, cut);

            // 콘텐츠 progressive visibility 제어 (키워드/step 상세 씬만 카메라 이동 후에 처리)
            // DOM 조회 대신 문자열 패턴으로 scene 타입 판별 (스트리밍 호환)
            const isKeywordDetailScene = this.isKeywordDetailSceneByName(cut.targetElement);
            const isStepDetailScene = this.isStepDetailSceneByName(cut.targetElement);

            // keywordDetailScene이나 stepDetailScene 자체가 target인 경우는 예외
            const isSceneIdAsTarget = cut.targetElement && (cut.targetElement.includes('keywordDetailScene') || cut.targetElement.includes('stepDetailScene'));

            if ((!isKeywordDetailScene && !isStepDetailScene) || isSceneIdAsTarget) {
                this.updateProgressiveVisibility(cut.revealElements, cut.targetElement);
                // Progressive visibility 후 화살표 dimmed 업데이트
                this.updateArrowVisibility(cutNum);
            }

            // 화살표 가시성 제어 (visibility만 업데이트, dimmed는 progressive visibility 이후 처리)
            this.updateArrowVisibility(cutNum);

            // step detail scene 배경 동그라미 fade-in 제어
            this.updateStepDetailCircleVisibility(cut);

            // 사용자가 드래그하지 않은 경우 자동 위치 조정
            this.updateProblemOverlayPosition(cut);

            // 정답 프레임 - 카메라 고정, Overview Mode와 동일하게 처리
            const isCurrentAnswerFrame = this.isAnswerFrame();

            // Overview Mode 우선 체크 또는 정답 프레임
            if (cut.isOverviewMode || isCurrentAnswerFrame) {
                // Overview Mode: 문제 영역 위치는 유지, 전체 보기 유지

                // 키워드 전체보기 Cut들 디버깅: Overview Mode 처리 과정 상세 로그
                if (isKeywordOverviewCut) {
                    console.log(`Cut ${cutNum} Overview Mode 처리 시작`);
                }

                if (isCurrentAnswerFrame) {
                    console.log(`Cut ${cutNum} 정답 프레임 - 카메라 고정 모드`);
                }

                // 키워드/STEP 목록 씬은 항상 중앙에 고정 (하지만 키워드 상세 씬은 제외)
                const listScenes = frameElement.querySelectorAll('.keyword-list-scene, .step-list-scene');
                listScenes.forEach(scene => {
                    if (isKeywordOverviewCut) {
                        console.log(`List scene 처리:`, scene.classList);
                    }
                    scene.style.position = 'fixed';
                    scene.style.top = '50%';
                    scene.style.left = '50%';
                    scene.style.transform = 'translate(-50%, -50%)';
                    scene.style.zIndex = '15';
                });

                frameElement.style.transform = 'scale(1) translate(0, 0)';
                frameElement.style.transformOrigin = '50% 50%';
                frameElement.style.transition = 'transform 1s cubic-bezier(0.5, 0, 0.4, 1)';

                // 포커스 오버레이 제거 (전체가 명확하게 보이도록)
                overlay.classList.remove('active');
                this.updateFocusOverlay(null);

                // 텍스트 애니메이션 트리거 (transform 리셋 후에 실행)
                this.applyTextAnimations(cutNum);

                // 키워드 전체보기 Cut들 디버깅: Progressive visibility 재적용 확인
                if (isKeywordOverviewCut) {
                    console.log(`Cut ${cutNum} Overview Mode - Progressive visibility 재적용:`, cut.revealElements);
                    // Progressive visibility를 다시 적용하여 확실히 보이도록 함
                    setTimeout(() => {
                        this.updateProgressiveVisibility(cut.revealElements, cut.targetElement);
                    }, 50);
                }

                // 키워드 상세 씬 내부의 Overview Mode에서만 하이라이트 시퀀스 시작
                if (cut.isOverviewMode) {
                    console.log(`Cut ${cutNum} Overview Mode 감지 - name: "${cut.name}"`);

                    // 이전 시퀀스가 있다면 즉시 취소
                    if (this.overviewSequence.isActive) {
                        console.log(`Cut ${cutNum} 이전 시퀀스 취소`);
                        this.overviewSequence.cancel();
                    }

                    // 현재 프레임에 키워드 상세 씬이 있는지 확인
                    const currentFrame = this.frames[this.currentFrameIndex];
                    const hasKeywordDetailScene = currentFrame && currentFrame.element.querySelector('.keyword-detail-scene') !== null;

                    // 타이틀 씬인지 확인: revealElements에 타이틀/태그만 있고 컨텐츠가 없으면 타이틀 씬
                    const isTitleScene = cut.revealElements &&
                        cut.revealElements.every(id => id.includes('keywordDetailTag') || id.includes('focusKeywordTitle'));

                    console.log(`  - hasKeywordDetailScene: ${hasKeywordDetailScene}`);
                    console.log(`  - isTitleScene: ${isTitleScene}`);
                    console.log(`  - currentFrameIndex: ${this.currentFrameIndex}`);
                    console.log(`  - frame element:`, currentFrame ? currentFrame.element.className : 'null');

                    if (hasKeywordDetailScene && !isTitleScene) {
                        console.log(`Cut ${cutNum} 키워드 상세 씬의 Overview Mode - 하이라이트 시퀀스 3초 후 시작 예약`);

                        // 키워드 상세 프레임 Overview 모드 진입 효과음 재생
                        this.playSoundEffect('화면 이동 Main (챠악).mp3');
                        console.log('[Sound] 키워드 상세 프레임 Overview 모드 진입 효과음 재생');

                        // 3초 지연을 start 메서드에 전달
                        this.overviewSequence.start(cut, 1000);
                    } else {
                        console.log(`Cut ${cutNum} 키워드 상세 씬이 아닌 Overview Mode 또는 타이틀 씬 - 시퀀스 스킵`);
                    }
                }

                // transform이 override되지 않도록 확인 (애니메이션 후)
                // 단, 오버뷰 시퀀스가 활성화된 경우에는 카메라 제어를 방해하지 않음
                setTimeout(() => {
                    if (this.overviewSequence.isActive) {
                        // 시퀀스 활성화 중에는 transform 리셋 안 함
                        return;
                    }
                    // 이미 설정된 값이므로 확인만 하고 재설정 안 함
                    if (frameElement.style.transform !== 'scale(1) translate(0px, 0px)') {
                        frameElement.style.transform = 'scale(1) translate(0, 0)';
                    }
                }, 150);

            } else if (cut.isProblemFocus && !this.isAnswerFrame(cut.frameIndex)) {
                // 문제 오버레이에 포커스하는 경우 (단, 정답 프레임은 제외)

                if (!overlay.classList.contains('active')) {
                    overlay.classList.add('active');
                }

                // 콘텐츠 영역은 기본 위치로
                frameElement.style.transform = 'scale(1) translate(0, 0)';
                frameElement.style.transformOrigin = '50% 50%';
                frameElement.style.transition = 'transform 1s cubic-bezier(0.5, 0, 0.4, 1)';

                // 텍스트 애니메이션 트리거
                this.applyTextAnimations(cutNum);

                // 포커스 오버레이 업데이트 (약간 지연)
                setTimeout(() => {
                    this.updateFocusOverlay(cut.targetElement);
                }, 50);
            } else if (cut.targetElement) {

                // CSS Transform을 전체 프레임에 적용 (단, 키워드/STEP 목록 씬은 제외)
                const listScenes = frameElement.querySelectorAll('.keyword-list-scene, .step-list-scene');
                listScenes.forEach(scene => {
                    // step-detail-scene은 제외
                    if (!scene.classList.contains('step-detail-scene')) {
                        scene.style.transform = 'none';
                        scene.style.position = 'fixed';
                        scene.style.top = '50%';
                        scene.style.left = '50%';
                        scene.style.transform = 'translate(-50%, -50%)';
                        scene.style.zIndex = '15';
                    }
                });

                // step-detail-scene은 고정 위치로 강제 설정
                const stepDetailScenes = frameElement.querySelectorAll('.step-detail-scene');
                stepDetailScenes.forEach(scene => {
                    scene.style.transform = 'none';
                    scene.style.position = 'static';
                    scene.style.top = 'auto';
                    scene.style.left = 'auto';
                });

                // 먼저 카메라 위치 이동 (요소 표시 전에)
                setTimeout(() => {
                    // step detail scene인 경우 첫 cut(태그+타이틀)은 줌인된 중앙, 나머지는 일반 카메라
                    // DOM 조회 대신 문자열 패턴 매칭 사용 (스트리밍 호환)
                    const isStepDetailTarget = this.isStepDetailSceneByName(cut.targetElement);
                    const isStepTag = cut.targetElement && cut.targetElement.includes('stepDetailTag');
                    const isStepTitle = cut.targetElement && cut.targetElement.includes('focusStepTitle');

                    // 첫 등장하는 키워드/step 상세씬만 빠른 카메라 적용
                    const isKeywordDetailFirstCut = isKeywordDetailScene && cut.targetElement &&
                        (cut.targetElement.includes('focusKeywordTitle') || cut.targetElement.includes('keywordDetailTag') || cut.targetElement.includes('keywordDetailScene'));
                    // 스텝 인트로 프레임의 Step 리스트 첫 등장 (stepListScene)
                    const isStepListFirstCut = this.isStepIntroFrame(cut.frameIndex) && cut.targetElement && cut.targetElement.includes('stepListScene');

                    // step 상세씬은 정말 맨 첫 컷만 빠른 카메라 - 스텝 프레임의 첫 번째 타이틀만
                    const isStepDetailFirstCut = isStepDetailScene && cut.targetElement &&
                        this.isStepFrame(cut.frameIndex) && cut.targetElement.match(/focusStepTitle\d+_1$/);

                    // step 상세씬에서는 오직 첫 컷만, 키워드 상세씬에서는 키워드 조건 적용, Frame3 첫 등장도 빠른 카메라
                    const needsFastCamera = isStepListFirstCut || (isStepDetailScene ? isStepDetailFirstCut : isKeywordDetailFirstCut);

                    // 모든 키워드/step 상세씬 컨텐츠 (빠른 카메라 + 일반 카메라 모두)
                    // DOM 조회 대신 헬퍼 함수 사용 (스트리밍 호환)
                    const isKeywordDetailContent = this.isKeywordDetailSceneByName(cut.targetElement);
                    const isStepDetailContent = this.isStepDetailSceneByName(cut.targetElement);

                    // 시각화 컨테이너도 Progressive visibility 필요
                    const isVisualizationContainer = cut.targetElement && cut.targetElement.includes('visualizationContainer');

                    const needsDelayedVisibility = isKeywordDetailContent || isStepDetailContent || isVisualizationContainer;

                    console.log(`Cut ${cutNum}: needsDelayedVisibility=${needsDelayedVisibility}, needsFastCamera=${needsFastCamera}, isStepDetailFirstCut=${isStepDetailFirstCut}, isStepDetailScene=${isStepDetailScene}, targetElement=${cut.targetElement}`);

                    // Frame3 Step 리스트 첫 등장 처리 (Frame1과 동일한 동적 스케일링)
                    if (isStepListFirstCut) {
                        console.log(`!!!!! Frame3 Step 리스트 첫 등장! Cut ${cutNum}, targetElement=${cut.targetElement}`);

                        // Frame1과 동일한 동적 스케일 계산
                        const pos = this.calculateCameraPosition(cut.targetElement);
                        frameElement.style.transform = `scale(${pos.scale}) translate(${pos.translateX}%, ${pos.translateY}%)`;
                        frameElement.style.transformOrigin = '50% 50%';
                        frameElement.style.transition = 'transform 0.3s ease-out'; // Frame1과 유사한 빠른 전환

                        // Progressive visibility도 빠르게 처리
                        if (cut.revealElements) {
                            setTimeout(() => {
                                this.updateProgressiveVisibility(cut.revealElements, cut.targetElement);
                            }, 100);
                        }
                    }
                    else if (cut.targetElement === 'focusStepTitle4_1') {
                        console.log(`!!!!! STEP 상세씬 첫 컷 진입! Cut ${cutNum}, targetElement=${cut.targetElement}, needsFastCamera=${needsFastCamera}, revealElements=`, cut.revealElements);

                        // step detail scene의 첫 번째 cut(태그+타이틀) - 빠른 카메라 적용
                        // 카메라 이동 전에 먼저 요소들을 숨김
                        if (cut.revealElements) {
                            console.log(`!!!!! 요소들 숨김 처리 시작:`, cut.revealElements);
                            cut.revealElements.forEach(elementId => {
                                const element = document.getElementById(elementId);
                                if (element) {
                                    element.style.visibility = 'hidden';
                                    element.style.opacity = '0';
                                    console.log(`!!!!! 요소 숨김: ${elementId}`);
                                } else {
                                    console.log(`!!!!! 요소 없음: ${elementId}`);
                                }
                            });
                        } else {
                            console.log(`!!!!! revealElements가 없음!`);
                        }

                        // step 상세씬 첫 컷도 올바른 카메라 위치 계산
                        const pos = this.calculateCameraPosition(cut.targetElement);
                        frameElement.style.transform = `scale(${pos.scale}) translate(${pos.translateX}%, ${pos.translateY}%)`;
                        frameElement.style.transformOrigin = '50% 50%';
                        frameElement.style.transition = 'transform 0.05s ease-in-out'; // 빠른 카메라 (극한)
                    } else {
                        // 빠른 카메라가 필요한 경우만 먼저 요소들을 숨김
                        if (needsFastCamera && cut.revealElements) {
                            cut.revealElements.forEach(elementId => {
                                const element = document.getElementById(elementId);
                                if (element) {
                                    element.style.visibility = 'hidden';
                                    element.style.opacity = '0';
                                }
                            });
                        }

                        // 일반 카메라 계산
                        const pos = this.calculateCameraPosition(cut.targetElement);
                        frameElement.style.transform =
                            `scale(${pos.scale}) translate(${pos.translateX}%, ${pos.translateY}%)`;
                        frameElement.style.transformOrigin = '50% 50%';

                        // 상세씬 개별 항목만 빠른 카메라, 나머지는 텐션값 90-60으로 1초 카메라
                        if (needsFastCamera) {
                            frameElement.style.transition = 'transform 0.05s ease-in-out';
                        } else {
                            // 일반 카메라는 모두 1초 50-40 텐션값 적용
                            frameElement.style.transition = 'transform 1s cubic-bezier(0.5, 0, 0.4, 1)';
                            console.log(`!!! 일반 카메라: 1s cubic-bezier(0.5, 0, 0.4, 1)`);
                        }
                    }

                    // 상세씬 컨텐츠는 progressive visibility 적용
                    if (needsDelayedVisibility) {
                        console.log(`!!!!!! Progressive visibility 조건 확인: needsFastCamera=${needsFastCamera}, isStepDetailTarget=${isStepDetailTarget}, isStepTag=${isStepTag}, isStepTitle=${isStepTitle}`);

                        // 모든 요소를 정상적으로 표시 (원복)
                        let elementsToReveal = cut.revealElements;

                        if (needsFastCamera) {
                            console.log(`!!!!!! 50ms 지연 후 progressive visibility 실행 예정, revealElements=`, elementsToReveal);
                            // 빠른 카메라와 step 상세씬 첫 컷은 이동 완료 후 요소 등장
                            setTimeout(() => {
                                console.log(`!!!!!! 50ms 지연 완료! progressive visibility 실행:`, elementsToReveal);
                                this.updateProgressiveVisibility(elementsToReveal, cut.targetElement);
                                // Progressive visibility 후 화살표 dimmed 업데이트
                                this.updateArrowVisibility(cutNum);
                            }, 50);
                        } else {
                            console.log(`!!!!!! 바로 progressive visibility 실행:`, elementsToReveal);
                            // 일반 카메라도 약간의 지연으로 카메라 이동과 분리
                            setTimeout(() => {
                                this.updateProgressiveVisibility(elementsToReveal, cut.targetElement);
                                // Progressive visibility 후 화살표 dimmed 업데이트
                                this.updateArrowVisibility(cutNum);
                            }, 50);
                        }
                    } else {
                        console.log(`!!!!!! needsDelayedVisibility=false 이므로 progressive visibility 실행 안 함`);
                    }
                }, 50);

                // 텍스트 애니메이션 트리거
                this.applyTextAnimations(cutNum);

                // 포커스 오버레이 업데이트 (약간 지연)
                setTimeout(() => {
                    this.updateFocusOverlay(cut.targetElement);
                }, 50);
            } else {
                // 일반 전체 보기 - 문제 영역 위치는 유지

                frameElement.style.transform = 'scale(1) translate(0, 0)';
                frameElement.style.transformOrigin = '50% 50%';
                frameElement.style.transition = 'transform 1s cubic-bezier(0.5, 0, 0.4, 1)';

                overlay.classList.remove('active');
                this.updateFocusOverlay(null);
            }

            // UI 업데이트
            this.updateUI();

            // 깜빡이는 강조 효과 처리 (Frame 5 키워드 복습)
            if (cut.blinkHighlightElement) {
                this.applyBlinkHighlight(cut.blinkHighlightElement);
            }

        } catch (error) {
            console.error(`Cut ${cut.cutIndex} 처리 중 오류 발생:`, error);
            console.error('오류 스택:', error.stack);
        }

        // MathJax 재렌더링 (Cut 변경 후) - 오류와 관계없이 실행
        setTimeout(() => {
            this.renderMathJax();
        }, 200);
    }


    // ===== 깜빡이는 강조 효과 적용 =====
    applyBlinkHighlight(elementId) {
        // 기존의 모든 깜빡이는 효과 제거
        document.querySelectorAll('.blink-highlight').forEach(el => {
            el.classList.remove('blink-highlight');
        });

        // 새로운 요소에 깜빡이는 효과 적용
        const targetElement = document.getElementById(elementId);
        if (targetElement) {
            targetElement.classList.add('blink-highlight');
            console.log(`깜빡이는 강조 효과 적용: ${elementId}`);
        }
    }

    // ===== Math 요소 마스크 애니메이션 적용 =====
    applyMathMaskAnimation(targetElementId) {
        if (!targetElementId) return;

        // 해당 ID의 요소 찾기
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) return;

        // 해당 요소 내의 모든 .math 요소 찾기
        let mathElements = targetElement.querySelectorAll('.math');

        // 요소 자체도 .math 클래스인 경우 포함
        if (targetElement.classList.contains('math')) {
            mathElements = [targetElement, ...mathElements];
        }

        mathElements.forEach(mathEl => {
            if (!mathEl.hasAttribute('data-animated')) {
                mathEl.style.visibility = 'visible';

                // reveal-animate 클래스를 추가하기 전에 인라인 스타일 제거
                mathEl.style.removeProperty('transition');
                mathEl.style.removeProperty('transform');
                mathEl.style.removeProperty('opacity');

                mathEl.classList.remove('reveal-animate');
                requestAnimationFrame(() => {
                    mathEl.classList.add('reveal-animate');
                });
                mathEl.setAttribute('data-animated', 'true');

                // step-content-item 내 .math는 서로 다른 시간에 시작되도록 스태거 효과 추가
                if (mathEl.closest('.step-content-item')) {
                    const siblings = Array.from(mathEl.closest('.step-content-item').querySelectorAll('.math.reveal-animate'));
                    const index = siblings.indexOf(mathEl);
                    mathEl.style.animationDelay = `${index * 0.1}s`;
                }

                console.log(`마스크 애니메이션 적용: ${mathEl.textContent?.substring(0, 20)}`);
            }
        });
    }

    // ===== 텍스트 애니메이션 적용 =====
    applyTextAnimations(cutNum) {
        const cut = this.allCuts.find(c => c.cutIndex === cutNum);
        if (!cut || !cut.targetElement) return;

        const element = document.getElementById(cut.targetElement);
        if (element && element.classList.contains('text-animate-in')) {
            element.classList.add('show');
        }

        // Math 요소 마스크 애니메이션 적용
        this.applyMathMaskAnimation(cut.targetElement);

        if (element) {
            const childElements = element.querySelectorAll('.text-animate-in');
            childElements.forEach(child => {
                child.classList.add('show');
            });
        }

        // 타이틀에 mask swipe 효과가 있는 경우 0.2초 지연 후 효과 적용
        if (element && (element.classList.contains('keyword-title') || element.classList.contains('step-title'))) {
            setTimeout(() => {
                element.classList.add('reveal-animate');

                // overview mode일 때 content 요소들에 glow-flicker 효과 추가
                const currentCutData = this.allCuts[this.currentCut];
                if (currentCutData && currentCutData.isOverviewMode) {
                    const currentFrame = this.frames[this.currentFrameIndex];
                    if (currentFrame) {
                        // extraction content (extraction-left, extraction-right, extraction-bottom)
                        const contentElements = currentFrame.element.querySelectorAll(
                            '.extraction-left, .extraction-right, .extraction-bottom, .step-content-item'
                        );
                        contentElements.forEach(el => {
                            el.classList.add('glow-flicker');
                        });
                    }
                }
            }, 200);
        }

        // 스텝 인트로 프레임에서 step 태그가 등장할 때 배경 동그라미도 함께 fade-in
        if (this.isStepIntroFrame() && cut.targetElement && cut.targetElement.includes('stepSceneTag')) {
            console.log(`Step 태그 등장! 배경 동그라미 fade-in 시작 (태그: ${cut.targetElement})`);
            this.triggerStepBackgroundFadeIn();
        }

    }

    // ===== Step 태그와 동시에 배경 동그라미 fade-in =====
    triggerStepBackgroundFadeIn() {
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) return;

        const bgCircles = currentFrame.element.querySelectorAll('.bg-circle');

        bgCircles.forEach((circle, index) => {
            console.log(`동그라미 ${index}: step 태그와 동시에 fade-in 시작`);

            // 먼저 opacity를 0으로 설정
            circle.style.opacity = '0';

            // 즉시 CSS 애니메이션 클래스 추가
            circle.classList.add('bg-circle-fade-in-animation');
            console.log(`동그라미 ${index}: CSS 애니메이션 즉시 시작`);
        });
    }

    // ===== 네비게이션 =====
    nextCut() {
        // Overview 시퀀스가 진행 중이면 시퀀스 내에서 처리
        if (this.overviewSequence.isActive) {
            const shouldContinue = this.overviewSequence.next();
            if (shouldContinue) {
                // 아직 시퀀스가 끝나지 않음 (다음 하이라이트로 이동함)
                return;
            }
            // 시퀀스가 끝났으면 다음 cut으로 진행
        }

        const nextCutIndex = this.currentCut + 1;
        const nextCut = this.allCuts.find(c => c.cutIndex === nextCutIndex);

        console.log(`nextCut() 호출: 현재=${this.currentCut}, 다음=${nextCutIndex}, 찾은 Cut:`, nextCut);

        if (nextCut) {
            this.moveToCut(nextCutIndex);
        } else {
            console.log('다음 Cut이 없습니다. 전체 Cuts:', this.allCuts.map(c => c.cutIndex));
        }
    }

    previousCut() {
        // Overview 시퀀스가 진행 중이면 취소하고 이전 cut으로
        if (this.overviewSequence.isActive) {
            this.overviewSequence.cancel();
        }

        const prevCutIndex = this.currentCut - 1;
        const prevCut = this.allCuts.find(c => c.cutIndex === prevCutIndex);

        console.log(`previousCut() 호출: 현재=${this.currentCut}, 이전=${prevCutIndex}, 찾은 Cut:`, prevCut);

        if (prevCut) {
            this.moveToCut(prevCutIndex);
        } else {
            console.log('이전 Cut이 없습니다. 전체 Cuts:', this.allCuts.map(c => c.cutIndex));
        }
    }

    nextFrame() {
        if (this.currentFrameIndex < this.frames.length - 1) {
            this.transitionToFrame(this.currentFrameIndex, this.currentFrameIndex + 1);
        }
    }

    previousFrame() {
        if (this.currentFrameIndex > 0) {
            this.transitionToFrame(this.currentFrameIndex, this.currentFrameIndex - 1);
        }
    }

    // ===== UI 업데이트 =====
    updateUI() {
        const cutInfo = document.getElementById('cutInfo');
        const progressFill = document.getElementById('progressFill');

        if (!cutInfo || !progressFill) return;

        const currentCut = this.allCuts.find(c => c.cutIndex === this.currentCut);
        const currentFrame = this.frames[this.currentFrameIndex];

        if (currentCut && currentFrame) {
            cutInfo.textContent = `cut ${this.currentCut}: ${currentCut.name}`;
            progressFill.style.width = `${(this.currentCut / this.allCuts.length) * 100}%`;

        }
    }

    // ===== 이벤트 리스너 설정 =====
    setupEventListeners() {
        // 키보드 이벤트 리스너
        document.addEventListener('keydown', (event) => {
            // 디버깅 로그
            console.log('키 입력 감지:', event.key, 'allCuts 개수:', this.allCuts.length, '현재 Cut:', this.currentCut);

            // 포커스가 input, textarea 등에 있으면 키보드 네비게이션 비활성화
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // 기본 스크롤 동작 방지 (화살표 키)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
                event.preventDefault();
            }

            switch (event.key) {
                case 'ArrowRight':  // 다음 Cut
                case ' ':          // 스페이스바
                    console.log('다음 Cut 시도');
                    this.nextCut();
                    break;

                case 'ArrowLeft':   // 이전 Cut
                    console.log('이전 Cut 시도');
                    this.previousCut();
                    break;

                case 'ArrowUp':     // 이전 Frame
                    console.log('이전 Frame 시도');
                    this.previousFrame();
                    break;

                case 'ArrowDown':   // 다음 Frame
                    console.log('다음 Frame 시도');
                    this.nextFrame();
                    break;

                case 'Home':        // 첫 번째 Cut
                    console.log('첫 번째 Cut으로 이동');
                    this.moveToCut(0);
                    break;

                case 'End':         // 마지막 Cut
                    console.log('마지막 Cut으로 이동');
                    this.moveToCut(this.allCuts.length);
                    break;
            }
        });

        // 화면 크기 변경 감지
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.moveToCut(this.currentCut);
                // review-keyword-item 크기 재조정
                this.adjustAllReviewKeywordItems();
            }, 100);
        });
    }

    // ===== 외부 API =====
    getCutsData() {
        return this.allCuts.map(cut => ({
            cut_index: cut.cutIndex,
            name: cut.name,
            target_element: cut.targetElement,
            frame_index: cut.frameIndex,
            frame_name: this.frames[cut.frameIndex]?.frameName
        }));
    }

    getTemplateData() {
        return {
            frames: this.frames.map(frame => ({
                frame_index: frame.frameIndex,
                frame_name: frame.frameName,
                transition: frame.transition,
                cuts: frame.cuts
            })),
            allCuts: this.getCutsData(),
            config: this.config,
            totalFrames: this.config.totalFrames,
            totalCuts: this.allCuts.length
        };
    }

    // ===== Flutter에서 호출할 수 있는 다음 cut으로 이동하는 함수 =====
    moveToNext() {
        this.nextCut();
    }

    // Flutter에서 호출할 수 있는 다음 cut으로 이동하는 함수
    moveToNextFromFlutter() {
        console.log('Flutter에서 moveToNext 호출됨');
        this.moveToNext();

        // Flutter에 현재 상태 전달
        const currentFrame = this.frames[this.currentFrameIndex];
        if (currentFrame) {
            this.notifyFlutter({
                type: 'cutChanged',
                currentFrame: this.currentFrameIndex + 1,
                currentCut: this.currentCut,
                cutName: this.allCuts.find(c => c.cutIndex === this.currentCut)?.name || '',
                totalCuts: this.allCuts.length
            });
        }
    }

    // Flutter에 알림 전송
    notifyFlutter(data) {
        console.log('Flutter 알림:', data);
        if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
            window.flutter_inappwebview.callHandler('lectureStatusChanged', data);
        }
    }

    // Flutter에서 호출할 수 있는 이전 cut으로 이동하는 함수
    moveToPreviousFromFlutter() {
        console.log('Flutter에서 moveToPrevious 호출됨');
        this.previousCut();

        // Flutter에 현재 상태 전달
        const currentFrame = this.frames[this.currentFrameIndex];
        if (currentFrame) {
            this.notifyFlutter({
                type: 'cutChanged',
                currentFrame: this.currentFrameIndex + 1,
                currentCut: this.currentCut,
                cutName: this.allCuts.find(c => c.cutIndex === this.currentCut)?.name || '',
                totalCuts: this.allCuts.length
            });
        }
    }

    // Flutter에서 호출할 수 있는 특정 cut으로 이동하는 함수
    moveToCutFromFlutter(cutNumber) {
        console.log(`Flutter에서 Cut ${cutNumber}로 이동 요청됨`);
        const targetCut = this.allCuts.find(c => c.cutIndex === cutNumber);

        if (targetCut) {
            this.moveToCut(cutNumber);

            // Flutter에 현재 상태 전달
            const currentFrame = this.frames[this.currentFrameIndex];
            if (currentFrame) {
                this.notifyFlutter({
                    type: 'cutChanged',
                    currentFrame: this.currentFrameIndex + 1,
                    currentCut: this.currentCut,
                    cutName: this.allCuts.find(c => c.cutIndex === this.currentCut)?.name || '',
                    totalCuts: this.allCuts.length
                });
            }
        } else {
            console.warn(`Cut ${cutNumber}을 찾을 수 없습니다.`);
        }
    }
}

// ===== 전역 인스턴스 생성 =====
let solveTemplate;

// DOM 로드 완료 후 템플릿 초기화
function initializeSolveTemplate() {
    console.log('DOM 로드 완료. SolveTemplate 초기화 시작...');

    // 기본 컨테이너들 상태 확인
    const viewport = document.querySelector('.viewport');
    const frameContainer = document.querySelector('.frame-container');
    console.log('기본 컨테이너 상태:', {
        viewport: viewport ? {
            display: getComputedStyle(viewport).display,
            width: getComputedStyle(viewport).width,
            height: getComputedStyle(viewport).height,
            overflow: getComputedStyle(viewport).overflow
        } : null,
        frameContainer: frameContainer ? {
            display: getComputedStyle(frameContainer).display,
            width: getComputedStyle(frameContainer).width,
            height: getComputedStyle(frameContainer).height,
            overflow: getComputedStyle(frameContainer).overflow
        } : null
    });


    solveTemplate = new SolveTemplate();

    // 전역 접근 가능하도록 window 객체에 추가
    window.solveTemplate = solveTemplate;

    // Flutter에서 호출할 수 있는 글로벌 함수들 추가
    window.moveToNextFromFlutter = function () {
        console.log('Flutter에서 moveToNextFromFlutter 호출됨');
        if (solveTemplate) {
            solveTemplate.moveToNextFromFlutter();
        } else {
            console.log('solveTemplate 인스턴스가 없습니다');
        }
    };

    window.moveToNext = function () {
        console.log('Flutter에서 moveToNext 호출됨');
        if (solveTemplate) {
            solveTemplate.moveToNext();
        } else {
            console.log('solveTemplate 인스턴스가 없습니다');
        }
    };

    // 글로벌 스코프에도 추가 (fallback)
    globalThis.moveToNext = window.moveToNext;
    globalThis.moveToNextFromFlutter = window.moveToNextFromFlutter;

    // 초기 프레임 활성화
    setTimeout(() => {
        console.log('초기화 지연 완료. 프레임 활성화 및 UI 업데이트 시작...');
        solveTemplate.activateFrame(0); // 첫 번째 프레임부터 시작
        solveTemplate.updateUI(); // 초기 UI 상태 설정

        // 첫 번째 Cut으로 이동
        if (solveTemplate.allCuts.length > 0) {
            solveTemplate.moveToCut(0);
        }

        console.log(`Solve Template 초기화 완료:`);
        console.log(`- 프레임: ${solveTemplate.config.totalFrames}개`);
        console.log(`- Cut: ${solveTemplate.allCuts.length}개`);
        console.log(`- 현재 Cut: ${solveTemplate.currentCut}`);
        console.log('키보드 컨트롤 사용 가능: ←→↑↓, Space, Home, End');
    }, 300); // 시간을 조금 늘림
}

// DOM이 이미 로드되었으면 즉시 실행, 아니면 이벤트 리스너 등록
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSolveTemplate);
} else {
    // DOM이 이미 로드됨 (ES6 모듈은 defer처럼 동작)
    initializeSolveTemplate();
}

export default SolveTemplate;