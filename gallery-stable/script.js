import {
    getBoxUrlParams,
    getConfigUrlParams,
    updateUrlParams,
    updateGalleryUrlInput,
    getAvailableMics,
} from './tools.js';
import { createBox } from './box.js';
import { createRow } from './row.js';

function addRow(name = '', type = 'YT', value = '') {
    const dataRows = document.getElementById('data-rows');
    dataRows.appendChild(createRow(name, type, value));
}

function initRows() {
    document.getElementById('data-rows').innerHTML = '';
    const urlParams = getBoxUrlParams();
    if (urlParams.length === 0) {
        addRow();
    }
    urlParams.forEach((param) => {
        addRow(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function updateRows() {
    updateUrlParams();
    updateBoxes();
}

function addBox(name = '', type = 'YT', value = '') {
    const gallery = document.getElementById('gallery');
    gallery.appendChild(createBox(name, type, value));
}

function updateBoxes() {
    document.getElementById('gallery').innerHTML = '';
    const urlParams = getBoxUrlParams();
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

(() => {
    updateGalleryUrlInput();
    initConfig(); // take all config params from URL and apply to config elements
    window.mics = [];
    initRows();
    updateBoxes();

    document.querySelectorAll('.url-param').forEach((input) => {
        input.addEventListener('change', updateUrlParams);
    });

    document.getElementById('update-gallery-url').addEventListener('click', () => {
        const galleryUrl = document.getElementById('gallery-url');
        window.location.href = galleryUrl.value;
    });

    document.getElementById('add-data-row').addEventListener('click', () => addRow());
    document.getElementById('update-rows').addEventListener('click', () => updateRows());

    const dataRows = document.getElementById('data-rows');
    new Sortable(dataRows, {
        animation: 150,
        handle: '.handle', // Draggable by the entire row
        ghostClass: 'bg-base-300', // Adds a class for the dragged item
    });
})();

(async () => {
    window.mics = await getAvailableMics();
    initRows();
})();
