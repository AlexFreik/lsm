console.log('Hi from JW Player Iframe');

function querySelectorAllShadows(selector, el = document.body) {
    // recurse on childShadows
    const childShadows = Array.from(el.querySelectorAll('*'))
        .map((el) => el.shadowRoot)
        .filter(Boolean);

    // console.log('[querySelectorAllShadows]', selector, el, `(${childShadows.length} shadowRoots)`);

    const childResults = childShadows.map((child) => querySelectorAllShadows(selector, child));

    // fuse all results into singular, flat array
    const result = Array.from(el.querySelectorAll(selector));
    return result.concat(childResults).flat();
}

function getVideoElem() {
    const videoElem = querySelectorAllShadows('video')[0];
    return videoElem;
}

(async () => {
    let videoElem = getVideoElem();
    for (let i = 2; i <= 100 && videoElem === undefined; i++) {
        console.log('Trying to find video element, attempt #' + i);
        await sleep(1000);
        videoElem = getVideoElem();
    }

    if (!videoElem) {
        console.assert('Could not find video element...');
    }

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
