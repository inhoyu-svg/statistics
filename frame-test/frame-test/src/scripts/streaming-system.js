/**
 * Streaming System for Frame-based Content Delivery
 * 프레임 단위 스트리밍 콘텐츠 배달 시스템
 * solve-template.js와 호환되는 구조
 */

class StreamingSystem {
    constructor() {
        this.frameContainer = document.getElementById('frameContainer');
        this.progressIndicator = document.getElementById('progressIndicator');
        this.cutInfo = document.getElementById('cutInfo');

        // 스트리밍 상태
        this.currentFrameIndex = -1;
        this.totalFrames = 0;
        this.isStreaming = false;
        this.frameBuffer = new Map(); // 프레임 버퍼
        this.cutsBuffer = new Map();  // cuts 데이터 버퍼

        // SolveTemplate 인스턴스와 연동할 준비
        this.solveTemplate = null;
        this.isTemplateReady = false;
        this.cutsInitialized = false; // 첫 번째 cuts 초기화 완료 여부

        console.log('🎬 StreamingSystem 초기화 완료');
        this.setupFlutterInterface();
        this.initializeCutsData();
    }

    /**
     * cutsData 전역 변수 초기화
     */
    initializeCutsData() {
        if (!window.cutsData) {
            window.cutsData = [];
            console.log('📊 window.cutsData 초기화');
        }
    }

    /**
     * Flutter와의 통신 인터페이스 설정
     */
    setupFlutterInterface() {
        // Flutter에서 호출할 수 있는 전역 함수들 등록
        window.streamingSystem = this;

        // 프레임 수신 함수
        window.receiveFrame = (frameData) => {
            console.log('📦 프레임 수신:', frameData.frame_index); // HTML 전체 로그 제거 (frameData 객체 출력 안 함)
            this.processFrame(frameData);
        };

        // 스트리밍 시작 함수
        window.startStreaming = (totalFrames) => {
            console.log('🚀 스트리밍 시작, 총 프레임:', totalFrames);
            this.startStreaming(totalFrames);
        };

        // 스트리밍 완료 함수
        window.completeStreaming = () => {
            console.log('✅스트리밍 완료');
            this.completeStreaming();
        };

        console.log('🔗 Flutter 인터페이스 설정 완료');
    }

    /**
     * 스트리밍 시작
     */
    startStreaming(totalFrames) {
        this.totalFrames = totalFrames;
        this.isStreaming = true;
        this.currentFrameIndex = -1;

        // 기존 컨텐츠 정리
        this.frameContainer.innerHTML = '';

        console.log('📺 스트리밍 모드 활성화');
    }

