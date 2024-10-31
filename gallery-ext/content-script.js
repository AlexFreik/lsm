function initBoxes() {
    const boxes = Array.from(document.getElementsByClassName('box'));
    boxes.forEach((box) => addMuteAction(box));
}

function addMuteAction(box) {
    const boxId = box.getAttribute('data-id');
    console.assert(boxId);
    const muteBtn = box.querySelector('.mute-btn');
    muteBtn.onclick = (e) => {
        const mute = box.classList.contains('unmuted');
        if (mute) {
            box.classList.remove('unmuted');
        } else {
            box.classList.add('unmuted');
        }
        chrome.runtime.sendMessage({ type: m.muteClick, value: mute, boxId: boxId });
    };
}

(() => {
    console.log('Hi from Content Script');

    initBoxes();
    document.getElementById('update-rows').addEventListener('click', initBoxes);

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
