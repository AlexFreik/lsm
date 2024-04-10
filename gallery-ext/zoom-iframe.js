function isSpeakerMuted() {
    return (
        document.getElementsByClassName('video-avatar__avatar-footer--view-mute-computer').length >
        0
    );
}

function beep() {
    const oscillator = window.audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    // Beep for 500 milliseconds
    setTimeout(function () {
        oscillator.stop();
    }, 500);
}

(async () => {
    console.log('Hi from Zoom Iframe');

    function startBlinking() {
        document.body.classList.add('blinking-border');
    }
    function stopBlinking() {
        document.body.classList.remove('blinking-border');
    }

    let continueToBeep = true;
    function startBeeping() {
        beep();
        if (continueToBeep) {
            setTimeout(startBeeping, 1000);
        }
    }

    const adjustSettings = () => {
        if (zoomBlink && isSpeakerMuted()) {
            startBlinking();
        } else {
            stopBlinking();
        }

        if (zoomBeep && isSpeakerMuted()) {
            continueToBeep = true;
            startBeeping();
        } else {
            continueToBeep = false;
        }
    };
    setInterval(adjustSettings, 2000);
})();

chrome.runtime.onMessage.addListener((msg) => {
    console.log(msg, zoomBlink, zoomBeep);
    if (msg.type === 'ZOOM_BLINK') {
        zoomBlink = msg.value;
        console.log(zoomBlink, zoomBeep);
    } else if (msg.type === 'ZOOM_BEEP') {
        zoomBeep = msg.value;
        console.log(zoomBlink, zoomBeep);
    }
});
