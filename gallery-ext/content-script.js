(() => {
    console.log('Hi from Content Script');

    const boxes = Array.from(document.getElementsByClassName('box'));
    boxes.forEach((box) => {
        const boxId = box.dataset.boxId;
        console.assert(boxId);
        const muteBtn = box.getElementsByClassName('mute-btn')[0];
        muteBtn.onclick = (e) => {
            const btn = e.target;
            let mute = true;
            if (btn.innerHTML === 'Mute') {
                btn.innerHTML = 'Unmute';
            } else {
                mute = false;
                btn.innerHTML = 'Mute';
            }
            chrome.runtime.sendMessage({ type: 'MUTE_CLICK', value: mute, boxId: boxId });
        };
    });

    // controls should be hidden if extension is not installed
    const controlsElem = document.getElementById('controls');
    console.assert(controlsElem);
    controlsElem.classList.remove('hidden');

    const autoLiveElem = document.getElementById('auto-live');
    console.assert(autoLiveElem);
    let autoLive = true;
    autoLiveElem.addEventListener('change', () => {
        autoLive = !autoLive;
        chrome.runtime.sendMessage({ type: 'AUTO_LIVE', value: autoLive });
    });

    const setQualityElem = document.getElementById('set-quality');
    console.assert(setQualityElem);
    setQualityElem.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'SET_QUALITY' });
    });

    const zoomBlinkElem = document.getElementById('zoom-blink');
    console.assert(zoomBlinkElem);
    let zoomBlink = true;
    zoomBlinkElem.addEventListener('change', () => {
        zoomBlink = !zoomBlink;
        chrome.runtime.sendMessage({ type: 'ZOOM_BLINK', value: zoomBlink });
    });

    const zoomBeepElem = document.getElementById('zoom-beep');
    console.assert(zoomBeepElem);
    let zoomBeep = false;
    zoomBeepElem.addEventListener('change', () => {
        zoomBeep = !zoomBeep;
        chrome.runtime.sendMessage({ type: 'ZOOM_BEEP', value: zoomBeep });
    });
})();
