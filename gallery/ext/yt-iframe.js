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
 * options are: "Highest" and the options available in the menu ("720p", "480p", etc.)
 */
async function setQuality(quality) {
    await waitForVideo();
    await sleep(1000);

    let settingsButton = document.getElementsByClassName('ytp-settings-button')[0];
    settingsButton.click();
    await sleep(500);

    let qualityMenu = document.getElementsByClassName('ytp-panel-menu')[0].lastChild;
    qualityMenu.click();
    await sleep(500);

    let qualityOptions = [...document.getElementsByClassName('ytp-quality-menu')];
    let selection;
    if (quality == 'Highest') selection = qualityOptions[0];
    else selection = qualityOptions.filter((el) => el.innerText == quality)[0];

    if (!selection) {
        let qualityTexts = qualityOptions.map((el) => el.innerText).join('\n');
        console.log('"' + quality + '" not found. Options are: \n\nHighest\n' + qualityTexts);
        settingsButton.click(); // click menu button to close
        return;
    }

    if (selection.attributes['aria-checked'] === undefined) {
        // not checked
        selection.click();
    } else settingsButton.click(); // click menu button to close
}

function getMax(array) {
    let max = -60;
    for (let i = 0; i < array.length; i++) {
        max = Math.max(max, array[i]);
    }
    return ((max + 60) * 5) / 3;
}

(async () => {
    console.log('Hi from YT Iframe');

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

    window.audioCtx = new AudioContext();
    const videoElem = document.getElementsByClassName('video-stream')[0];
    console.assert(videoElem != undefined);

    const video = audioCtx.createMediaElementSource(videoElem);

    const splitter = audioCtx.createChannelSplitter(2);
    video.connect(splitter);

    const buffSize = 16;

    const analyserL = audioCtx.createAnalyser();
    analyserL.smoothingTimeConstant = 0.2;
    analyserL.fftSize = buffSize * 2;
    splitter.connect(analyserL, 0);

    const analyserR = audioCtx.createAnalyser();
    analyserR.smoothingTimeConstant = 0.2;
    analyserR.fftSize = buffSize * 2;
    splitter.connect(analyserR, 1);

    const merger = audioCtx.createChannelMerger(2);

    const clickMonitorBtn = () => {
        const monitorBtn = document.getElementsByClassName('monitor-btn')[0];
        const iconImg = monitorBtn.firstChild;
        if (monitorBtn.classList.contains('off')) {
            analyserL.connect(merger, 0, 0);
            analyserR.connect(merger, 0, 1);
            merger.connect(audioCtx.destination);
            monitorBtn.title = 'Mute monitor';
            iconImg.src = chrome.runtime.getURL('assets/headset.png');
        } else {
            analyserL.disconnect();
            analyserR.disconnect();
            merger.disconnect();
            monitorBtn.title = 'Unmute monitor';
            iconImg.src = chrome.runtime.getURL('assets/headset-cross.png');
        }
        monitorBtn.classList.toggle('off');
    };

    (async () => {
        const iconImg = document.createElement('img');
        iconImg.alt = 'Headset Image';

        const monitorBtn = document.createElement('button');
        monitorBtn.className = 'ytp-button monitor-btn';

        volumeArea = document.getElementsByClassName('ytp-volume-area')[0];
        volumeArea.insertBefore(monitorBtn, volumeArea.firstChild);
        monitorBtn.appendChild(iconImg);

        monitorBtn.addEventListener('click', clickMonitorBtn);
        clickMonitorBtn();
    })();

    window.ctx = document.getElementById('audio-meter').getContext('2d');

    function draw() {
        const arrayL = new Float32Array(buffSize);
        const arrayR = new Float32Array(buffSize);
        analyserL.getFloatFrequencyData(arrayL);
        analyserR.getFloatFrequencyData(arrayR);
        ctx.clearRect(0, 0, 100, 100); // Clear the canvas

        let maxL = getMax(arrayL),
            maxR = getMax(arrayR);

        ctx.fillStyle = 'green';
        ctx.fillRect(0, 100 - maxL, 50, maxL);
        ctx.fillRect(50, 100 - maxR, 100, maxR);

        setTimeout(() => {
            requestAnimationFrame(draw);
        }, 200);
    }
    draw();

    const adjustSettings = () => {
        videoElem.style['left'] = '0';
    };

    setInterval(adjustSettings, 5000);
})();
