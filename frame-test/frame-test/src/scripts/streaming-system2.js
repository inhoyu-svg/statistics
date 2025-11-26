/**
 * Streaming System for Frame-based Content Delivery
 * 프레임 단위 스트리밍 콘텐츠 배달 시스템
 * lecture-template.js와 호환되는 구조
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
        this.cutsBuffer = new Map(); // cuts 데이터 버퍼

        // LectureTemplate 인스턴스와 연동할 준비
        this.lectureTemplate = null;
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
            console.log('📦 프레임 수신:', frameData.frame_index);
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
     * 프레임 데이터 처리 (lecture-template.js 호환)
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

        console.log(`📋 프레임 ${frameIndex} 버퍼에 저장 완료`);
        console.log(`🔍 현재 상태: frameIndex=${frameIndex}, currentFrameIndex=${this.currentFrameIndex}, isStreaming=${this.isStreaming}`);

        // 모든 프레임의 cuts 데이터를 즉시 LectureTemplate에 추가
        this.appendCutsData(frameData.cuts);

        // 첫 프레임인 경우에만 즉시 렌더링하고 초기화
        if (frameIndex === 0 && this.currentFrameIndex === -1) {
            console.log('✅ 프레임 0 조건 만족 - DOM에 추가 시작');
            const frameHtml = this.frameBuffer.get(0);
            this.appendFrame(frameHtml, 0);
            this.currentFrameIndex = 0;

            // MathJax 재렌더링 (수식이 있는 경우)
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([this.frameContainer.lastElementChild]);
            }

            // MathVisualization 렌더링 (시각화가 있는 경우)
            // if (window.MathVisualization && typeof window.MathVisualization.renderAll === 'function') {
            //     // 프레임 내의 모든 요소 ID 수집 (시각화 포함)
            //     const frameElement = this.frameContainer.lastElementChild;
            //     const allElements = frameElement.querySelectorAll('[id]');
            //     const elementIds = Array.from(allElements).map(el => el.id);
            //     console.log('🎨 프레임 0 시각화 렌더링 시도, 요소 수:', elementIds.length);
            //     window.MathVisualization.renderAll(elementIds);
            // }

            console.log(`🎨 프레임 0 렌더링 완료`);
            this.initializeFirstCut();
        } else if (frameIndex === 0) {
            console.warn(`⚠️ 프레임 0이지만 조건 실패: currentFrameIndex=${this.currentFrameIndex} (expected: -1)`);
        } else {
            console.log(`📦 프레임 ${frameIndex}은 백그라운드에만 저장 (cut 이동 시 DOM에 추가 예정)`);
        }
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

            // LectureTemplate의 frames 배열에 DOM 요소 연결
            this.linkFrameToLectureTemplate(frameIndex, frameElement);
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
     * LectureTemplate의 frames 배열에 DOM 요소 연결
     */
    linkFrameToLectureTemplate(frameIndex, frameElement) {
        if (this.lectureTemplate && this.lectureTemplate.frames) {
            // frames 배열 확장 (필요한 경우)
            while (this.lectureTemplate.frames.length <= frameIndex) {
                this.lectureTemplate.frames.push({
                    cuts: [],
                    frameIndex: this.lectureTemplate.frames.length,
                    element: null
                });
            }

            // DOM 요소 연결
            this.lectureTemplate.frames[frameIndex].element = frameElement;

            console.log(`🔗 프레임 ${frameIndex} DOM 요소를 LectureTemplate에 연결 완료`);
            console.log(`📊 LectureTemplate.frames[${frameIndex}].element:`, !!this.lectureTemplate.frames[frameIndex].element);
        } else {
            console.warn(`⚠️ LectureTemplate이 준비되지 않아 프레임 ${frameIndex} 연결 실패`);
        }
    }

    /**
     * cuts 데이터를 전역 변수에 추가하고 LectureTemplate 업데이트
     */
    appendCutsData(cuts) {
        if (!window.cutsData) {
            window.cutsData = [];
        }

        // 기존 cutsData에 새로운 cuts 추가
        window.cutsData.push(...cuts);

        console.log(`📊 cuts 데이터 추가: ${cuts.length}개, 총 ${window.cutsData.length}개`);

        // LectureTemplate이 있다면 cuts 데이터 업데이트
        this.updateLectureTemplateCuts();
    }

    /**
     * LectureTemplate 인스턴스에 cuts 데이터 업데이트
     */
    updateLectureTemplateCuts() {
        // LectureTemplate 인스턴스 찾기
        if (window.lectureTemplate && typeof window.lectureTemplate.generateCutsFromJSON === 'function') {
            this.lectureTemplate = window.lectureTemplate;
            this.isTemplateReady = true;

            console.log('🔄 LectureTemplate에 cuts 데이터 업데이트 중...');

            // frames 구조가 있는지 확인하고 없다면 생성
            this.ensureFramesStructure();

            // 첫 번째 호출인 경우에만 generateCutsFromJSON 사용 (전체 초기화)
            if (!this.cutsInitialized) {
                console.log('🆕 첫 번째 cuts 데이터 초기화');
                const success = this.lectureTemplate.generateCutsFromJSON(window.cutsData);

                if (success) {
                    console.log('✅ LectureTemplate cuts 초기화 성공');
                    this.cutsInitialized = true;

                } else {
                    console.warn('⚠️ LectureTemplate cuts 초기화 실패');
                    return;
                }
            } else {
                // 이미 cuts가 있는 경우, 새로운 cuts만 추가
                console.log('📈 기존 cuts에 새로운 데이터 추가');
                this.appendNewCutsToLectureTemplate();
            }

            // moveToCut 메소드 사용 가능
            if (typeof this.lectureTemplate.moveToCut === 'function') {
                console.log('🎯 moveToCut 메소드 사용 가능');
            }

            console.log(`📊 총 ${this.lectureTemplate.allCuts.length}개 Cut 사용 가능`);
        } else {
            console.log('⏳ LectureTemplate 대기 중...');

            // LectureTemplate이 아직 준비되지 않았다면 잠시 후 재시도
            setTimeout(() => this.updateLectureTemplateCuts(), 100);
        }
    }


    /**
     * 새로운 cuts을 기존 LectureTemplate에 추가
     */
    appendNewCutsToLectureTemplate() {
        if (!this.lectureTemplate.allCuts) {
            this.lectureTemplate.allCuts = [];
        }

        const existingCutCount = this.lectureTemplate.allCuts.length;
        const newCutsData = window.cutsData.slice(existingCutCount); // 기존 cuts 이후의 새로운 cuts만 가져오기

        console.log(`📋 새로운 cuts ${newCutsData.length}개 추가 중... (기존: ${existingCutCount}개)`);

        newCutsData.forEach((cutData, index) => {
            // JSON에서 모든 메타데이터를 직접 가져와서 cut 생성 (lecture-template.js와 동일한 로직)
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
            this.lectureTemplate.allCuts.push(cut);

            // 해당 프레임의 cuts 배열에도 추가
            const frameIndex = cut.frameIndex;
            if (!this.lectureTemplate.frames[frameIndex]) {
                this.lectureTemplate.frames[frameIndex] = {
                    cuts: []
                };
            }
            if (!this.lectureTemplate.frames[frameIndex].cuts) {
                this.lectureTemplate.frames[frameIndex].cuts = [];
            }
            this.lectureTemplate.frames[frameIndex].cuts.push(cut);

            console.log(`➕ Cut ${cut.cutIndex} (프레임 ${frameIndex}) 추가 완료`);
        });

        console.log(`✅ 총 ${this.lectureTemplate.allCuts.length}개 cuts로 업데이트 완료`);
    }

    /**
     * LectureTemplate을 위한 frames 구조 보장
     */
    ensureFramesStructure() {
        if (!this.lectureTemplate.frames) {
            this.lectureTemplate.frames = [];
        }

        // 현재까지 받은 프레임 수만큼 frames 배열 확장
        const maxFrameIndex = Math.max(...Array.from(this.frameBuffer.keys()), -1);

        for (let i = 0; i <= maxFrameIndex; i++) {
            if (!this.lectureTemplate.frames[i]) {
                this.lectureTemplate.frames[i] = {
                    cuts: [],
                    frameIndex: i,
                    element: null
                };
            }

            // 기존 DOM 요소와 연결 확인 및 복구
            if (!this.lectureTemplate.frames[i].element) {
                const existingElement = this.frameContainer.querySelector(`[data-streaming-frame="${i}"]`);
                if (existingElement) {
                    this.lectureTemplate.frames[i].element = existingElement;
                    console.log(`🔗 기존 프레임 ${i} DOM 요소 연결 복구`);
                }
            }
        }

        console.log(`📋 frames 구조 보장: ${this.lectureTemplate.frames.length}개 프레임`);
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
                lectureTemplateReady: this.isTemplateReady
            });
        }
    }

    /**
     * 첫 번째 프레임 렌더링 후 즉시 첫 번째 cut 초기화
     */
    initializeFirstCut() {
        console.log('🎯 첫 번째 프레임 - 즉시 재생 준비');

        // LectureTemplate이 준비될 때까지 대기하면서 첫 번째 cut 초기화
        const initializeWithRetry = () => {
            // LectureTemplate 클래스가 로드되었는지 확인
            if (typeof window.LectureTemplate === 'function') {
                // 인스턴스가 아직 없으면 생성
                if (!window.lectureTemplate) {
                    console.log('🆕 LectureTemplate 인스턴스 생성 (스트리밍 모드)');
                    window.lectureTemplate = new window.LectureTemplate();
                }

                this.lectureTemplate = window.lectureTemplate;
                this.isTemplateReady = true;

                console.log('🎯 첫 프레임에서 LectureTemplate 초기화 시작');

                // frames 구조 보장
                this.ensureFramesStructure();

                // cuts 데이터 업데이트
                const success = this.lectureTemplate.generateCutsFromJSON(window.cutsData);

                if (success && this.lectureTemplate.allCuts.length > 0) {
                    // activateFrame 메소드 오버라이드 (첫 프레임 초기화 시)

                    // 모든 progressive 요소 숨김
                    if (typeof this.lectureTemplate.hideAllProgressiveElements === 'function') {
                        this.lectureTemplate.hideAllProgressiveElements();
                    }

                    // 첫 번째 프레임 DOM 요소 연결 확인
                    const firstFrameElement = this.frameContainer.querySelector('[data-streaming-frame="0"]');
                    if (firstFrameElement) {
                        this.linkFrameToLectureTemplate(0, firstFrameElement);
                    }

                    // appendFrame에서 스타일링이 100ms 후에 시작되므로
                    // 스타일링 완료와 DOM 렌더링을 확실히 기다린 후 moveToCut(0) 호출
                    setTimeout(() => {
                        // requestAnimationFrame으로 DOM 렌더링 완료 보장
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                // 첫 번째 cut으로 명시적으로 이동
                                // initializeFrames()에서는 스트리밍 모드 감지로 moveToCut 호출 안 하므로 여기서 처리
                                if (this.lectureTemplate.allCuts.length > 0) {
                                    console.log('🎬 첫 번째 cut으로 이동 시작 (스타일링 완료 후)');
                                    this.lectureTemplate.moveToCut(0);
                                    console.log('✅ 첫 프레임 재생 준비 완료 - 첫 번째 cut 표시');
                                }

                                // 이벤트 리스너 설정
                                if (typeof this.lectureTemplate.setupEventListeners === 'function') {
                                    this.lectureTemplate.setupEventListeners();
                                }

                                // MathJax 재렌더링
                                if (window.MathJax && window.MathJax.typesetPromise) {
                                    window.MathJax.typesetPromise([this.frameContainer]).then(() => {
                                        console.log('✅ MathJax 렌더링 완료');
                                    });
                                }

                                console.log('📊 LectureTemplate 최종 상태:');
                                console.log('  - currentCut:', this.lectureTemplate.currentCut);
                                console.log('  - allCuts 수:', this.lectureTemplate.allCuts.length);
                            });
                        });
                    }, 300); // appendFrame의 스타일링(100ms) + 여유 시간(200ms) 후 requestAnimationFrame으로 DOM 렌더링 보장
                } else {
                    console.warn('⚠️ 첫 프레임에서 cuts 업데이트 실패');
                }
            } else {
                console.log('⏳ 첫 프레임 - LectureTemplate 대기 중...');
                setTimeout(initializeWithRetry, 100);
            }
        };

        initializeWithRetry();
    }

    /**
     * 이전 프레임들을 DOM에서 제거
     */
    removePreviousFrames(currentFrameIndex) {
        // 현재 프레임보다 작은 인덱스를 가진 모든 프레임 제거
        const allFrames = this.frameContainer.querySelectorAll('[data-streaming-frame]');

        allFrames.forEach(frameElement => {
            const frameIndex = parseInt(frameElement.getAttribute('data-streaming-frame'), 10);

            if (frameIndex < currentFrameIndex) {
                console.log(`🗑️ 프레임 ${frameIndex} DOM에서 제거`);
                frameElement.remove();
            }
        });
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

            // DOM에 있더라도 lectureTemplate.frames 배열과의 연결을 확인하고 재연결

            return true;
        }

        // 새 프레임을 추가하기 전에 이전 프레임들 제거
        this.removePreviousFrames(frameIndex);

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

        // MathVisualization 렌더링 (시각화가 있는 경우)
        if (window.MathVisualization && typeof window.MathVisualization.renderAll === 'function') {
            const frameElement = this.frameContainer.querySelector(`[data-streaming-frame="${frameIndex}"]`);
            if (frameElement) {
                const allElements = frameElement.querySelectorAll('[id]');
                const elementIds = Array.from(allElements).map(el => el.id);
                console.log(`🎨 프레임 ${frameIndex} 시각화 렌더링 시도, 요소 수:`, elementIds.length);
                window.MathVisualization.renderAll(elementIds);
            }
        }

        // LectureTemplate 연결 확인
        this.ensureLectureTemplateConnection();

        return true;
    }

    /**
     * LectureTemplate 연결 확인 및 갱신
     */
    ensureLectureTemplateConnection() {
        // window.lectureTemplate이 있고 현재 연결된 것과 다르다면 업데이트
        if (window.lectureTemplate && window.lectureTemplate !== this.lectureTemplate) {
            console.log('🔄 LectureTemplate 인스턴스 연결 업데이트');
            this.lectureTemplate = window.lectureTemplate;
            this.isTemplateReady = true;
        }
    }

    /**
     * LectureTemplate 메소드를 직접 노출 (Flutter에서 사용)
     */
    moveToCut(cutNumber) {
        this.ensureLectureTemplateConnection();

        if (this.lectureTemplate && typeof this.lectureTemplate.moveToCut === 'function') {
            const targetCut = this.lectureTemplate.allCuts.find(c => c.cutIndex === cutNumber);

            if (targetCut) {
                console.log(`🎯 StreamingSystem을 통한 moveToCut(${cutNumber}) 호출 - 프레임 ${targetCut.frameIndex}`);

                // 해당 프레임이 DOM에 있는지 확인하고 없으면 추가
                this.ensureFrameInDOM(targetCut.frameIndex);

                // LectureTemplate의 moveToCut 호출
                this.lectureTemplate.moveToCut(cutNumber);
                return true;
            } else {
                console.warn(`⚠️ Cut ${cutNumber}을 찾을 수 없습니다`);
                return false;
            }
        } else {
            console.warn('⚠️ LectureTemplate이 준비되지 않음 - moveToCut 실패');
            return false;
        }
    }

    nextCut() {
        // 최신 LectureTemplate 인스턴스 확인
        this.ensureLectureTemplateConnection();

        console.log('🎯 StreamingSystem nextCut() 호출');

        if (this.lectureTemplate && typeof this.lectureTemplate.nextCut === 'function') {
            const nextCutIndex = this.lectureTemplate.currentCut + 1;
            const nextCut = this.lectureTemplate.allCuts.find(c => c.cutIndex === nextCutIndex);

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

                // LectureTemplate의 nextCut 호출
                this.lectureTemplate.nextCut();

                console.log('  - nextCut 호출 완료, 새로운 currentCut:', this.lectureTemplate.currentCut);
                return true;
            } else {
                console.log('  - 다음 Cut이 없습니다');
                return false;
            }
        } else {
            console.warn('⚠️ LectureTemplate이 준비되지 않음 - nextCut 실패');
            return false;
        }
    }

    previousCut() {
        // 최신 LectureTemplate 인스턴스 확인
        this.ensureLectureTemplateConnection();

        console.log('🎯 StreamingSystem previousCut() 호출');

        if (this.lectureTemplate && typeof this.lectureTemplate.previousCut === 'function') {
            const prevCutIndex = this.lectureTemplate.currentCut - 1;
            const prevCut = this.lectureTemplate.allCuts.find(c => c.cutIndex === prevCutIndex);

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

                // LectureTemplate의 previousCut 호출
                this.lectureTemplate.previousCut();

                console.log('  - previousCut 호출 완료, 새로운 currentCut:', this.lectureTemplate.currentCut);
                return true;
            } else {
                console.log('  - 이전 Cut이 없습니다');
                return false;
            }
        } else {
            console.warn('⚠️ LectureTemplate이 준비되지 않음 - previousCut 실패');
            return false;
        }
    }

    getCurrentCut() {
        if (this.lectureTemplate && this.lectureTemplate.currentCut !== undefined) {
            return this.lectureTemplate.currentCut;
        }
        return null;
    }

    getTotalCuts() {
        if (this.lectureTemplate && this.lectureTemplate.allCuts) {
            return this.lectureTemplate.allCuts.length;
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