(async () => {
    console.log('Hi from JW Player Iframe');

    const videoElem = await waitForVideo();
    console.assert(videoElem);
    createAudioLevels();

    // Align video to the left
    const wrapper = querySelectorAllShadows('.vch-player')[0];
    console.assert(wrapper);
    wrapper.style = 'margin: 0 -10px;';

    // Unmute
    const muteBtn = querySelectorAllShadows('.svelte-2yyyz0')[1];
    console.assert(muteBtn);
    muteBtn.click();

    const audioTools = getAudioTools(videoElem);
    muteClick(audioTools, true);

    // Draw the VU meter
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, audioTools.analyserL, audioTools.analyserR);

    const urlParams = new URLSearchParams(window.location.search);
    const boxId = urlParams.get('boxId');
    console.assert(boxId);

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'SET_QUALITY') {
            // TODO
        } else if (msg.type === 'MUTE_CLICK' && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
