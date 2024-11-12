console.log('Gallery: Hi from utils.js');

// ===== General Purpose =====
function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function isGalleryIframe() {
    return getBoxId() !== null;
}

// ===== Audio Meter =====
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

function getAudioTools(audioInput) {
    const audioCtx = new AudioContext();
    const audio = isElement(audioInput)
        ? audioCtx.createMediaElementSource(audioInput)
        : audioCtx.createMediaStreamSource(audioInput);

    const splitter = audioCtx.createChannelSplitter(2);
    audio.connect(splitter);

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
    const timeDataL = new Float32Array(analyserL.fftSize);
    const timeDataR = new Float32Array(analyserR.fftSize);

    analyserL.getFloatTimeDomainData(timeDataL);
    analyserR.getFloatTimeDomainData(timeDataR);

    // Clear the canvas
    ctx.clearRect(0, 0, 100, 100);

    // Calculate RMS dB levels for both channels
    const dBLevelL = calculateRMSdB(timeDataL);
    const dBLevelR = calculateRMSdB(timeDataR);

    // Draw segmented dB meter for each channel
    drawDbMeter(ctx, 0, dBLevelL); // Left channel
    drawDbMeter(ctx, 50, dBLevelR); // Right channel

    await sleep(100); // Delay for smoother updates (if desired)
    requestAnimationFrame(() => draw(ctx, analyserL, analyserR));
}

// Draw the segmented dB meter with peak indicator
function drawDbMeter(ctx, xOffset, dB) {
    const canvasHeight = 100;

    // Define dB ranges and colors
    const dbRanges = [
        { min: -60, max: -36, frac: 0.35, color: '#008000' },
        { min: -36, max: -18, frac: 0.25, color: '#00c000' },
        { min: -18, max: -6, frac: 0.25, color: '#00ff00' },
        { min: -6, max: -1, frac: 0.12, color: '#ffff00' },
        { min: -1, max: 0, frac: 0.03, color: '#ff0000' },
    ];

    let accumulatedHeight = 0; // Track filled height

    dbRanges.forEach((range) => {
        if (dB >= range.min) {
            const rangeHeight = range.frac * canvasHeight;

            // Calculate the portion of this range to be filled
            const filledFraction = Math.min(dB, range.max) - range.min;
            const filledHeight = (filledFraction / (range.max - range.min)) * rangeHeight;

            // Draw the segment for this range
            ctx.fillStyle = range.color;
            ctx.fillRect(
                xOffset,
                canvasHeight - accumulatedHeight - filledHeight,
                50,
                filledHeight,
            );
            accumulatedHeight += rangeHeight;
        }
    });
}

// Helper to calculate RMS and convert to dB
function calculateRMSdB(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] ** 2;
    }
    const rms = Math.sqrt(sum / dataArray.length) * 2.3; // Apply gain
    const dB = 20 * Math.log10(rms + 1e-10); // Avoid log(0) error
    return dB;
}

function getBoxId() {
    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('boxId');
    return boxId;
}

// ===== YT Auto Quality =====
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

// ===== Global Vaues & Message Listeners =====
(() => {
    if (!isGalleryIframe()) {
        console.log('Gallery: This iframe is not inside of Gallery, exiting.');
        return;
    }

    // ===== Global Variables =====
    window.BUFF_SIZE = 64;
    window.SMOOTHING_TIME = 0.8;

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
