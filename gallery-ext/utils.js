console.log('Hi from utils.js');

// ===== Global Variables =====
let autoLive = true;
let zoomBlink = true;
let zoomBeep = false;
const BUFF_SIZE = 16;
const SMOOTHING_TIME = 0.2;
window.audioCtx = new AudioContext();

// Create Audio Meter
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

// function initAudioMeter(videoElem) {}

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

function draw(ctx, analyserL, analyserR) {
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

    setTimeout(() => {
        requestAnimationFrame(() => draw(ctx, analyserL, analyserR));
    }, 200);
}

function getBoxId() {
    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('boxId');
    console.assert(boxId);
    return boxId;
}

// ===== YT Auto Quality =====
let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForVideo() {
    let video = document.querySelector('video');
    while (!video) {
        console.log('waiting for video');
        await sleep(200);
        video = document.querySelector('video');
    }
}

/**
 * Sets the quality
 * options are: "max", "min" and the options available in the menu ("720p", "480p", etc.)
 */
async function setQualityYT(quality) {
    await waitForVideo();
    await sleep(1000);

    let settingsButton = document.getElementsByClassName('ytp-settings-button')[0];
    settingsButton.click();
    await sleep(500);

    let qualityMenu = document.getElementsByClassName('ytp-panel-menu')[0].lastChild;
    qualityMenu.click();
    await sleep(500);

    let qualityOptions = [...document.getElementsByClassName('ytp-menuitem')];
    let selection;
    if (quality === 'max') selection = qualityOptions[0];
    if (quality === 'min') selection = qualityOptions[qualityOptions.length - 2];
    else selection = qualityOptions.filter((el) => el.innerText == quality)[0];

    if (!selection) {
        let qualityTexts = qualityOptions.map((el) => el.innerText).join('\n');
        console.log('"' + quality + '" not found. Options are: \n\nmax\nmin\n' + qualityTexts);
        settingsButton.click(); // click menu button to close
        return;
    }

    selection.click();
}

function getMax(array) {
    let max = -60;
    for (let i = 0; i < array.length; i++) {
        max = Math.max(max, array[i]);
    }
    return ((max + 60) * 5) / 3;
}
