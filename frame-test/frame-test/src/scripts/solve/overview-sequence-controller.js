// ===== Overview Mode 시퀀스 컨트롤러 =====
export class OverviewSequenceController {
    constructor(solveTemplate) {
        this.template = solveTemplate;
        this.isActive = false;
        this.currentIndex = 0;
        this.totalHighlights = 0;
        this.autoPlay = true;
        this.scheduledTimeouts = [];
        this.highlightElements = [];
        this.currentCut = null;
        this.lastEffect = null;
    }

    start(cut, delayMs = 0) {
        console.log('[OverviewSequence] 시작 예약:', cut.cutIndex, `${delayMs}ms 후`);
        this.currentCut = cut;
        this.currentIndex = 0;
        this.autoPlay = true;

        const startTimeoutId = setTimeout(() => {
            console.log('[OverviewSequence] 실제 시작:', cut.cutIndex);

            this.collectHighlights();

            if (this.highlightElements.length === 0) {
                console.log('[OverviewSequence] 하이라이트 요소 없음, 시퀀스 종료');
                return;
            }

            console.log(`[OverviewSequence] ${this.highlightElements.length}개 하이라이트 발견`);

            this.isActive = true;

            this.playSequence(0);
        }, delayMs);

        this.scheduledTimeouts.push(startTimeoutId);
    }

    collectHighlights() {
        const currentFrame = this.template.frames[this.template.currentFrameIndex];
        if (!currentFrame) return;

        const currentScene = currentFrame.element.querySelector('.content-scene');
        if (!currentScene) return;

        const highlightedElements = Array.from(currentScene.querySelectorAll('[class*="highlight-"]'));

        if (highlightedElements.length === 0) return;

        const filteredHighlights = highlightedElements.filter(el => {
            const isInTitle = el.closest('#focusKeywordTitle, [id^="focusKeywordTitle"], .keyword-title, .step-title, .scene-tag') !== null;
            return !isInTitle;
        });

        console.log(`[OverviewSequence] 전체 하이라이트: ${highlightedElements.length}개, 타이틀 제외: ${filteredHighlights.length}개`);

        if (filteredHighlights.length === 0) {
            console.log('[OverviewSequence] 타이틀 하이라이트만 있음 - 시퀀스 스킵');
            return;
        }

        const elementsWithOrder = filteredHighlights.map(el => {
            let orderNumber = 999;
            let foundParentInfo = 'none';

            let parent = el.closest('[id*="Content"], [id*="content"], [class*="content-item"], .step-content-item');
            if (parent && parent.id) {
                foundParentInfo = `parent.id=${parent.id}`;
                const matches = parent.id.match(/(\d+)/g);
                if (matches && matches.length > 0) {
                    orderNumber = parseInt(matches[matches.length - 1], 10);
                }
            }

            if (orderNumber === 999 && el.id) {
                foundParentInfo = `self.id=${el.id}`;
                const matches = el.id.match(/(\d+)/g);
                if (matches && matches.length > 0) {
                    orderNumber = parseInt(matches[matches.length - 1], 10);
                }
            }

            if (orderNumber === 999) {
                parent = el.closest('[id]');
                if (parent && parent.id) {
                    foundParentInfo = `any-parent.id=${parent.id}`;
                    const matches = parent.id.match(/(\d+)/g);
                    if (matches && matches.length > 0) {
                        orderNumber = parseInt(matches[matches.length - 1], 10);
                    }
                }
            }

            console.log(`[OverviewSequence] Contents 순서 추출: order=${orderNumber}, parent=${foundParentInfo}`);

            return {
                element: el,
                order: orderNumber
            };
        });

        elementsWithOrder.sort((a, b) => {
            return a.order - b.order;
        });

        this.highlightElements = elementsWithOrder;
        this.totalHighlights = this.highlightElements.length;

        console.log(`[OverviewSequence] Contents 정렬 완료:`, this.highlightElements.map((h, i) =>
            `Content${h.order} (${i + 1}번째 포커싱)`
        ));
    }

