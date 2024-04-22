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
            chrome.runtime.sendMessage({ type: m.muteClick, value: mute, boxId: boxId });
        };
    });

    // controls should be hidden if extension is not installed
    const controlsElem = document.getElementById('controls');
    console.assert(controlsElem);
    controlsElem.classList.remove('hidden');

    const audioLevelsElem = document.getElementById('audioLevels');
    console.assert(audioLevelsElem);
    audioLevelsElem.addEventListener('change', () =>
        chrome.runtime.sendMessage({ type: m.audioLevels, value: audioLevelsElem.checked }),
    );

    const noAudioBlinkElem = document.getElementById('noAudioBlink');
    console.assert(noAudioBlinkElem);
    noAudioBlinkElem.addEventListener('change', () =>
        chrome.runtime.sendMessage({ type: m.noAudioBlink, value: noAudioBlinkElem.checked }),
    );

    const autoLiveElem = document.getElementById('autoLive');
    console.assert(autoLiveElem);
    autoLiveElem.addEventListener('change', () =>
        chrome.runtime.sendMessage({ type: m.autoLive, value: autoLiveElem.checked }),
    );

    const setQualityElem = document.getElementById('setQuality');
    console.assert(setQualityElem);
    setQualityElem.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: m.setQuality });
    });

    const zoomBlinkElem = document.getElementById('zoomBlink');
    console.assert(zoomBlinkElem);
    zoomBlinkElem.addEventListener('change', () =>
        chrome.runtime.sendMessage({ type: m.zoomBlink, value: zoomBlinkElem.checked }),
    );

    const zoomBeepElem = document.getElementById('zoomBeep');
    console.assert(zoomBeepElem);
    zoomBeepElem.addEventListener('change', () =>
        chrome.runtime.sendMessage({ type: m.zoomBeep, value: zoomBeepElem.checked }),
    );
})();
