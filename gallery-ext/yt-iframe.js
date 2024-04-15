console.log('Hi from YouTube Iframe');

function getVideoElem() {
    const videoElem = document.getElementsByClassName('video-stream')[0];
    console.assert(videoElem != undefined);
    return videoElem;
}

(async () => {
    const videoElem = getVideoElem();
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