    playSequence(startIndex) {
        console.log(`[OverviewSequence] 자동 재생 시작: index ${startIndex}`);

        const intervalMs = 1800;

        for (let i = startIndex; i < this.highlightElements.length; i++) {
            const delay = i * intervalMs;
            const timeoutId = setTimeout(() => {
                if (this.autoPlay && this.isActive) {
                    this.jumpToHighlight(i, i === 0);
                }
            }, delay);
            this.scheduledTimeouts.push(timeoutId);
        }

        const finalDelay = this.highlightElements.length * intervalMs + 1000;
        const finalTimeoutId = setTimeout(() => {
            if (this.autoPlay && this.isActive) {
                this.finish();
            }
        }, finalDelay);
        this.scheduledTimeouts.push(finalTimeoutId);
    }

    hideFocusOverlay() {
        const overlay = document.getElementById('focusOverlay');
        if (!overlay) return;

        console.log('[OverviewSequence] Focus overlay fade out');

        overlay.style.transition = 'opacity 0.8s ease-out';

        requestAnimationFrame(() => {
            overlay.classList.remove('active');
            overlay.style.opacity = '0';
            console.log('[OverviewSequence] Opacity 0으로 설정됨 (fade-out)');
        });

        setTimeout(() => {
            overlay.style.background = '';
            overlay.style.clipPath = '';
            overlay.style.opacity = '';
        }, 850);
    }

