console.log('Hi from YouTube Iframe');

function getVideoElem() {
    const videoElem = document.getElementsByClassName('video-stream')[0];
    console.assert(videoElem != undefined);
    return videoElem;
}

function getAudioTools() {
    const video = audioCtx.createMediaElementSource(getVideoElem());

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

(async () => {
    const audioTools = getAudioTools();
    muteClick(audioTools, true);

    // Draw the VU meter
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, audioTools.analyserL, audioTools.analyserR);

    const videoElem = getVideoElem();

    const adjustSettings = () => {
        // move video lo the left so there is a space for VU meter
        videoElem.style['left'] = '0';

        // Do not hide LIVE button
        const liveDiv = document.getElementsByClassName('ytp-time-display')[0];
        liveDiv.style['display'] = '';

        const liveBtn = document.getElementsByClassName('ytp-live-badge')[0];
        if (autoLive) {
            liveBtn.click();
        }
    };
    setInterval(adjustSettings, 2000);

    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('boxId');
    console.assert(boxId);

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'SET_QUALITY') {
            setQualityYT('min');
        } else if (msg.type === 'AUTO_LIVE') {
            autoLive = msg.value;
        } else if (msg.type === 'MUTE_CLICK' && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
