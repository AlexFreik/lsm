(() => {
    console.log('Hi from Content Script');

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === 'NEW') {
        }
    });

    const controlsElem = document.getElementById('controls');
    console.assert(controlsElem);
    controlsElem.classList.remove('hidden');

    const autoLiveElem = document.getElementById('auto-live');
    console.assert(autoLiveElem);
    let autoLive = true;
    autoLiveElem.addEventListener('change', () => {
        autoLive = !autoLive;
        console.log(autoLive);
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

// ===== Communications with iframes  =====

function selectLowestQuality() {
    // TODO
}