    jumpToHighlight(index, isFirstHighlight = false) {
        if (index >= this.highlightElements.length) return;

        this.currentIndex = index;
        const item = this.highlightElements[index];

        console.log(`[OverviewSequence] 하이라이트 ${index + 1}/${this.highlightElements.length}로 이동`);

        this.highlightElements.forEach(h => {
            h.element.classList.remove('glow-pulse', 'glow-star', 'glow-check');
        });

        this.template.applyCameraToHighlight(item.element);

        this.template.playSoundEffect('화면 이동 (작은).mp3');
        console.log('[Sound] Overview 모드 내부 포커스 이동 효과음 재생');

        this.updateFocusOverlayPosition(item.element, isFirstHighlight);

        const glowTimeoutId = setTimeout(() => {
            const currentProblemType = this.template.problemTypeByFrame?.[this.template.currentFrameIndex];
            const isReadingScene = currentProblemType === 'reading';

            let effects = [
                'glow-pulse-star',
                'glow-double-pulse',
                'glow-double-pulse-star',
                'glow-pulse-curl-star',
                'glow-star-text',
                'glow-check-text'
            ];

            if (isReadingScene) {
                effects = effects.filter(e => e !== 'glow-star-text' && e !== 'glow-check-text');
                console.log('[OverviewSequence] 독해 씬이므로 텍스트 효과 제외');
            }

            let availableEffects = effects;
            if (this.lastEffect) {
                availableEffects = effects.filter(e => e !== this.lastEffect);
            }

            const randomEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
            this.lastEffect = randomEffect;

            console.log(`[OverviewSequence] 선택된 효과: ${randomEffect} (이전: ${this.lastEffect})`);

            if (randomEffect === 'glow-circle-check') {
                this.template.createSVGEffect(item.element, 'glow-circle');
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-circle 시작 (조합 1/2)`);

                const checkTimeoutId = setTimeout(() => {
                    this.template.createSVGEffect(item.element, 'glow-check');
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-check 시작 (조합 2/2)`);
                }, 100);

                this.scheduledTimeouts.push(checkTimeoutId);
            } else if (randomEffect === 'glow-pulse-star') {
                this.template.createSVGEffect(item.element, 'glow-pulse');
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-pulse 시작 (조합 1/2)`);

                const starTimeoutId = setTimeout(() => {
                    this.template.createSVGEffect(item.element, 'glow-star');
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-star 시작 (조합 2/2)`);
                }, 100);

                this.scheduledTimeouts.push(starTimeoutId);
            } else if (randomEffect === 'glow-double-pulse') {
                this.template.createSVGEffect(item.element, 'glow-pulse');
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-pulse 시작 (이중 1/2)`);

                const secondPulseTimeoutId = setTimeout(() => {
                    this.template.createSVGEffect(item.element, 'glow-pulse', 8);
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-pulse 시작 (이중 2/2)`);
                }, 100);

                this.scheduledTimeouts.push(secondPulseTimeoutId);
            } else if (randomEffect === 'glow-double-pulse-star') {
                this.template.createSVGEffect(item.element, 'glow-pulse');
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-pulse 시작 (조합 1/3)`);

                const secondPulseTimeoutId = setTimeout(() => {
                    this.template.createSVGEffect(item.element, 'glow-pulse', 8);
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-pulse 시작 (조합 2/3)`);
                }, 100);

                const starTimeoutId = setTimeout(() => {
                    this.template.createSVGEffect(item.element, 'glow-star');
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-star 시작 (조합 3/3)`);
                }, 100);

                this.scheduledTimeouts.push(secondPulseTimeoutId);
                this.scheduledTimeouts.push(starTimeoutId);
            } else if (randomEffect === 'glow-pulse-curl-star') {
                this.template.createSVGEffect(item.element, 'glow-pulse');
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-pulse 시작 (조합 1/3)`);

                const curlTimeoutId = setTimeout(() => {
                    this.template.createSVGEffect(item.element, 'glow-curl');
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-curl 시작 (조합 2/3)`);
                }, 100);

                const starTimeoutId = setTimeout(() => {
                    const curlEndTop = item.element.dataset.curlEndTop;
                    const curlEndLeft = item.element.dataset.curlEndLeft;

                    if (curlEndTop && curlEndLeft) {
                        const customOffset = {
                            top: parseFloat(curlEndTop) - 70,
                            left: parseFloat(curlEndLeft) - 30,
                            scale: 1.2
                        };
                        this.template.createSVGEffect(item.element, 'glow-star', 0, customOffset);
                        console.log(`[OverviewSequence] 별표를 돼지꼬리 끝에 배치:`, customOffset);
                    } else {
                        this.template.createSVGEffect(item.element, 'glow-star');
                    }
                    console.log(`[OverviewSequence] 하이라이트 ${index + 1} glow-star 시작 (조합 3/3)`);
                }, 100);

                this.scheduledTimeouts.push(curlTimeoutId);
                this.scheduledTimeouts.push(starTimeoutId);
            } else if (randomEffect === 'glow-star-text' || randomEffect === 'glow-check-text') {
                const iconType = randomEffect === 'glow-star-text' ? 'glow-star' : 'glow-check';
                this.template.createSVGEffect(item.element, iconType);
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} ${iconType} 시작 (텍스트 효과)`);

                this.template.createTextEffect(item.element, iconType);
                console.log(`[OverviewSequence] 하이라이트 ${index + 1} 텍스트 효과 시작`);
            }
        }, 800);

        this.scheduledTimeouts.push(glowTimeoutId);
    }

    updateFocusOverlayPosition(highlightElement, shouldFadeIn = false) {
        const overlay = document.getElementById('focusOverlay');
        if (!overlay) {
            console.error('[OverviewSequence] focusOverlay 요소를 찾을 수 없습니다!');
            return;
        }

        console.log(`[OverviewSequence] updateFocusOverlayPosition 호출 - shouldFadeIn: ${shouldFadeIn}`);

        if (shouldFadeIn) {
            console.log('[OverviewSequence] 첫 번째 하이라이트 - overlay 화면 중앙 고정 및 fade in');

            this.setOverlayBackgroundCenter(overlay);

            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.8s ease-out';

            console.log('[OverviewSequence] Overlay opacity 0 설정, opacity 1로 전환 예약');

            requestAnimationFrame(() => {
                overlay.classList.add('active');
                overlay.style.opacity = '1';
                console.log('[OverviewSequence] Opacity 1로 설정됨');
            });
        }
    }

    setOverlayBackground(highlightElement, overlay) {
        const rect = highlightElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const elementCenterX = rect.left + (rect.width / 2);
        const elementCenterY = rect.top + (rect.height / 2);

        const centerX = (elementCenterX / viewportWidth) * 100;
        const centerY = (elementCenterY / viewportHeight) * 100;

        const padding = 120;
        const focusAreaWidth = rect.width + (padding * 2);
        const focusAreaHeight = rect.height + (padding * 2);

        const ellipseWidth = Math.max(20, (focusAreaWidth / viewportWidth) * 100 * 0.8);
        const ellipseHeight = Math.max(15, (focusAreaHeight / viewportHeight) * 100 * 0.8);

        const gradientWidth = ellipseWidth * 1.3;
        const gradientHeight = ellipseHeight * 1.3;

        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '100';

        overlay.style.clipPath = '';
        overlay.style.background = `radial-gradient(
            ellipse ${gradientWidth}% ${gradientHeight}% at ${centerX}% ${centerY}%,
            transparent 0%,
            transparent 20%,
            rgba(12, 12, 26, 0.3) 35%,
            rgba(12, 12, 26, 0.6) 50%,
            rgba(12, 12, 26, 0.8) 100%
        )`;

        console.log(`[OverviewSequence] Focus overlay 위치 설정: (${centerX.toFixed(1)}%, ${centerY.toFixed(1)}%)`);
        console.log(`[OverviewSequence] Overlay 스타일:`, {
            background: overlay.style.background.substring(0, 50) + '...',
            opacity: overlay.style.opacity,
            zIndex: overlay.style.zIndex,
            display: getComputedStyle(overlay).display
        });
    }

    setOverlayBackgroundCenter(overlay) {
        const centerX = 50;
        const centerY = 50;

        const gradientWidth = 45;
        const gradientHeight = 45;

        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '100';

        overlay.style.clipPath = '';
        overlay.style.background = `radial-gradient(
            ellipse ${gradientWidth}% ${gradientHeight}% at ${centerX}% ${centerY}%,
            transparent 0%,
            transparent 20%,
            rgba(12, 12, 26, 0.3) 35%,
            rgba(12, 12, 26, 0.6) 50%,
            rgba(12, 12, 26, 0.8) 100%
        )`;

        console.log(`[OverviewSequence] Focus overlay 화면 중앙 고정: (${centerX}%, ${centerY}%)`);
    }

    skip() {
        console.log('[OverviewSequence] 시퀀스 스킵');
        this.scheduledTimeouts.forEach(id => clearTimeout(id));
        this.scheduledTimeouts = [];

        this.highlightElements.forEach(h => {
            h.element.classList.remove('glow-pulse', 'glow-star', 'glow-check');
        });

        this.finish();
    }

    next() {
        if (!this.isActive) return false;

        console.log('[OverviewSequence] 수동 다음 하이라이트');

        this.autoPlay = false;
        this.scheduledTimeouts.forEach(id => clearTimeout(id));
        this.scheduledTimeouts = [];

        if (this.currentIndex < this.highlightElements.length - 1) {
            const nextIndex = this.currentIndex + 1;
            const isFirstHighlight = (this.currentIndex === -1 || nextIndex === 0);
            this.jumpToHighlight(nextIndex, isFirstHighlight);
            return true;
        } else {
            this.finish();
            return false;
        }
    }

    finish() {
        console.log('[OverviewSequence] 시퀀스 종료');
        this.isActive = false;

        this.highlightElements.forEach(h => {
            h.element.classList.remove('glow-pulse', 'glow-star', 'glow-check');
        });

        this.hideFocusOverlay();

        this.template.resetCameraToOverview();
    }

    cancel() {
        console.log('[OverviewSequence] 시퀀스 취소');
        this.scheduledTimeouts.forEach(id => clearTimeout(id));
        this.scheduledTimeouts = [];
        this.highlightElements.forEach(h => h.element.classList.remove('glow-pulse'));

        this.hideFocusOverlay();

        this.isActive = false;
    }
}
