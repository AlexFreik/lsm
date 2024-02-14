console.log('Hi from utils.js');

let sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForVideo() {
    let video = document.querySelector('video');
    while (!video) {
        console.log('waiting for video');
        await sleep(200);
        video = document.querySelector('video');
    }
}

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

function getMax(array) {
    let max = -60;
    for (let i = 0; i < array.length; i++) {
        max = Math.max(max, array[i]);
    }
    return ((max + 60) * 5) / 3;
}
