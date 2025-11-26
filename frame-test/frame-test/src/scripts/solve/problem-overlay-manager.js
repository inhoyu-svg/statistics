// ===== Problem Overlay System =====

export function initializeProblemOverlay(instance) {
    const problemOverlay = document.getElementById('problemOverlay');
    if (!problemOverlay) return;

    problemOverlay.style.position = 'fixed';
    problemOverlay.style.top = '20px';
    problemOverlay.style.left = '50%';
    problemOverlay.style.transform = 'translateX(-50%)';
    problemOverlay.style.zIndex = '1000';
    problemOverlay.style.cursor = 'pointer';

    initializeDragAndDrop(instance, problemOverlay);
    initializeTouchToggle(instance, problemOverlay);

    console.log('문제 오버레이 초기화 완료');
}

export function updateProblemOverlayVisibility(frameIndex) {
    const problemOverlay = document.getElementById('problemOverlay');
    if (!problemOverlay) return;

    problemOverlay.style.display = 'block';

    const allProblemContents = problemOverlay.querySelectorAll('.problem-overlay-content');
    allProblemContents.forEach(content => {
        content.style.display = 'none';
    });

    const currentProblemContent = problemOverlay.querySelector(`[data-frame="${frameIndex}"]`);
    if (currentProblemContent) {
        currentProblemContent.style.display = 'block';
    }

    console.log(`문제 오버레이 프레임 ${frameIndex + 1} 활성화`);
}

export function updateProblemOverlaySize(size) {
    const problemOverlay = document.getElementById('problemOverlay');
    if (!problemOverlay) return;

    problemOverlay.classList.remove('size-large', 'size-small');

    const isMinimized = problemOverlay.classList.contains('minimized');

    if (size === 'small') {
        problemOverlay.classList.add('size-small');
    } else {
        problemOverlay.classList.add('size-large');
    }

    if (isMinimized) {
        enforceMinimizedFontSize();
    }

    console.log(`문제 오버레이 크기 변경: ${size}, 최소화: ${isMinimized}`);
}

export function updateProblemOverlayPosition(instance, cut) {
    if (instance.hasUserDragged) {
        return;
    }

    const problemOverlay = document.getElementById('problemOverlay');
    if (!problemOverlay) return;

    if (cut.isProblemFocus || cut.cutIndex === 1) {
        problemOverlay.style.top = '50%';
        problemOverlay.style.left = '50%';
        problemOverlay.style.transform = 'translate(-50%, -50%)';
    } else {
        problemOverlay.style.top = '20px';
        problemOverlay.style.left = '50%';
        problemOverlay.style.transform = 'translateX(-50%)';
    }

    problemOverlay.style.transition = 'all 1000ms cubic-bezier(0.9, 0, 0.6, 1)';
}

export function toggleProblemOverlay() {
    const problemOverlay = document.getElementById('problemOverlay');
    if (!problemOverlay) return;

    const isMinimized = problemOverlay.classList.contains('minimized');

    problemOverlay.classList.add('animating');

    if (isMinimized) {
        problemOverlay.classList.remove('minimized');

        const mathElements = problemOverlay.querySelectorAll('.math');
        mathElements.forEach(element => {
            element.style.fontSize = '';
        });

        requestAnimationFrame(() => {
            problemOverlay.style.width = '';
            problemOverlay.style.height = '';
        });

        setTimeout(() => {
            problemOverlay.classList.remove('animating');
        }, 600);
    } else {
        problemOverlay.classList.add('minimized');

        requestAnimationFrame(() => {
            problemOverlay.style.width = '300px';
            problemOverlay.style.height = '200px';
        });

        setTimeout(() => {
            enforceMinimizedFontSize();
            problemOverlay.classList.remove('animating');
        }, 600);
    }

    console.log(`문제 오버레이 ${isMinimized ? '최대화' : '최소화'}`);
}

function enforceMinimizedFontSize() {
    const problemOverlay = document.getElementById('problemOverlay');
    if (!problemOverlay || !problemOverlay.classList.contains('minimized')) return;

    const mathElements = problemOverlay.querySelectorAll('.math');
    mathElements.forEach(element => {
        element.style.fontSize = 'clamp(0.5rem, 1.5vw + 0.3rem, 0.7rem)';
    });
}

function initializeDragAndDrop(instance, element) {
    let isDragging = false;
    let hasDragged = false;
    let startX, startY, startLeft, startTop;
    let cachedElementWidth, cachedElementHeight;
    let animationId = null;

    const updatePosition = (clientX, clientY) => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        animationId = requestAnimationFrame(() => {
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;

            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                hasDragged = true;
                instance.hasUserDragged = true;
            }

            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;

            const maxLeft = window.innerWidth - cachedElementWidth;
            const maxTop = window.innerHeight - cachedElementHeight;

            const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
            const clampedTop = Math.max(0, Math.min(newTop, maxTop));

            element.style.transform = `translate(${clampedLeft - startLeft}px, ${clampedTop - startTop}px)`;
        });
    };

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasDragged = false;

        const rect = element.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        cachedElementWidth = rect.width;
        cachedElementHeight = rect.height;

        element.style.cursor = 'grabbing';
        element.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updatePosition(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'pointer';
            element.style.transition = '';

            const rect = element.getBoundingClientRect();
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.style.transform = 'none';

            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    });

    element.addEventListener('touchstart', (e) => {
        isDragging = true;
        hasDragged = false;

        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        startX = touch.clientX;
        startY = touch.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        cachedElementWidth = rect.width;
        cachedElementHeight = rect.height;

        element.style.transition = 'none';
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            element.style.transition = '';

            const rect = element.getBoundingClientRect();
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.style.transform = 'none';

            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    });

    instance.dragState = {
        hasDragged: () => hasDragged,
        setHasDragged: (value) => hasDragged = value
    };
}

function initializeTouchToggle(instance, element) {
    element.addEventListener('click', (e) => {
        if (instance.dragState.hasDragged()) {
            instance.dragState.setHasDragged(false);
            return;
        }

        toggleProblemOverlay();
    });

    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    element.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });

    element.addEventListener('touchend', (e) => {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;

        if (instance.dragState.hasDragged()) {
            instance.dragState.setHasDragged(false);
            return;
        }

        if (touchDuration < 300) {
            e.preventDefault();
            toggleProblemOverlay();
        }
    }, { passive: false });
}
