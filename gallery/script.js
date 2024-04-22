import { getBoxUrlParams, getConfigUrlParams, updateUrlParams } from './tools.js';
import { createBox } from './box.js';

function addBox(name = '', type = '', videoId = '') {
    const gallery = document.getElementById('gallery');
    gallery.insertBefore(createBox(name, type, videoId), gallery.lastElementChild);
}

function initBoxes() {
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addBox('', 'YN', '');
    }
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function initConfig() {
    const urlParams = getConfigUrlParams();
    urlParams.forEach((param) => {
        const input = document.getElementById(param.key);
        console.assert(input);
        if (input.type === 'checkbox') {
            console.assert(['0', '1'].includes(param.value));
            input.checked = param.value === '1';
        } else if (input.type === 'text') {
            input.value = param.value;
        } else {
            console.error('Unknown input type: ' + input.type);
        }
    });
}

function addListenersWhenConfigChanges() {
    Array.from(document.getElementsByClassName('url-param')).forEach((input) =>
        input.addEventListener('change', updateUrlParams),
    );
}

window.addBox = addBox;
initConfig(); // take all config params from URL and apply to config elements
initBoxes(); // create all the video player boxes
addListenersWhenConfigChanges();
