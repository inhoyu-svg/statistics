// ===== 강의 템플릿 동적 생성 시스템 =====

// Import shared utility functions
import { getHighlightColor, findNearbyColor, isWhiteColor, getGreenColorFromCSS } from './shared/utils/color-utils.js';
import { playSoundEffect, playSoundForElementById } from './shared/media/sound-manager.js';
import { renderVisualization, renderImage, renderVideo, renderChart, renderMathJax, renderVisualizations } from './shared/media/visualization-renderer.js';
import { notifyFlutter, moveToNextFromFlutter, moveToPreviousFromFlutter, moveToCutFromFlutter, onFlutterReady, setupFlutterGlobalFunctions } from './shared/communication/flutter-bridge.js';

// Import lecture-specific utilities
import { extractReviewContext, isSameReviewTransition, extractReviewNumber, isFirstReview } from './shared/utils/review-utils.js';
import { addFocusTestBorder, removeFocusTestBorder, addFocusTestOverlay, removeFocusTestOverlay, updateFocusHole } from './shared/utils/focus-utils.js';

// Import shared effects modules
import { createSVGEffect, createBorderSVG, createTextEffect, createFixedPositionEffect } from './shared/effects/svg-effects.js';
import { applyKeywordItemCombinedEffect, triggerGlowEffects, triggerGlowEffectsForNewElements } from './shared/effects/glow-effects.js';
import { triggerMainTitleEffectsOnElement, triggerMainTitleEffects } from './shared/effects/title-effects.js';
import { triggerTodayDefinitionKeywordEffectsOnElement, triggerTodayDefinitionKeywordEffects, triggerContentTextEffectsOnElement, triggerContentTextEffects, triggerSummarySceneTitleEffectsOnElement, triggerSummarySceneTitleEffects } from './shared/effects/text-effects.js';

// Import navigation modules
import { moveToCut as moveToCutImpl, nextCut as nextCutImpl, previousCut as previousCutImpl, moveToNext as moveToNextImpl, moveToPrevious as moveToPreviousImpl, updateUI as updateUIImpl, startAutoAdvanceTimer as startAutoAdvanceTimerImpl, clearAutoAdvanceTimer as clearAutoAdvanceTimerImpl } from './navigation/cut-navigator.js';

// Import Phase 4 modules
import { generateCutsFromJSON as generateCutsFromJSONImpl, validateJSONData as validateJSONDataImpl, extractTemplateData as extractTemplateDataImpl, generateFramesAndCuts as generateFramesAndCutsImpl, getSceneSections as getSceneSectionsImpl, getFramesData as getFramesDataImpl, getTemplateData as getTemplateDataImpl } from './core/data-manager.js';
import { initializeFrames as initializeFramesImpl, activateFrame as activateFrameImpl, transitionToFrame as transitionToFrameImpl, moveToNextFrame as moveToNextFrameImpl, moveToPreviousFrame as moveToPreviousFrameImpl, getOppositeTransition as getOppositeTransitionImpl, updateBackgroundDecoration as updateBackgroundDecorationImpl } from './frame/frame-manager.js';
import { updateSceneVisibility as updateSceneVisibilityImpl, updateSceneBorderReveal as updateSceneBorderRevealImpl, hideAllProgressiveElements as hideAllProgressiveElementsImpl, getControlledElements as getControlledElementsImpl } from './frame/scene-manager.js';
import { calculateContentAreaSize as calculateContentAreaSizeImpl, calculateScale as calculateScaleImpl, calculateRevealElementsHeight as calculateRevealElementsHeightImpl, calculatePosition as calculatePositionImpl, calculateCameraPosition as calculateCameraPositionImpl, calculateCameraPositionForReviewTitle as calculateCameraPositionForReviewTitleImpl, calculateCameraPositionForReviewItem as calculateCameraPositionForReviewItemImpl, applyCameraFocus as applyCameraFocusImpl, moveContentAreaToReview as moveContentAreaToReviewImpl } from './camera/camera-system.js';
import { extractSummaryContents as extractSummaryContentsImpl, showSummary as showSummaryImpl, hideSummary as hideSummaryImpl, handleSummaryCut as handleSummaryCutImpl, updateRevealElementsInSummary as updateRevealElementsInSummaryImpl, updateReviewDimming as updateReviewDimmingImpl, autoScaleSummaryContent as autoScaleSummaryContentImpl } from './summary/summary-manager.js';
import { updateRevealElements as updateRevealElementsImpl, applyTextAnimations as applyTextAnimationsImpl } from './navigation/reveal-manager.js';
import { setupSceneNumberStyling as setupSceneNumberStylingImpl, setupTitleBreaking as setupTitleBreakingImpl, setupSceneTagStyling as setupSceneTagStylingImpl, setupChapterBadgeStyling as setupChapterBadgeStylingImpl, setupLastFrameClass as setupLastFrameClassImpl, wrapArrowSymbols as wrapArrowSymbolsImpl, validateSceneLayouts as validateSceneLayoutsImpl } from './ui/ui-styler.js';

