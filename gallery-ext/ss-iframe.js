(async () => {
    console.log('Gallery: Hi from Screen Share Iframe');
    if (!isGalleryIframe()) {
        return console.log('Gallery: This iframe is not inside of Gallery, exiting.');
    }

    const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: 'default' } },
    });

    const audioTools = getAudioTools(audioStream);
    muteClick(audioTools, true);

    // Draw the VU meter
    createAudioLevels();
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, audioTools.analyserL, audioTools.analyserR);

    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('boxId');
    console.assert(boxId);

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === m.setQuality) {
            // TODO
        } else if (msg.type === m.muteClick && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
