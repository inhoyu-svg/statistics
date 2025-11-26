/**
 * Visualization Renderer Module
 * Handles rendering of various visualization types (images, videos, charts, MathJax)
 */

/**
 * Renders a visualization element based on its data-viz-type attribute
 * @param {HTMLElement} vizElement - The visualization element to render
 */


import { MathVisualization } from '../../math-visualization.js';


export function renderVisualization(vizElement) {
    const vizType = vizElement.getAttribute('data-viz-type');
    const vizConfig = vizElement.getAttribute('data-viz-config');

    if (!vizType || !vizConfig) {
        console.warn('시각화 타입 또는 설정이 없습니다:', vizElement.id);
        return;
    }

    switch (vizType) {
        case 'image':
            renderImage(vizElement, vizConfig);
            break;
        case 'video':
            renderVideo(vizElement, vizConfig);
            break;
        case 'chart':
            renderChart(vizElement, vizConfig);
            break;
        default:
            console.warn('지원하지 않는 시각화 타입:', vizType);
    }
}

/**
 * Renders an image in the visualization element
 * @param {HTMLElement} vizElement - The element to render the image in
 * @param {string} url - The image URL (supports Google Drive URLs)
 */
export function renderImage(vizElement, url) {
    // Google Drive URL 변환
    let imageUrl = url;
    if (url.includes('drive.google.com')) {
        const fileIdMatch = url.match(/[?&]id=([^&]+)/);
        if (fileIdMatch) {
            imageUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
        }
    }

    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'Visualization Image';
    imgElement.style.width = '100%';
    imgElement.style.height = 'auto';
    imgElement.style.display = 'block';

    imgElement.addEventListener('error', (e) => {
        console.error(`[Visualization] 이미지 로드 실패: ${vizElement.id}`, e);
        vizElement.innerHTML = '<p style="color: red; padding: 20px;">이미지를 불러올 수 없습니다.</p>';
    });

    vizElement.innerHTML = '';
    vizElement.appendChild(imgElement);
}

/**
 * Renders a video in the visualization element
 * @param {HTMLElement} vizElement - The element to render the video in
 * @param {string} url - The video URL
 */
export function renderVideo(vizElement, url) {
    const videoElement = document.createElement('video');
    videoElement.src = url;
    videoElement.controls = true;
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';
    videoElement.style.display = 'block';

    vizElement.innerHTML = '';
    vizElement.appendChild(videoElement);
}

/**
 * Renders a chart in the visualization element
 * @param {HTMLElement} vizElement - The element to render the chart in
 * @param {string} config - JSON configuration string for the chart
 */
export function renderChart(vizElement, config) {
    try {
        const chartConfig = JSON.parse(config);
    } catch (e) {
        console.error(`[Visualization] 차트 설정 파싱 실패: ${vizElement.id}`, e);
        vizElement.innerHTML = '<p style="color: red; padding: 20px;">차트를 불러올 수 없습니다.</p>';
    }
}

/**
 * Renders MathJax in the specified element
 * @param {HTMLElement|Document} element - The element or document to render MathJax in
 */
export function renderMathJax(element = document) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([element]).then(() => {
            console.log('MathJax 렌더링 완료');
        }).catch((err) => {
            console.error('MathJax 렌더링 오류:', err);
        });
    }
}

/**
 * Renders all visualizations from a list of reveal elements
 * Delegates to MathVisualization module if available
 * @param {Array} revealElements - Array of element IDs to check for visualizations
 */
export function renderVisualizations(revealElements) {
    // MathVisualization 모듈로 위임
    if (typeof MathVisualization !== 'undefined') {
        MathVisualization.renderAll(revealElements);
    } else {
        console.error('MathVisualization 모듈이 로드되지 않았습니다');
    }
}