    /**
     * 프레임 데이터 처리 (solve-template.js 호환)
     */
    processFrame(frameData) {
        if (!this.isStreaming) {
            console.warn('⚠️ 스트리밍이 활성화되지 않음');
            return;
        }

        const frameIndex = frameData.frame_index;

        // 프레임 버퍼에 저장
        this.frameBuffer.set(frameIndex, frameData.ui_html);
        this.cutsBuffer.set(frameIndex, frameData.cuts);

        console.log(`📋 프레임 ${frameIndex} 백그라운드 저장 완료 (DOM에는 추가하지 않음)`);

        // 모든 프레임의 cuts 데이터를 즉시 SolveTemplate에 추가
        this.appendCutsData(frameData.cuts);

        // 첫 프레임인 경우에만 즉시 렌더링하고 초기화
        if (frameIndex === 0 && this.currentFrameIndex === -1) {
            const frameHtml = this.frameBuffer.get(0);
            this.appendFrame(frameHtml, 0);
            this.currentFrameIndex = 0;

            // MathJax 재렌더링 (수식이 있는 경우)
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([this.frameContainer.lastElementChild]);
            }

            console.log(`🎨 프레임 0 렌더링 완료`);
            this.initializeFirstCut();
        }
        // 다른 프레임들은 백그라운드에서만 저장하고 표시하지 않음
    }

    /**
     * 프레임을 DOM에 추가
     */
    appendFrame(frameHtml, frameIndex) {
        // 임시 컨테이너에서 HTML 파싱
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = frameHtml;

        // 파싱된 프레임 요소 추가
        const frameElement = tempDiv.firstElementChild;
        if (frameElement) {
            // 프레임에 스트리밍 속성 추가
            frameElement.setAttribute('data-streaming-frame', frameIndex);
            frameElement.setAttribute('data-stream-time', Date.now());
            console.log(`✅ 프레임${frameIndex}에 data-streaming-frame="${frameIndex}" 속성 설정 완료`);

            this.frameContainer.appendChild(frameElement);

            // SolveTemplate의 frames 배열에 DOM 요소 연결
            this.linkFrameToSolveTemplate(frameIndex, frameElement);
        }
    }

    /**
     * 프레임의 모든 요소를 초기 상태로 숨김
     */
    hideAllElementsInFrame(frameElement) {
        // progressive 속성이 있는 모든 요소 숨김
        const progressiveElements = frameElement.querySelectorAll('[data-progressive]');
        progressiveElements.forEach(el => {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
        });

        // focus로 시작하는 id를 가진 모든 요소 숨김
        const allFocusElements = frameElement.querySelectorAll('[id*="focus"]');
        allFocusElements.forEach(element => {
            element.style.opacity = '0';
            element.style.visibility = 'hidden';
        });

        // scene-tag 클래스를 가진 모든 요소 숨김
        const allSceneTags = frameElement.querySelectorAll('.scene-tag');
        allSceneTags.forEach(element => {
            element.style.opacity = '0';
            element.style.visibility = 'hidden';
        });

        // 화살표 요소 숨김
        const allArrows = frameElement.querySelectorAll('.arrow');
        allArrows.forEach(arrow => {
            arrow.classList.remove('arrow-visible');
        });

        console.log(`🔒 프레임의 모든 progressive/focus/scene-tag 요소 초기 숨김 완료`);
    }

    /**
     * SolveTemplate의 frames 배열에 DOM 요소 연결
     */
    linkFrameToSolveTemplate(frameIndex, frameElement) {
        if (this.solveTemplate && this.solveTemplate.frames) {
            // frames 배열 확장 (필요한 경우)
            while (this.solveTemplate.frames.length <= frameIndex) {
                this.solveTemplate.frames.push({
                    cuts: [],
                    frameIndex: this.solveTemplate.frames.length,
                    element: null
                });
            }

            // DOM 요소 연결
            this.solveTemplate.frames[frameIndex].element = frameElement;

            console.log(`🔗 프레임 ${frameIndex} DOM 요소를 SolveTemplate에 연결 완료`);
            console.log(`📊 SolveTemplate.frames[${frameIndex}].element:`, !!this.solveTemplate.frames[frameIndex].element);
        } else {
            console.warn(`⚠️ SolveTemplate이 준비되지 않아 프레임 ${frameIndex} 연결 실패`);
        }
    }

    /**
     * cuts 데이터를 전역 변수에 추가하고 SolveTemplate 업데이트
     */
    appendCutsData(cuts) {
        if (!window.cutsData) {
            window.cutsData = [];
        }

        // 기존 cutsData에 새로운 cuts 추가
        window.cutsData.push(...cuts);

        console.log(`📊 cuts 데이터 추가: ${cuts.length}개, 총 ${window.cutsData.length}개`);

        // SolveTemplate이 있다면 cuts 데이터 업데이트
        this.updateSolveTemplateCuts();
    }

    /**
     * SolveTemplate 인스턴스에 cuts 데이터 업데이트
     */
    updateSolveTemplateCuts() {
        // SolveTemplate 인스턴스 찾기
        if (window.solveTemplate && typeof window.solveTemplate.generateCutsFromJSON === 'function') {
            this.solveTemplate = window.solveTemplate;
            this.isTemplateReady = true;

            console.log('🔄 SolveTemplate에 cuts 데이터 업데이트 중...');

            // frames 구조가 있는지 확인하고 없다면 생성
            this.ensureFramesStructure();

            // 첫 번째 호출인 경우에만 generateCutsFromJSON 사용 (전체 초기화)
            if (!this.cutsInitialized) {
                console.log('🆕 첫 번째 cuts 데이터 초기화');
                const success = this.solveTemplate.generateCutsFromJSON(window.cutsData);

                if (success) {
                    console.log('✅ SolveTemplate cuts 초기화 성공');
                    this.cutsInitialized = true;
                } else {
                    console.warn('⚠️ SolveTemplate cuts 초기화 실패');
                    return;
                }
            } else {
                // 이미 cuts가 있는 경우, 새로운 cuts만 추가
                console.log('📈 기존 cuts에 새로운 데이터 추가');
                this.appendNewCutsToSolveTemplate();
            }

            // moveToCut 메소드 사용 가능
            if (typeof this.solveTemplate.moveToCut === 'function') {
                console.log('🎯 moveToCut 메소드 사용 가능');
            }

            console.log(`📊 총 ${this.solveTemplate.allCuts.length}개 Cut 사용 가능`);
        } else {
            console.log('⏳ SolveTemplate 대기 중...');

            // SolveTemplate이 아직 준비되지 않았다면 잠시 후 재시도
            setTimeout(() => this.updateSolveTemplateCuts(), 100);
        }
    }

    /**
     * 새로운 cuts을 기존 SolveTemplate에 추가
     */
    appendNewCutsToSolveTemplate() {
        if (!this.solveTemplate.allCuts) {
            this.solveTemplate.allCuts = [];
        }

        const existingCutCount = this.solveTemplate.allCuts.length;
        const newCutsData = window.cutsData.slice(existingCutCount); // 기존 cuts 이후의 새로운 cuts만 가져오기

        console.log(`📋 새로운 cuts ${newCutsData.length}개 추가 중... (기존: ${existingCutCount}개)`);

        newCutsData.forEach((cutData, index) => {
            // JSON에서 모든 메타데이터를 직접 가져와서 cut 생성 (solve-template.js와 동일한 로직)
            const cut = {
                name: cutData.visual_script || `Cut ${cutData.cut_index}`,
                cutIndex: cutData.cut_index,
                frameIndex: cutData.frame_index,
                targetElement: cutData.target_element,
                revealElements: cutData.reveal_elements || [],
                problemSize: cutData.problem_size || 'large',
                isProblemFocus: cutData.is_problem_focus || false,
                isOverviewMode: cutData.is_overview_mode || false,
                cameraPosition: cutData.camera_position || 'center',
                animationType: cutData.animation_type || 'focus',
                animationDuration: cutData.animation_duration || 800,
                cutType: cutData.cut_type,
                targetElementSelector: cutData.target_element_selector
            };

            // allCuts 배열에 추가
            this.solveTemplate.allCuts.push(cut);

            // 해당 프레임의 cuts 배열에도 추가
            const frameIndex = cut.frameIndex;
            if (!this.solveTemplate.frames[frameIndex]) {
                this.solveTemplate.frames[frameIndex] = { cuts: [] };
            }
            if (!this.solveTemplate.frames[frameIndex].cuts) {
                this.solveTemplate.frames[frameIndex].cuts = [];
            }
            this.solveTemplate.frames[frameIndex].cuts.push(cut);

            console.log(`➕ Cut ${cut.cutIndex} (프레임 ${frameIndex}) 추가 완료`);
        });

        console.log(`✅ 총 ${this.solveTemplate.allCuts.length}개 cuts로 업데이트 완료`);
    }

    /**
     * SolveTemplate을 위한 frames 구조 보장
     */
    ensureFramesStructure() {
        if (!this.solveTemplate.frames) {
            this.solveTemplate.frames = [];
        }

        // 현재까지 받은 프레임 수만큼 frames 배열 확장
        const maxFrameIndex = Math.max(...Array.from(this.frameBuffer.keys()), -1);

        for (let i = 0; i <= maxFrameIndex; i++) {
            if (!this.solveTemplate.frames[i]) {
                this.solveTemplate.frames[i] = {
                    cuts: [],
                    frameIndex: i,
                    element: null
                };
            }

            // 기존 DOM 요소와 연결 확인 및 복구
            if (!this.solveTemplate.frames[i].element) {
                const existingElement = this.frameContainer.querySelector(`[data-streaming-frame="${i}"]`);
                if (existingElement) {
                    this.solveTemplate.frames[i].element = existingElement;
                    console.log(`🔗 기존 프레임 ${i} DOM 요소 연결 복구`);
                }
            }
        }

        console.log(`📋 frames 구조 보장: ${this.solveTemplate.frames.length}개 프레임`);
    }

    /**
     * 스트리밍 완료
     */
    completeStreaming() {
        this.isStreaming = false;

        console.log('🎉 스트리밍 완료');

        // 버퍼는 정리하지 않음 - cut 이동 시 프레임 존재 여부 확인에 사용됨
        // this.frameBuffer.clear();
        // this.cutsBuffer.clear();

        // Flutter에 완료 신호 전송
        if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
            window.flutter_inappwebview.callHandler('streamingCompleted', {
                totalFrames: this.currentFrameIndex + 1,
                timestamp: Date.now(),
                solveTemplateReady: this.isTemplateReady
            });
        }
    }

    /**
     * 첫 번째 프레임 렌더링 후 즉시 첫 번째 cut 초기화
     */
    initializeFirstCut() {
        console.log('🎯 첫 번째 프레임 - 즉시 재생 준비');

        // SolveTemplate이 준비될 때까지 대기하면서 첫 번째 cut 초기화
        const initializeWithRetry = () => {
            if (window.solveTemplate && typeof window.solveTemplate.generateCutsFromJSON === 'function') {
                this.solveTemplate = window.solveTemplate;
                this.isTemplateReady = true;

                console.log('🎯 첫 프레임에서 SolveTemplate 초기화 시작');

                // frames 구조 보장
                this.ensureFramesStructure();

                // cuts 데이터 업데이트
                const success = this.solveTemplate.generateCutsFromJSON(window.cutsData);

                if (success && this.solveTemplate.allCuts.length > 0) {
                    // 모든 progressive 요소 숨김
                    if (typeof this.solveTemplate.hideAllProgressiveElements === 'function') {
                        this.solveTemplate.hideAllProgressiveElements();
                    }

                    // 첫 번째 프레임 DOM 요소 연결 확인
                    const firstFrameElement = this.frameContainer.querySelector('[data-streaming-frame="0"]');
                    if (firstFrameElement) {
                        this.linkFrameToSolveTemplate(0, firstFrameElement);
                    }

                    // 첫 번째 cut으로 즉시 이동 (currentCut은 이미 0으로 초기화됨)
                    setTimeout(() => {
                        // moveToCut 호출하지 않고 currentCut 상태를 유지
                        // (SolveTemplate의 currentCut은 이미 0으로 초기화되어 있음)
                        console.log('✅ 첫 프레임 재생 준비 - currentCut은 이미 0으로 초기화됨');
                        console.log('📊 SolveTemplate 초기 상태:');
                        console.log('  - currentCut:', this.solveTemplate.currentCut);
                        console.log('  - allCuts 수:', this.solveTemplate.allCuts.length);
                        console.log('  - nextCut 메소드:', typeof this.solveTemplate.nextCut);
                        console.log('  - previousCut 메소드:', typeof this.solveTemplate.previousCut);
                        console.log('  - frames[0].element:', !!this.solveTemplate.frames[0]?.element);

                        // 이벤트 리스너 설정
                        if (typeof this.solveTemplate.setupEventListeners === 'function') {
                            this.solveTemplate.setupEventListeners();
                        }

                        // MathJax 재렌더링
                        if (window.MathJax && window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise([this.frameContainer]);
                        }
                    }, 100);
                } else {
                    console.warn('⚠️ 첫 프레임에서 cuts 업데이트 실패');
                }
            } else {
                console.log('⏳ 첫 프레임 - SolveTemplate 대기 중...');
                setTimeout(initializeWithRetry, 100);
            }
        };

        initializeWithRetry();
    }

    /**
     * 특정 프레임의 요소들을 DOM에 추가 (cut 이동 시 호출)
     */
    ensureFrameInDOM(frameIndex) {
        if (!this.frameBuffer.has(frameIndex)) {
            console.warn(`⚠️ 프레임 ${frameIndex}이 아직 수신되지 않았습니다`);
            return false;
        }

        // 이미 DOM에 추가되었는지 확인
        const existingFrame = this.frameContainer.querySelector(`[data-streaming-frame="${frameIndex}"]`);
        if (existingFrame) {
            console.log(`📋 프레임 ${frameIndex}은 이미 DOM에 존재합니다`);
            return true;
        }

        // 프레임 DOM에 추가
        const frameHtml = this.frameBuffer.get(frameIndex);
        console.log(`🎨 프레임 ${frameIndex}을 DOM에 추가합니다`);

        this.appendFrame(frameHtml, frameIndex);

        // 프레임 0이 아닌 경우, DOM에 추가된 직후 모든 요소를 즉시 숨김
        // (nextCut 호출 전에 실행되어야 함)
        if (frameIndex > 0) {
            const frameElement = this.frameContainer.querySelector(`[data-streaming-frame="${frameIndex}"]`);
            if (frameElement) {
                this.hideAllElementsInFrame(frameElement);
            }
        }

        // MathJax 재렌더링
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([this.frameContainer.lastElementChild]);
        }

        // SolveTemplate 연결 확인
        this.ensureSolveTemplateConnection();

        return true;
    }

    /**
     * SolveTemplate 연결 확인 및 갱신
     */
    ensureSolveTemplateConnection() {
        // window.solveTemplate이 있고 현재 연결된 것과 다르다면 업데이트
        if (window.solveTemplate && window.solveTemplate !== this.solveTemplate) {
            console.log('🔄 SolveTemplate 인스턴스 연결 업데이트');
            this.solveTemplate = window.solveTemplate;
            this.isTemplateReady = true;
        }
    }

    /**
     * SolveTemplate 메소드를 직접 노출 (Flutter에서 사용)
     */
    moveToCut(cutNumber) {
        this.ensureSolveTemplateConnection();

        if (this.solveTemplate && typeof this.solveTemplate.moveToCut === 'function') {
            const targetCut = this.solveTemplate.allCuts.find(c => c.cutIndex === cutNumber);

            if (targetCut) {
                console.log(`🎯 StreamingSystem을 통한 moveToCut(${cutNumber}) 호출 - 프레임 ${targetCut.frameIndex}`);

                // 해당 프레임이 DOM에 있는지 확인하고 없으면 추가
                this.ensureFrameInDOM(targetCut.frameIndex);

                // SolveTemplate의 moveToCut 호출
                this.solveTemplate.moveToCut(cutNumber);
                return true;
            } else {
                console.warn(`⚠️ Cut ${cutNumber}을 찾을 수 없습니다`);
                return false;
            }
        } else {
            console.warn('⚠️ SolveTemplate이 준비되지 않음 - moveToCut 실패');
            return false;
        }
    }

    nextCut() {
        // 최신 SolveTemplate 인스턴스 확인
        this.ensureSolveTemplateConnection();

        console.log('🎯 StreamingSystem nextCut() 호출');

        if (this.solveTemplate && typeof this.solveTemplate.nextCut === 'function') {
            const nextCutIndex = this.solveTemplate.currentCut + 1;
            const nextCut = this.solveTemplate.allCuts.find(c => c.cutIndex === nextCutIndex);

            if (nextCut) {
                console.log(`  - 다음 cut ${nextCutIndex} (프레임 ${nextCut.frameIndex})로 이동 준비`);

                // 해당 프레임이 수신되었는지 확인
                if (!this.frameBuffer.has(nextCut.frameIndex)) {
                    console.log(`⚠️ 프레임 ${nextCut.frameIndex}이 아직 수신되지 않았습니다. 대기 중...`);

                    // Flutter에 다음 프레임 필요 알림
                    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
                        window.flutter_inappwebview.callHandler('needNextFrame', {
                            requiredFrameIndex: nextCut.frameIndex,
                            currentCut: nextCutIndex,
                            timestamp: Date.now()
                        });
                    }

                    return false;
                }

                // 해당 프레임이 DOM에 있는지 확인하고 없으면 추가
                this.ensureFrameInDOM(nextCut.frameIndex);

                // SolveTemplate의 nextCut 호출
                this.solveTemplate.nextCut();

                console.log('  - nextCut 호출 완료, 새로운 currentCut:', this.solveTemplate.currentCut);
                return true;
            } else {
                console.log('  - 다음 Cut이 없습니다');
                return false;
            }
        } else {
            console.warn('⚠️ SolveTemplate이 준비되지 않음 - nextCut 실패');
            return false;
        }
    }

    previousCut() {
        // 최신 SolveTemplate 인스턴스 확인
        this.ensureSolveTemplateConnection();

        console.log('🎯 StreamingSystem previousCut() 호출');

        if (this.solveTemplate && typeof this.solveTemplate.previousCut === 'function') {
            const prevCutIndex = this.solveTemplate.currentCut - 1;
            const prevCut = this.solveTemplate.allCuts.find(c => c.cutIndex === prevCutIndex);

            if (prevCut) {
                console.log(`  - 이전 cut ${prevCutIndex} (프레임 ${prevCut.frameIndex})로 이동 준비`);

                // 해당 프레임이 수신되었는지 확인
                if (!this.frameBuffer.has(prevCut.frameIndex)) {
                    console.log(`⚠️ 프레임 ${prevCut.frameIndex}이 아직 수신되지 않았습니다. 대기 중...`);

                    // Flutter에 해당 프레임 필요 알림
                    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
                        window.flutter_inappwebview.callHandler('needPrevFrame', {
                            requiredFrameIndex: prevCut.frameIndex,
                            currentCut: prevCutIndex,
                            timestamp: Date.now()
                        });
                    }

                    return false;
                }

                // 해당 프레임이 DOM에 있는지 확인하고 없으면 추가
                this.ensureFrameInDOM(prevCut.frameIndex);

                // SolveTemplate의 previousCut 호출
                this.solveTemplate.previousCut();

                console.log('  - previousCut 호출 완료, 새로운 currentCut:', this.solveTemplate.currentCut);
                return true;
            } else {
                console.log('  - 이전 Cut이 없습니다');
                return false;
            }
        } else {
            console.warn('⚠️ SolveTemplate이 준비되지 않음 - previousCut 실패');
            return false;
        }
    }

    getCurrentCut() {
        if (this.solveTemplate && this.solveTemplate.currentCut !== undefined) {
            return this.solveTemplate.currentCut;
        }
        return null;
    }

    getTotalCuts() {
        if (this.solveTemplate && this.solveTemplate.allCuts) {
            return this.solveTemplate.allCuts.length;
        }
        return 0;
    }
}

// 전역 인스턴스 생성 및 노출
let streamingSystemInstance = null;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 StreamingSystem 초기화 시작');
    streamingSystemInstance = new StreamingSystem();

    // 전역 접근을 위한 참조
    window.streamingSystemInstance = streamingSystemInstance;

    console.log('✨ StreamingSystem 준비 완료');
});