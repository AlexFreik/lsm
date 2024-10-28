console.log('Gallery: Hi from utils.js');

// Create Audio Meter
function createAudioLevels() {
    const canvas = document.createElement('canvas');
    canvas.id = 'audio-meter';
    canvas.width = 100;
    canvas.height = 100;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.right = '0';
    canvas.style.width = '20px';
    canvas.style.height = '100vh';
    document.body.appendChild(canvas);
}

function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function getAudioTools(videoElem) {
    const video = audioCtx.createMediaElementSource(videoElem);

    const splitter = audioCtx.createChannelSplitter(2);
    video.connect(splitter);

    const analyserL = audioCtx.createAnalyser();
    analyserL.smoothingTimeConstant = SMOOTHING_TIME;
    analyserL.fftSize = BUFF_SIZE * 2;
    splitter.connect(analyserL, 0);

    const analyserR = audioCtx.createAnalyser();
    analyserR.smoothingTimeConstant = SMOOTHING_TIME;
    analyserR.fftSize = BUFF_SIZE * 2;
    splitter.connect(analyserR, 1);

    const merger = audioCtx.createChannelMerger(2);
    merger.connect(audioCtx.destination);

    return { analyserL: analyserL, analyserR: analyserR, merger: merger };
}

function muteClick(audioTools, mute) {
    if (!mute) {
        audioTools.analyserL.connect(audioTools.merger, 0, 0);
        audioTools.analyserR.connect(audioTools.merger, 0, 1);
    } else {
        audioTools.analyserL.disconnect();
        audioTools.analyserR.disconnect();
    }
}

async function draw(ctx, analyserL, analyserR) {
    const arrayL = new Float32Array(BUFF_SIZE);
    const arrayR = new Float32Array(BUFF_SIZE);
    analyserL.getFloatFrequencyData(arrayL);
    analyserR.getFloatFrequencyData(arrayR);
    ctx.clearRect(0, 0, 100, 100); // Clear the canvas

    let maxL = getMax(arrayL),
        maxR = getMax(arrayR);

    ctx.fillStyle = 'green';
    ctx.fillRect(0, 100 - maxL, 50, maxL);
    ctx.fillRect(50, 100 - maxR, 100, maxR);

    while (!audioLevels) {
        await sleep(2000);
    }

    await sleep(200);
    requestAnimationFrame(() => draw(ctx, analyserL, analyserR));
}

function getBoxId() {
    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('boxId');
    console.assert(boxId);
    return boxId;
}

// ===== YT Auto Quality =====
let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function querySelectorAllShadows(selector, el = document.body) {
    const childShadows = Array.from(el.querySelectorAll('*'))
        .map((el) => el.shadowRoot)
        .filter(Boolean);

    const childResults = childShadows.map((child) => querySelectorAllShadows(selector, child));

    const result = Array.from(el.querySelectorAll(selector));
    return result.concat(childResults).flat();
}

function getVideoElem() {
    return querySelectorAllShadows('video')[0];
}

async function waitForVideo() {
    let videoElem = getVideoElem();
    for (let i = 2; i <= 100 && videoElem === undefined; i++) {
        console.log('waiting for video, attempt #' + i);
        await sleep(300);
        videoElem = getVideoElem();
    }

    if (!videoElem) {
        console.error('Could not find video element...');
        return null;
    } else {
        return videoElem;
    }
}

function getMax(array) {
    let max = -60;
    for (let i = 0; i < array.length; i++) {
        max = Math.max(max, array[i]);
    }
    return ((max + 60) * 5) / 3;
}

(() => {
    const galleryParam = getUrlParam('gallery');
    console.assert([null, '1'].includes(galleryParam));
    window.isGalleryIframe = galleryParam === '1';
    if (!isGalleryIframe) {
        console.log('Gallery: This iframe is not inside of Gallery, exiting.');
        return;
    }

    // ===== Global Variables =====
    window.BUFF_SIZE = 16;
    window.SMOOTHING_TIME = 0.2;
    window.audioCtx = new AudioContext();

    const audioLevlesParam = getUrlParam('audioLevels');
    console.assert(['0', '1'].includes(audioLevlesParam));
    window.audioLevels = audioLevlesParam === '1';

    const noAudioBlinkParam = getUrlParam('noAudioBlink');
    console.assert(['0', '1'].includes(noAudioBlinkParam));
    window.noAudioBlink = noAudioBlinkParam === '1';

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === m.audioLevels) {
            audioLevels = msg.value;
        } else if (msg.type === m.noAudioBlink) {
            noAudioBlink = msg.value;
        }
    });
})();
