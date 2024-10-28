function initBoxes() {
    const boxes = Array.from(document.getElementsByClassName('box'));
    boxes.forEach((box) => addMuteAction(box));
}

function addMuteAction(box) {
    const boxId = box.dataset.boxId;
    console.assert(boxId);
    if (box.classList.contains('marked')) {
        return;
    }
    const muteBtn = box.getElementsByClassName('mute-btn')[0];
    muteBtn.onclick = (e) => {
        const btn = e.target;
        const mute = btn.innerHTML === 'Mute';
        if (mute) {
            btn.innerHTML = 'Unmute';
            box.classList.remove('unmuted');
        } else {
            btn.innerHTML = 'Mute';
            box.classList.add('unmuted');
        }
        chrome.runtime.sendMessage({ type: m.muteClick, value: mute, boxId: boxId });
    };
    box.classList.add('marked');
}

(() => {
    console.log('Hi from Content Script');

    initBoxes();
    const addBoxElem = document.getElementById('add-box');
    addBoxElem.addEventListener('click', initBoxes);

    // Controls should be hidden if extension is not installed
    const controlsElem = document.getElementById('controls');
    console.assert(controlsElem);
    controlsElem.classList.remove('hidden');

    const installedBadge = document.getElementById('installedBadge');
    console.assert(installedBadge);
    installedBadge.classList.remove('badge-error');
    installedBadge.innerHTML = 'Installed';

    const warningElem = document.getElementById('outdated-extension-warning');
    console.assert(warningElem);
    const extVersion = chrome.runtime.getManifest().version;
    document.getElementById('ext-version').innerHTML = extVersion;
    const galVersion = document.getElementById('gal-version').innerHTML;
    if (extVersion !== galVersion) {
        warningElem.classList.remove('hidden');
    }

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
})();
