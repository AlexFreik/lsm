(() => {
    console.log('Hi from Content Script');

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
})();

const getTime = (t) => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substr(11, 0);
};
