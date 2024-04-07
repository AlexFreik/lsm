import { getUrlParameters } from './tools.js';
import { createBox } from './box.js';

function addBox(name = '', type = '', videoId = '') {
    const gallery = document.getElementById('gallery');
    gallery.insertBefore(createBox(name, type, videoId), gallery.lastElementChild);
}

function initBoxes() {
    const urlParams = getUrlParameters();
    if (urlParams.length === 0) {
        addBox('', 'YN', '');
    }
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

window.addBox = addBox;
initBoxes();
