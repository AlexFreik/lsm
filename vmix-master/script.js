import {
    getBoxes,
    getBoxHost,
    getApiUrl,
    getBoxUrlParams,
    execute,
    getConfigUrlParams,
    updateUrlParams,
    setInputValue,
} from './tools.js';
import { createBox, createSwapBtn, getBoxNum } from './box.js';
import { getVmixInfo, updateVmixInfo } from './vmix-info.js';
import { renderVmixWeb } from './vmix-web.js';

function addBox(name = '', host = '') {
    const boxes = document.getElementById('boxes');
    if (boxes.firstElementChild.classList.contains('box')) {
        boxes.insertBefore(createSwapBtn(name, host, getBoxNum()), boxes.lastElementChild);
    }
    boxes.insertBefore(createBox(name, host, getBoxNum()), boxes.lastElementChild);
}

function initConfig() {
    const urlParams = getConfigUrlParams();
    urlParams.forEach((param) => setInputValue(param.key, param.value));
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
    boxes.forEach((vmix) => execute(getApiUrl(vmix.value, request)));
}

function refreshInstances() {
    getBoxes().forEach(async (box) => {
        const info = await getVmixInfo(getBoxHost(box));
        updateVmixInfo(box, info);
    });
}

(() => {
    initConfig();
    initBoxes();

    document
        .querySelectorAll('.url-param')
        .forEach((input) => input.addEventListener('change', updateUrlParams));

    document.getElementById('renderMaster').addEventListener('click', renderVmixWeb);
    setInterval(renderVmixWeb, 1000);

    const addBtn = document.getElementById('add-box');
    addBtn.addEventListener('click', () => addBox());

    const executeBtn = document.getElementById('execute-btn');
    executeBtn.onclick = executeRawRequest;

    refreshInstances();
    setInterval(refreshInstances, 5000);
})();
