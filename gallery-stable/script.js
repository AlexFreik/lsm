import {
    getBoxUrlParams,
    getConfigUrlParams,
    setInputValue,
    updateUrlParams,
    updateGalleryUrlInput,
    getAvailableMics,
} from './tools.js';
import { addBox } from './box.js';
import { addRow } from './row.js';

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

function updateBoxes() {
    document.getElementById('gallery').innerHTML = '';
    const urlParams = getBoxUrlParams();
    urlParams.forEach((param) => {
        addBox(param.key, param.value.substring(0, 2), param.value.substring(2));
    });
}

function setInputElements() {
    const urlParams = getConfigUrlParams();
    urlParams.forEach((param) => setInputValue(param.key, param.value));
}

(() => {
    updateGalleryUrlInput();
    setInputElements();
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
