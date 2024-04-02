(async () => {
    console.log('Hi from YouTube Iframe');

    const videoElem = document.getElementsByClassName('video-stream')[0];
    console.assert(videoElem != undefined);

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

    // Add monitor button so we can mute / unmute the audio
    // When I mute using regular YT button the VU meter stops receiving the audio
    const clickMonitorBtn = () => {
        const monitorBtn = document.getElementsByClassName('monitor-btn')[0];
        const iconImg = monitorBtn.firstChild;
        if (monitorBtn.classList.contains('off')) {
            analyserL.connect(merger, 0, 0);
            analyserR.connect(merger, 0, 1);
            iconImg.src = chrome.runtime.getURL('assets/headset.png');
        } else {
            analyserL.disconnect();
            analyserR.disconnect();
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

    // Draw the VU meter
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, analyserL, analyserR);

    const adjustSettings = () => {
        // move video lo the left so there is a space for VU meter
        videoElem.style['left'] = '0';

        // remove YouTube button
        const ytBtn = document.getElementsByClassName('ytp-youtube-button')[0];
        ytBtn?.parentNode.removeChild(ytBtn);

        // Do not hide LIVE button
        const liveDiv = document.getElementsByClassName('ytp-time-display')[0];
        liveDiv.style['display'] = '';

        const liveBtn = document.getElementsByClassName('ytp-live-badge')[0];
        if (autoLive) {
            liveBtn.click();
        }
    };
    setInterval(adjustSettings, 5000);
})();

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SET_QUALITY') {
        setQualityYT('min');
    } else if (msg.type === 'AUTO_LIVE') {
        autoLive = msg.value;
    }
});
