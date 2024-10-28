import { getVideoName, getVideoId, getType } from './box-controls.js';

function getBoxUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '' || key.startsWith('__')) return;
        params.push({ key: key, value: value });
    });
    return params;
}

function getConfigUrlParams() {
    const url = window.location.href;
    const searchParams = new URLSearchParams(new URL(url).search);
    const params = [];
    searchParams.forEach(function (value, key) {
        if (key === '' || !key.startsWith('__')) return;
        params.push({ key: key.substring(2), value: value });
    });
    return params;
}

function parseDocumentConfig() {
    const params = new URLSearchParams();

    document.querySelectorAll('.url-param').forEach((input) => {
        if (input.type === 'checkbox') {
            params.append('__' + input.id, input.checked ? '1' : '0');
        } else if (input.type === 'text') {
            params.append('__' + input.id, input.value);
        } else {
            conole.error('unexpected type: ' + input.type);
        }
    });
    return params;
}

function updateUrlParams() {
    const boxParams = new URLSearchParams();
    document.querySelectorAll('.box').forEach((box) => {
        const key = getVideoName(box);
        const val = getType(box) + getVideoId(box);
        if (key === '') return;
        boxParams.append(key, val);
    });
    const configParams = parseDocumentConfig();
    window.history.pushState({}, '', `?${boxParams.toString()}&${configParams.toString()}`);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateUUID() {
    return (Math.random() + 1).toString(36).substring(2);
}

async function captureWindow(videoId) {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: 'window', // Capture only a specific window
            },
        });

        const video = document.getElementById(videoId);
        const canvas = document.getElementById('canvas-' + videoId);
        const msg = document.getElementById('msg-' + videoId);
        console.log(msg);
        video.srcObject = stream;
        msg.classList.add('hidden');
        video.play();

        stream.getVideoTracks()[0].addEventListener('ended', () => {
            msg.classList.remove('hidden');
        });
    } catch (error) {
        console.error('Error capturing window:', error);
    }
}

export {
    getBoxUrlParams,
    getConfigUrlParams,
    parseDocumentConfig,
    updateUrlParams,
    capitalizeFirst,
    generateUUID,
    captureWindow,
};
