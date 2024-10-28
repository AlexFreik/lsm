(async () => {
    console.log('Gallery: Hi from JW Player Iframe');
    if (!isGalleryIframe) {
        console.log('Gallery: This iframe is not inside of Gallery, exiting.');
        return;
    }

    const videoElem = await waitForVideo();
    console.assert(videoElem);
    const audioTools = getAudioTools(videoElem);
    muteClick(audioTools, true);

    // Draw the VU meter
    createAudioLevels();
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, audioTools.analyserL, audioTools.analyserR);

    // Align video to the left
    const wrapper = querySelectorAllShadows('.vch-player')[0];
    console.assert(wrapper);
    wrapper.style = 'margin: 0 -10px;';

    // Unmute
    const muteBtn = querySelectorAllShadows('.svelte-2yyyz0')[1];
    console.assert(muteBtn);
    muteBtn.click();

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
