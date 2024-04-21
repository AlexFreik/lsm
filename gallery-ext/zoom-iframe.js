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
    console.log('Hi from Zoom Iframe');

    let zoomBlink = true;
    let zoomBeep = false;

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

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'ZOOM_BLINK') {
            zoomBlink = msg.value;
        } else if (msg.type === 'ZOOM_BEEP') {
            zoomBeep = msg.value;
        }
    });
})();
