import { getBoxUrlParams, executeAndShow, getConfigUrlParams, updateUrlParams } from './tools.js';
import { createBox, createSwapBtn } from './box.js';

function addBox(name = '', host = '') {
    const boxes = document.getElementById('boxes');
    if (boxes.firstElementChild.classList.contains('box')) {
        boxes.insertBefore(createSwapBtn(name, host), boxes.lastElementChild);
    }
    boxes.insertBefore(createBox(name, host), boxes.lastElementChild);
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

function initBoxes() {
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addBox('', '');
    }
    urlParams.forEach((param) => {
        addBox(param.key, param.value);
    });
}

function executeRawRequest() {
    const request = document.getElementById('rawRequest').value;
    const boxes = getBoxUrlParams();
    boxes.forEach((vmix) => {
        executeAndShow('http://' + vmix.value + ':8088/api/?' + request);
    });
}

(() => {
    initConfig();
    initBoxes();

    document
        .querySelectorAll('.url-param')
        .forEach((input) => input.addEventListener('change', updateUrlParams));

    const addBtn = document.getElementById('add-box');
    addBtn.addEventListener('click', () => addBox());

    const executeBtn = document.getElementById('execute-btn');
    executeBtn.onclick = executeRawRequest;
})();