class LectureTemplate {
    constructor() {
        this.currentFrameIndex = 0;
        this.currentCut = 0;
        this.frames = [];
        this.allCuts = [];
        this.summaryContents = [];
        this.currentSummaryIndex = -1;
        this.isSummaryMode = false;
        this._isTransitioning = false; // Frame transition guard flag
        this._isCameraAnimating = false; // Camera animation guard flag
        this._isManualMode = false; // Auto-advance vs manual mode flag
        this._autoAdvanceTimer = null; // Auto-advance timer
        this.config = {
            totalFrames: 0,
            cutAnimations: {},
            cameraPositions: {}
        };
        this.scenesBorderRevealed = new Map();
        this.sceneTagFirstAppearance = new Map();
        this.glowEffectsApplied = new Set();
        this.currentReviewNumber = null;
        this.lastReviewTranslateY = undefined;
        this.initializeSystem();
    }

    // ===== Phase 4 Module Wrappers: Data Management =====
    generateCutsFromJSON(cutsData) {
        return generateCutsFromJSONImpl(this, cutsData);
    }

    validateJSONData(cutsData) {
        return validateJSONDataImpl(cutsData);
    }

    extractTemplateData() {
        return extractTemplateDataImpl(this);
    }

    generateFramesAndCuts() {
        return generateFramesAndCutsImpl(this);
    }

    getSceneSections(frameNum, sceneNum) {
        return getSceneSectionsImpl(this, frameNum, sceneNum);
    }

    getFramesData() {
        return getFramesDataImpl(this);
    }

    getTemplateData() {
        return getTemplateDataImpl(this);
    }

    // ===== Phase 4 Module Wrappers: Frame Management =====
    initializeFrames() {
        return initializeFramesImpl(this);
    }

    activateFrame(frameIndex) {
        return activateFrameImpl(this, frameIndex);
    }

    transitionToFrame(fromIndex, toIndex, transitionType = 'smooth', targetCutNum = null) {
        return transitionToFrameImpl(this, fromIndex, toIndex, transitionType, targetCutNum);
    }

    moveToNextFrame() {
        return moveToNextFrameImpl(this);
    }

    moveToPreviousFrame() {
        return moveToPreviousFrameImpl(this);
    }

    getOppositeTransition(transition) {
        return getOppositeTransitionImpl(transition);
    }

    updateBackgroundDecoration(fromIndex, toIndex) {
        return updateBackgroundDecorationImpl(fromIndex, toIndex);
    }

    // ===== Phase 4 Module Wrappers: Scene Management =====
    updateSceneVisibility(cutNum) {
        return updateSceneVisibilityImpl(this, cutNum);
    }

    updateSceneBorderReveal(scene, revealElements, isTargetNull = false, cutType = null) {
        return updateSceneBorderRevealImpl(this, scene, revealElements, isTargetNull, cutType);
    }

    hideAllProgressiveElements() {
        return hideAllProgressiveElementsImpl(this.frames);
    }

    getControlledElements(containerElement) {
        return getControlledElementsImpl(containerElement);
    }

    // ===== Phase 4 Module Wrappers: Camera System =====
    calculateContentAreaSize(containerElement) {
        return calculateContentAreaSizeImpl(containerElement);
    }

    calculateScale(targetElementId, containerElement = null) {
        return calculateScaleImpl(this, targetElementId, containerElement);
    }

    calculateRevealElementsHeight(revealElements, contentArea) {
        return calculateRevealElementsHeightImpl(revealElements, contentArea);
    }

    calculatePosition(targetElement) {
        return calculatePositionImpl(targetElement);
    }

    calculateCameraPosition(targetElementId) {
        return calculateCameraPositionImpl(this, targetElementId);
    }

    calculateCameraPositionForReviewTitle(reviewElementId, cameraPosition = 'top-center') {
        return calculateCameraPositionForReviewTitleImpl(this, reviewElementId, cameraPosition);
    }

    calculateCameraPositionForReviewItem(targetElementId) {
        return calculateCameraPositionForReviewItemImpl(this, targetElementId);
    }

    applyCameraFocus(container, cut, skipTransition = false) {
        return applyCameraFocusImpl(container, cut, skipTransition);
    }

    moveContentAreaToReview(reviewNumber, contentArea) {
        return moveContentAreaToReviewImpl(reviewNumber, contentArea);
    }

