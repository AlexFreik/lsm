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

function monitorButtonClick(audioTools) {
    const btn = document.getElementsByClassName('monitor-btn')[0];
    const iconImg = btn.firstChild;
    if (btn.classList.contains('off')) {
        audioTools.analyserL.connect(merger, 0, 0);
        audioTools.analyserR.connect(merger, 0, 1);
        iconImg.src = chrome.runtime.getURL('assets/headset.png');
    } else {
        audioTools.analyserL.disconnect();
        audioTools.analyserR.disconnect();
        iconImg.src = chrome.runtime.getURL('assets/headset-cross.png');
    }
    btn.classList.toggle('off');
}

function createMonitorButton(audioTools) {
    const iconImg = document.createElement('img');
    iconImg.alt = 'Headset Image';

    const monitorBtn = document.createElement('button');

    volumeArea = document.getElementsByClassName('ytp-volume-area')[0];

    monitorBtn.appendChild(iconImg);

    // Add monitor button so we can mute / unmute the audio
    // When I mute using regular YT button the VU meter stops receiving the audio
    monitorBtn.className = 'ytp-button monitor-btn';
    volumeArea.insertBefore(monitorBtn, volumeArea.firstChild);

    const clickMonitorBtn = () => monitorButtonClick(audioTools);
    monitorBtn.addEventListener('click', clickMonitorBtn);
    clickMonitorBtn();
}

(async () => {
    const audioTools = getAudioTools();

    createMonitorButton(audioTools);

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
})();

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SET_QUALITY') {
        setQualityYT('min');
    } else if (msg.type === 'AUTO_LIVE') {
        autoLive = msg.value;
    }
});
