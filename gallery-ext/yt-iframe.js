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

    let autoLive = true;
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === m.setQuality) {
            setQualityYT('min');
        } else if (msg.type === m.autoLive) {
            autoLive = msg.value;
        } else if (msg.type === m.muteClick && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