    // ===== Phase 4 Module Wrappers: Summary Management =====
    extractSummaryContents() {
        return extractSummaryContentsImpl(this);
    }

    showSummary(summaryIndex) {
        return showSummaryImpl(this, summaryIndex);
    }

    hideSummary() {
        return hideSummaryImpl(this);
    }

    handleSummaryCut(cut, cutNum) {
        return handleSummaryCutImpl(this, cut, cutNum);
    }

    updateRevealElementsInSummary(revealElements, summaryIndex, cutType = null) {
        return updateRevealElementsInSummaryImpl(this, revealElements, summaryIndex, cutType);
    }

    updateReviewDimming(revealElements, targetElement) {
        return updateReviewDimmingImpl(revealElements, targetElement);
    }

    autoScaleSummaryContent(summaryContent, cutType = null) {
        return autoScaleSummaryContentImpl(summaryContent, cutType);
    }

    // ===== Phase 4 Module Wrappers: Reveal Management =====
    updateRevealElements(revealElements, targetElement = null, currentCut = null) {
        return updateRevealElementsImpl(this, revealElements, targetElement, currentCut);
    }

    applyTextAnimations(cutNum) {
        return applyTextAnimationsImpl(this, cutNum);
    }

    // ===== Phase 4 Module Wrappers: UI Styling =====
    setupSceneNumberStyling() {
        return setupSceneNumberStylingImpl(this.frames);
    }

    setupTitleBreaking() {
        return setupTitleBreakingImpl();
    }

    setupSceneTagStyling() {
        return setupSceneTagStylingImpl();
    }

    setupChapterBadgeStyling() {
        return setupChapterBadgeStylingImpl();
    }

    setupLastFrameClass() {
        return setupLastFrameClassImpl();
    }

    wrapArrowSymbols() {
        return wrapArrowSymbolsImpl();
    }

    validateSceneLayouts() {
        return validateSceneLayoutsImpl(this.frames);
    }

    // ===== Effects Module Wrappers =====
    createSVGEffect(element, effectType, yOffset = 0, customOffset = null, fadeOutExtraDelay = 0, precomputedRect = null, customColor = null, customDuration = null) {
        return createSVGEffect(element, effectType, yOffset, customOffset, fadeOutExtraDelay, precomputedRect, customColor, customDuration);
    }

    createBorderSVG(container, borderRadius) {
        return createBorderSVG(container, borderRadius);
    }

    createTextEffect(element, iconType, customText = null) {
        return createTextEffect(element, iconType, customText);
    }

    createFixedPositionEffect(rect, effectType, word) {
        return createFixedPositionEffect(rect, effectType, word);
    }

    applyKeywordItemCombinedEffect(element, effectType) {
        return applyKeywordItemCombinedEffect(element, effectType);
    }

    triggerGlowEffects(targetElementId) {
        return triggerGlowEffects(targetElementId);
    }

    triggerGlowEffectsForNewElements(revealElements) {
        return triggerGlowEffectsForNewElements(this, revealElements);
    }

    triggerMainTitleEffectsOnElement(element) {
        return triggerMainTitleEffectsOnElement(element);
    }

    triggerMainTitleEffects(targetElementId) {
        return triggerMainTitleEffects(targetElementId);
    }

    triggerTodayDefinitionKeywordEffectsOnElement(element) {
        return triggerTodayDefinitionKeywordEffectsOnElement(element);
    }

    triggerTodayDefinitionKeywordEffects(targetElementId) {
        return triggerTodayDefinitionKeywordEffects(targetElementId);
    }

    triggerContentTextEffectsOnElement(element) {
        return triggerContentTextEffectsOnElement(element);
    }

    triggerContentTextEffects(targetElementId) {
        return triggerContentTextEffects(targetElementId);
    }

    triggerSummarySceneTitleEffectsOnElement(element) {
        return triggerSummarySceneTitleEffectsOnElement(element);
    }

    triggerSummarySceneTitleEffects(targetElementId) {
        return triggerSummarySceneTitleEffects(targetElementId);
    }

    // ===== Navigation Module Wrappers =====
    moveToCut(cutNum, skipTransition = false) {
        return moveToCutImpl(this, cutNum, skipTransition);
    }

    nextCut() {
        return nextCutImpl(this);
    }

    previousCut() {
        return previousCutImpl(this);
    }

    moveToNext() {
        return moveToNextImpl(this);
    }

    moveToPrevious() {
        return moveToPreviousImpl(this);
    }

    updateUI() {
        return updateUIImpl(this);
    }

    // ===== Additional Methods (Not Extracted) =====

