/**
 * Sets the quality
 * options are: "max", "min" and the options available in the menu ("720p", "480p", etc.)
 */
async function setQualityYT(quality) {
    await waitForVideo();
    await sleep(1000);

    let settingsButton = document.getElementsByClassName('ytp-settings-button')[0];
    settingsButton.click();
    await sleep(500);

    let qualityMenu = document.getElementsByClassName('ytp-panel-menu')[0].lastChild;
    qualityMenu.click();
    await sleep(500);

    let qualityOptions = [...document.getElementsByClassName('ytp-menuitem')];
    let selection;
    if (quality === 'max') selection = qualityOptions[0];
    if (quality === 'min') selection = qualityOptions[qualityOptions.length - 2];
    else selection = qualityOptions.filter((el) => el.innerText == quality)[0];

    if (!selection) {
        let qualityTexts = qualityOptions.map((el) => el.innerText).join('\n');
        console.log('"' + quality + '" not found. Options are: \n\nmax\nmin\n' + qualityTexts);
        settingsButton.click(); // click menu button to close
        return;
    }

    selection.click();
}

(async () => {
    console.log('Hi from YouTube Iframe');

    const videoElem = await waitForVideo();
    console.assert(videoElem);
    const audioTools = getAudioTools(videoElem);
    muteClick(audioTools, true);

    // Draw the VU meter
    createAudioLevels();
    window.ctx = document.getElementById('audio-meter').getContext('2d');
    draw(ctx, audioTools.analyserL, audioTools.analyserR);

    const autoLiveParam = getUrlParam('autoLive');
    console.assert(
        ['0', '1'].includes(autoLiveParam),
        'autoLive must be 0 or 1, but it is: ' + autoLiveParam,
    );
    let autoLive = autoLiveParam === '1';

    const adjustSettings = () => {
        // move video lo the left so there is a space for VU meter
        videoElem.style['left'] = '0';

        const liveBtn = document.getElementsByClassName('ytp-live-badge')[0];
        if (autoLive) {
            liveBtn.click();
        }
    };
    setInterval(adjustSettings, 2000);

    const boxId = getBoxId();

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === m.setQuality) {
            setQualityYT('min');
        } else if (msg.type === m.autoLive) {
            console.log('New Auto Live: ' + msg.value);
            autoLive = msg.value;
        } else if (msg.type === m.muteClick && boxId === msg.boxId) {
            muteClick(audioTools, msg.value);
        }
    });
})();
