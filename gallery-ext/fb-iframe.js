console.log('Hi from Facebook Iframe');

function getVideoElem() {
    const videoElem = document.getElementsByTagName('video')[0];
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

    const boxId = getBoxId();

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'SET_QUALITY') {
            // TODO
        } else if (msg.type === 'MUTE_CLICK' && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