    // Additional helper methods that don't belong to modules
    extractFrameSections(frame, frameIndex) {
        const sections = [];
        const allSections = frame.querySelectorAll('.math-section');
        allSections.forEach(section => {
            sections.push({
                element: section,
                frameIndex: frameIndex
            });
        });
        return sections;
    }

    generateSectionName(element, frameNum, sceneNum) {
        let name = `Frame ${frameNum + 1}`;
        if (element.classList.contains('math-scene')) {
            name += ` Scene ${sceneNum}`;
        }
        return name;
    }

    generateSectionDescription(element) {
        const firstText = element.querySelector('.math-text, .scene-title');
        if (firstText) {
            const text = firstText.textContent.trim();
            return text.substring(0, 50) + (text.length > 50 ? '...' : '');
        }
        return '';
    }

    generateCameraStyles() {
        console.log('카메라 스타일 생성 완료');
    }

    setupReviewTitleTexture() {
        // No implementation needed - handled by CSS
    }

    // ===== Initialization System =====
    initializeSystem() {
        this.extractTemplateData();

        if (window.cutsData && Array.isArray(window.cutsData)) {
            console.log('JSON 데이터 발견. JSON 기반 초기화 시작.');
            const validation = this.validateJSONData(window.cutsData);
            if (validation.valid) {
                const success = this.generateCutsFromJSON(window.cutsData);
                if (success) {
                    console.log('JSON 기반 Cut 생성 성공');
                } else {
                    console.warn('JSON 기반 Cut 생성 실패. HTML 기반으로 전환.');
                    this.generateFramesAndCuts();
                }
            } else {
                console.error('JSON 데이터 검증 실패:', validation.error);
                this.generateFramesAndCuts();
            }
        } else {
            console.log('JSON 데이터 없음. HTML 기반 Cut 생성.');
            this.generateFramesAndCuts();
        }

        this.hideAllProgressiveElements();
        this.extractSummaryContents();
        this.generateCameraStyles();
        this.setupSceneNumberStyling();
        this.setupTitleBreaking();
        this.setupSceneTagStyling();
        this.setupChapterBadgeStyling();
        this.setupLastFrameClass();
        this.validateSceneLayouts();
        this.wrapArrowSymbols();
        this.setupReviewTitleTexture();
        this.setupEventListeners();
        this.initializeFrames();
    }

    // ===== Event Handlers =====
    handleResize() {
        if (this.frames.length > 0 && this.currentCut > 0) {
            this.moveToCut(this.currentCut);
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                this.moveToNext();
            } else if (e.key === 'ArrowLeft') {
                this.moveToPrevious();
            }
        });

        window.addEventListener('resize', () => this.handleResize());

        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.streamingSystemInstance) {
                    console.log('스트리밍 모드 감지: load 이벤트 초기화 스킵');
                    return;
                }

                console.log('페이지 로드 완료, 비-스트리밍 모드 초기화 시작');
                if (this.frames.length > 0 && this.currentFrameIndex >= 0) {
                    console.log(`초기 cut 로딩 시도: frame ${this.currentFrameIndex}, cut 0`);
                    this.moveToCut(0, true);
                    console.log(`동적 강의 템플릿 초기화 완료. 총 ${this.frames.length}개 프레임, ${this.allCuts.length}개 cut 생성됨.`);
                } else {
                    console.error(`초기화 실패: frames 또는 currentFrameIndex 문제 (frames: ${this.frames.length}, currentFrameIndex: ${this.currentFrameIndex})`);
                }
            }, 200);
        });
    }
}

// ===== 전역 인스턴스 생성 =====
let lectureTemplate;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, LectureTemplate 생성 시작');
    lectureTemplate = new LectureTemplate();

    window.lectureTemplate = lectureTemplate;
    console.log('LectureTemplate 전역 등록 완료');

    setupFlutterGlobalFunctions(lectureTemplate);

    setTimeout(() => {
        console.log('초기화 지연 완료. 프레임 활성화 및 UI 업데이트 시작...');

        if (lectureTemplate.allCuts.length > 0) {
            lectureTemplate.moveToCut(0, true);
            console.log(`Lecture Template 초기화 완료:`);
            console.log(`- 프레임: ${lectureTemplate.config.totalFrames}개`);
            console.log(`- Cut: ${lectureTemplate.allCuts.length}개`);
            console.log(`- 현재 Cut: ${lectureTemplate.currentCut}`);
            console.log('키보드 컨트롤 사용 가능: 좌우 화살표');
        }

        if (lectureTemplate) {
            notifyFlutter({
                type: 'webViewLoaded',
                message: 'WebView가 로드되었습니다.'
            });
        }
    }, 100);
});

export default LectureTemplate;
