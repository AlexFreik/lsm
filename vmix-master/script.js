import { getBoxUrlParams } from './tools.js';
import { createBox, createSwapBtn } from './box.js';

function addBox(name = '', host = '') {
    const boxes = document.getElementById('boxes');
    if (boxes.firstElementChild.classList.contains('box')) {
        boxes.insertBefore(createSwapBtn(name, host), boxes.lastElementChild);
    }
    boxes.insertBefore(createBox(name, host), boxes.lastElementChild);
}

function initBoxes() {
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addBox('', '');
    }
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

(() => {
    initBoxes();
    const addBtn = document.getElementById('add-box');
    addBtn.addEventListener('click', () => addBox());
})();
