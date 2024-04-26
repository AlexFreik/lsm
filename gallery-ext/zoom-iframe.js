function isSpeakerMuted() {
    return (
        document.getElementsByClassName('video-avatar__avatar-footer--view-mute-computer').length >
        0
    );
}

async function beep() {
    const oscillator = window.audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    await sleep(200);
    oscillator.stop();
}

(async () => {
    console.log('Gallery: Hi from Zoom Iframe');
    if (!isGalleryIframe) {
        console.log('Gallery: This iframe is not inside of Gallery, exiting.');
        return;
    }

    const blinkParam = getUrlParam('zoomBlink');
    console.assert(['0', '1'].includes(blinkParam));
    let zoomBlink = blinkParam === '1';

    const beepParam = getUrlParam('zoomBeep');
    console.assert(['0', '1'].includes(beepParam));
    let zoomBeep = beepParam === '1';

    function startBlinking() {
        document.body.classList.add('blinking-border');
    }
    function stopBlinking() {
        document.body.classList.remove('blinking-border');
    }

    let beepingNow = false;
    async function startBeeping() {
        while (beepingNow) {
            await beep();
            await sleep(1000);
        }
    }

    const adjustSettings = () => {
        if (zoomBlink && isSpeakerMuted()) {
            startBlinking();
        } else {
            stopBlinking();
        }

        if (zoomBeep && isSpeakerMuted()) {
            if (!beepingNow) {
                beepingNow = true;
                startBeeping();
            }
        } else {
            beepingNow = false;
        }
    };
    setInterval(adjustSettings, 2000);

    const boxId = getBoxId();
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === m.zoomBlink) {
            zoomBlink = msg.value;
        } else if (msg.type === m.zoomBeep) {
            zoomBeep = msg.value;
        } else if (msg.type === m.muteClick && boxId === msg.boxId) {
            // TODO
        }
    });
})();
