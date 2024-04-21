(async () => {
    console.log('Hi from YouTube Iframe');

    const videoElem = await waitForVideo();
    console.assert(videoElem);
    createAudioLevels();
    const audioTools = getAudioTools(videoElem);
    muteClick(audioTools, true);

    // Draw the VU meter
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, audioTools.analyserL, audioTools.analyserR);

    const autoLiveParam = getUrlParam('autoLive');
    console.assert(
        ['0', '1'].includes(autoLiveParam),
        'autoLive must be 0 or 1, but it is: ' + autoLiveParam,
    );
    let autoLive = autoLiveParam === '1';

    const adjustSettings = () => {
        // move video lo the left so there is a space for VU meter
        videoElem.style['left'] = '0';

        const liveBtn = document.getElementsByClassName('ytp-live-badge')[0];
        if (autoLive) {
            liveBtn.click();
        }
    };
    setInterval(adjustSettings, 2000);

    const boxId = getBoxId();

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === m.setQuality) {
            setQualityYT('min');
        } else if (msg.type === m.autoLive) {
            console.log('New Auto Live: ' + msg.value);
            autoLive = msg.value;
        } else if (msg.type === m.muteClick && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
